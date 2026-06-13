import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('leaderboard_weekly')
    .select('*')
    .order('weekly_xp', { ascending: false })
    .limit(50)

  return NextResponse.json(data ?? [])
}
