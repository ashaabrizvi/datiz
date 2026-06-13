import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/nav/TopNav'
import { QuizFlow } from '@/components/challenge/QuizFlow'

export default async function ChallengePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  let { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('published_at', today)
    .maybeSingle()

  if (!challenge) {
    const { data: fallback } = await supabase
      .from('challenges')
      .select('*')
      .order('published_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    challenge = fallback
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <TopNav isAuth />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28 }}>
            {challenge?.title ?? "Today's Challenge"}
          </h1>
        </div>

        {challenge ? (
          <QuizFlow challenge={challenge} />
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>No challenge available today. Check back tomorrow!</p>
          </div>
        )}
      </main>
    </div>
  )
}
