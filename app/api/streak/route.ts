import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak, last_active_date')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json(data ?? { current_streak: 0, longest_streak: 0, last_active_date: null })
}
