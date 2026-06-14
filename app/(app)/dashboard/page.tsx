import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StreakCalendar } from '@/components/dashboard/StreakCalendar'
import { TopNav } from '@/components/nav/TopNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { xpToNextLevel } from '@/lib/constants'

const TRACK_LABELS: Record<string, string> = {
  sql: 'SQL', python: 'Python', excel: 'Excel', biz: 'Biz Case',
}
const TRACK_COLORS: Record<string, string> = {
  sql: '#A8C4E0', python: '#B8A9E0', excel: '#A0C878', biz: '#E0C4A0',
}

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
      .limit(10),
  ])

  const xpInfo = xpToNextLevel(profile?.xp_total ?? 0)
  const totalAttempts = recentAttempts?.length ?? 0
  const correctCount = recentAttempts?.filter((a: any) => a.is_correct).length ?? 0
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0
  const todayStr = new Date().toISOString().split('T')[0]
  const completedToday = recentAttempts?.some((a: any) => a.attempted_at?.startsWith(todayStr))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <TopNav isAuth />
      <main style={{ maxWidth: 920, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold)', marginBottom: 8 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 4vw, 34px)', marginBottom: 6 }}>
            Welcome back, {profile?.display_name ?? profile?.username ?? 'friend'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            {streak?.current_streak
              ? `🔥 ${streak.current_streak}-day streak — keep it alive today.`
              : completedToday
              ? '✓ Challenge done for today. See you tomorrow!'
              : "Complete today's challenge to start your streak."}
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="max-md:grid-cols-2">
          {[
            { label: 'Total XP', value: (profile?.xp_total ?? 0).toLocaleString(), accent: true },
            { label: 'Level', value: `${xpInfo.level}`, accent: false },
            { label: 'Accuracy', value: `${accuracy}%`, accent: false },
            { label: 'Best Streak', value: `${streak?.longest_streak ?? 0}d`, accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: 12, padding: '20px 16px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: accent ? 'var(--color-gold)' : 'var(--color-text)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Today's Challenge CTA */}
        <div style={{
          background: completedToday ? 'var(--color-bg-card)' : 'linear-gradient(135deg, rgba(201,169,110,0.12) 0%, rgba(201,169,110,0.04) 100%)',
          border: `1px solid ${completedToday ? 'var(--color-border)' : 'rgba(201,169,110,0.4)'}`,
          borderRadius: 12, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          marginBottom: 20,
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: 8 }}>
              {completedToday ? '✓ Completed' : '⚡ Daily Challenge'}
            </p>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 4 }}>
              {completedToday ? "You're done for today!" : "Ready for today's challenge?"}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {completedToday ? 'Come back tomorrow to keep your streak alive.' : '5 minutes. One sharp question. Daily progress.'}
            </p>
          </div>
          <Link href="/challenge">
            <Button size="lg" variant={completedToday ? 'outline' : 'primary'}>
              {completedToday ? 'Review Challenge' : 'Start Challenge →'}
            </Button>
          </Link>
        </div>

        {/* Streak Calendar + Level Progress */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="max-md:grid-cols-1">
          <StreakCalendar
            currentStreak={streak?.current_streak ?? 0}
            longestStreak={streak?.longest_streak ?? 0}
            lastActiveDate={streak?.last_active_date ?? null}
          />

          <Card>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 20 }}>Level Progress</h3>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-gold)', letterSpacing: '0.06em' }}>Level {xpInfo.level}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>{xpInfo.current}/{xpInfo.needed} XP</span>
              </div>
              <div style={{ background: 'var(--color-bg)', borderRadius: 4, height: 7, overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-gold)', height: '100%', width: `${Math.min(100, (xpInfo.current / xpInfo.needed) * 100)}%`, transition: 'width 0.5s ease', borderRadius: 4 }} />
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                {xpInfo.needed - xpInfo.current} XP to Level {xpInfo.level + 1}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--color-gold)' }}>{profile?.xp_total ?? 0}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Total XP</div>
              </div>
              <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: accuracy >= 70 ? 'var(--color-correct)' : 'var(--color-text)' }}>{accuracy}%</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Accuracy</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        {recentAttempts && recentAttempts.length > 0 ? (
          <Card>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 20 }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentAttempts.map((attempt: any, i: number) => (
                <div key={attempt.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < recentAttempts.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: attempt.is_correct ? 'var(--color-correct)' : 'var(--color-wrong)',
                    }} />
                    <div>
                      <p style={{ fontSize: 14, marginBottom: 2 }}>{attempt.challenges?.title ?? 'Challenge'}</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: TRACK_COLORS[attempt.challenges?.track] ?? 'var(--color-text-muted)' }}>
                        {TRACK_LABELS[attempt.challenges?.track] ?? attempt.challenges?.track} · {attempt.challenges?.difficulty}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {attempt.xp_earned > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-gold)' }}>+{attempt.xp_earned} XP</span>
                    )}
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {new Date(attempt.attempted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 8 }}>No challenges yet</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
              Complete your first challenge to start building your streak and XP.
            </p>
            <Link href="/challenge">
              <Button size="lg">Start Today's Challenge →</Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  )
}
