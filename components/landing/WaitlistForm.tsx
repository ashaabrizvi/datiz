'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function WaitlistForm({ source = 'hero' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      setMessage(data.message ?? 'You\'re on the list!')
      setStatus('done')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Try again.')
    }
  }

  if (status === 'done') {
    return (
      <p className="font-[--font-mono] text-[13px] text-[--color-gold] tracking-[0.06em]">
        ✓ {message}
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="flex gap-3 flex-wrap">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="min-w-[220px] flex-1"
        disabled={status === 'loading'}
      />
      <Button type="submit" size="lg" disabled={status === 'loading'}>
        {status === 'loading' ? 'Joining…' : 'Join Waitlist →'}
      </Button>
      {status === 'error' && (
        <p className="w-full text-[12px] text-[--color-wrong]">{message}</p>
      )}
    </form>
  )
}
