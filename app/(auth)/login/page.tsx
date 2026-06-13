'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--color-gold)', textDecoration: 'none', display: 'block', marginBottom: 40 }}>
          DATIZ
        </Link>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 8 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 32 }}>Sign in to your account to continue your streak.</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p style={{ fontSize: 13, color: 'var(--color-wrong)' }}>{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
            {loading ? 'Signing in…' : 'Sign in →'}
          </Button>
        </form>

        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
