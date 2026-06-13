import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { calcStreak } from '@/lib/streak'
import { XP } from '@/lib/constants'

const schema = z.object({
  challenge_id: z.string().uuid(),
  selected_option: z.number().int().min(0).max(3),
  time_taken_ms: z.number().int().min(0),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challenge_id, selected_option, time_taken_ms } = parsed.data

  const { data: challenge } = await supabase
    .from('challenges')
    .select('options, difficulty')
    .eq('id', challenge_id)
    .single()

  if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })

  const options = challenge.options as { is_correct: boolean }[]
  const is_correct = options[selected_option]?.is_correct ?? false

  let xp_earned = 0
  if (is_correct) {
    xp_earned = XP.correct
    if (time_taken_ms < XP.speedThresholdMs) xp_earned += XP.speedBonus
    if (challenge.difficulty === 'hard') xp_earned = Math.round(xp_earned * XP.hardMultiplier)
  }

  const { error: attemptError } = await supabase.from('user_attempts').upsert({
    user_id: user.id,
    challenge_id,
    selected_option,
    is_correct,
    time_taken_ms,
    xp_earned,
  }, { onConflict: 'user_id,challenge_id', ignoreDuplicates: true })

  if (attemptError) {
    if (attemptError.code === '23505') {
      return NextResponse.json({ error: 'Already attempted' }, { status: 409 })
    }
  }

  if (is_correct) {
    const { data: existingStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const newStreak = calcStreak(existingStreak)

    await supabase.from('streaks').upsert({
      user_id: user.id,
      ...newStreak,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    await supabase.rpc('increment_xp', { uid: user.id, amount: xp_earned })
  }

  return NextResponse.json({ is_correct, xp_earned })
}
