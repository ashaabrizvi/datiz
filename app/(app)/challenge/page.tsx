import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/nav/TopNav'
import { QuizFlow } from '@/components/challenge/QuizFlow'
import Link from 'next/link'

export default async function ChallengePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // Try today's challenge first
  let { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('published_at', today)
    .maybeSingle()

  // Fallback: find first unattempted challenge
  if (!challenge) {
    const { data: attempted } = await supabase
      .from('user_attempts')
      .select('challenge_id')
      .eq('user_id', user.id)

    const attemptedIds = attempted?.map((a: any) => a.challenge_id) ?? []

    const query = supabase.from('challenges').select('*').order('published_at', { ascending: true })
    const { data: all } = await query.limit(50)

    const next = all?.find((c: any) => !attemptedIds.includes(c.id))
    challenge = next ?? all?.[0] ?? null
  }

  const trackLabel: Record<string, string> = { sql: 'SQL', python: 'Python', excel: 'Excel', biz: 'Business Case' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <TopNav isAuth />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {challenge && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '3px 8px', borderRadius: 4, border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}>
                {trackLabel[challenge.track] ?? challenge.track} · {challenge.difficulty}
              </span>
            )}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 4vw, 30px)' }}>
            {challenge?.title ?? "Today's Challenge"}
          </h1>
        </div>

        {challenge ? (
          <QuizFlow challenge={challenge} />
        ) : (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 8 }}>No challenges loaded yet</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto 24px', lineHeight: 1.7 }}>
              The challenge database is empty. Run the seed migration in Supabase to load questions.
            </p>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-gold)',
              textDecoration: 'none', letterSpacing: '0.06em',
            }}>← Back to Dashboard</Link>
          </div>
        )}
      </main>
    </div>
  )
}
