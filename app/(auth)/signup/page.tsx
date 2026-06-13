'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
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
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 8 }}>Start your streak</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 32 }}>Create an account. It's free — forever.</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Username</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="datasniper" required minLength={3} maxLength={20} />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="min 8 characters" required minLength={8} />
          </div>
          {error && <p style={{ fontSize: 13, color: 'var(--color-wrong)' }}>{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
            {loading ? 'Creating account…' : 'Create account →'}
          </Button>
        </form>

        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Already have one?{' '}
          <Link href="/login" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
