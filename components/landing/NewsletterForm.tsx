'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter' }),
      })
      await res.json()
      setStatus('done')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-gold)', letterSpacing: '0.06em' }}>
        ✓ You're subscribed. Talk soon.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 420 }}>
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
          style={{ minWidth: 200, flex: 1 }}
        />
        <Button type="submit" size="lg" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing…' : 'Subscribe →'}
        </Button>
      </form>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
        Weekly. No spam. Unsubscribe anytime.
      </p>
      {status === 'error' && (
        <p style={{ fontSize: 12, color: 'var(--color-wrong)' }}>Something went wrong. Try again.</p>
      )}
    </div>
  )
}
