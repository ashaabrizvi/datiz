import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('published_at', today)
    .limit(1)
    .maybeSingle()

  if (!challenge) {
    const { data: fallback } = await supabase
      .from('challenges')
      .select('*')
      .order('published_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    return NextResponse.json(fallback)
  }

  return NextResponse.json(challenge)
}
