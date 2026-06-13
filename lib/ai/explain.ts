import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ExplainInput {
  question: string
  codeSnippet?: string | null
  options: { label: string; text: string; is_correct: boolean }[]
  selectedIndex: number
}

export async function streamExplanation(input: ExplainInput) {
  const correct = input.options.find(o => o.is_correct)
  const selected = input.options[input.selectedIndex]

  const userMessage = `
Question: ${input.question}
${input.codeSnippet ? `\nCode:\n${input.codeSnippet}` : ''}

Options:
${input.options.map((o, i) => `${o.label}. ${o.text}${o.is_correct ? ' ✓ (correct)' : ''}`).join('\n')}

The user selected: ${selected?.label}. ${selected?.text}
The correct answer is: ${correct?.label}. ${correct?.text}

Explain why the selected answer is wrong and why the correct answer is right. Be concise and practical.
`

  return client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: 'You are a data expert. Explain in plain English why a student got a question wrong. Use at most 3 short paragraphs. Be encouraging, specific, and practical. No markdown headers.',
    messages: [{ role: 'user', content: userMessage }],
  })
}
