import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamExplanation } from '@/lib/ai/explain'
import { z } from 'zod'

const schema = z.object({
  challenge_id: z.string().uuid(),
  selected_option: z.number().int().min(0).max(3),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid input', { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: challenge } = await supabase
    .from('challenges')
    .select('question, code_snippet, options')
    .eq('id', parsed.data.challenge_id)
    .single()

  if (!challenge) return new Response('Not found', { status: 404 })

  const stream = await streamExplanation({
    question: challenge.question,
    codeSnippet: challenge.code_snippet,
    options: challenge.options,
    selectedIndex: parsed.data.selected_option,
  })

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  )
}
