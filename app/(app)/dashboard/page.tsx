import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StreakCalendar } from '@/components/dashboard/StreakCalendar'
import { TopNav } from '@/components/nav/TopNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getLevel, xpToNextLevel } from '@/lib/constants'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: streak }, { data: recentAttempts }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('user_attempts')
      .select('*, challenges(title, track, difficulty)')
      .eq('user_id', user.id)
      .order('attempted_at', { ascending: false })
      .limit(7),
  ])

  const xpInfo = xpToNextLevel(profile?.xp_total ?? 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <TopNav isAuth />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginBottom: 4 }}>
            Welcome back, {profile?.display_name ?? profile?.username ?? 'friend'} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>
            {streak?.current_streak ? `${streak.current_streak}-day streak. Keep it going!` : "Start today's challenge to begin your streak."}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="max-md:grid-cols-1">
          {/* Streak Calendar */}
          <StreakCalendar
            currentStreak={streak?.current_streak ?? 0}
            longestStreak={streak?.longest_streak ?? 0}
            lastActiveDate={streak?.last_active_date ?? null}
          />

          {/* XP & Level */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 20 }}>Level Progress</h3>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>Level {xpInfo.level}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>{xpInfo.current}/{xpInfo.needed} XP</span>
              </div>
              <div style={{ background: 'var(--color-bg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-gold)', height: '100%', width: `${Math.min(100, (xpInfo.current / xpInfo.needed) * 100)}%`, transition: 'width 0.5s ease', borderRadius: 4 }} />
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--color-gold)' }}>{profile?.xp_total ?? 0}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginTop: 4 }}>Total XP earned</div>
            </div>
          </Card>
        </div>

        {/* Today's Challenge CTA */}
        <Card style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: 6 }}>Today</p>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Ready for today's challenge?</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>5 minutes. One question. Daily progress.</p>
          </div>
          <Link href="/challenge">
            <Button size="lg">Start Challenge →</Button>
          </Link>
        </Card>

        {/* Recent Activity */}
        {recentAttempts && recentAttempts.length > 0 && (
          <Card>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 20 }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentAttempts.map((attempt: any) => (
                <div key={attempt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <p style={{ fontSize: 14, marginBottom: 2 }}>{attempt.challenges?.title ?? 'Challenge'}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {attempt.challenges?.track} · {attempt.challenges?.difficulty}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {attempt.xp_earned > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-gold)' }}>+{attempt.xp_earned} XP</span>
                    )}
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: attempt.is_correct ? 'var(--color-correct)' : 'var(--color-wrong)', display: 'block' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
