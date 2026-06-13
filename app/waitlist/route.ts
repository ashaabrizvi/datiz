import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional().default('hero'),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('waitlist')
    .insert({ email: parsed.data.email, source: parsed.data.source })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Already on the list!' }, { status: 200 })
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }

  return NextResponse.json({ message: 'You are on the list!' }, { status: 201 })
}
