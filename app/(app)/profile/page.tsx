import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TopNav } from '@/components/nav/TopNav'
import { Card } from '@/components/ui/Card'
import { getLevel, xpToNextLevel } from '@/lib/constants'

const TRACK_COLORS: Record<string, string> = {
  sql: '#A8C4E0',
  python: '#B8A9E0',
  excel: '#A0C878',
  biz: '#E0C4A0',
}

const TRACK_LABELS: Record<string, string> = {
  sql: 'SQL',
  python: 'Python',
  excel: 'Excel',
  biz: 'Business Case',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: streak }, { data: attempts }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('user_attempts')
      .select('*, challenges(track, difficulty)')
      .eq('user_id', user.id)
      .order('attempted_at', { ascending: false }),
  ])

  const xpInfo = xpToNextLevel(profile?.xp_total ?? 0)

  const totalAttempts = attempts?.length ?? 0
  const correct = attempts?.filter((a: any) => a.is_correct).length ?? 0
  const accuracy = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 0

  // Group by track
  const trackStats: Record<string, { total: number; correct: number }> = {}
  for (const a of attempts ?? []) {
    const track = (a as any).challenges?.track ?? 'unknown'
    if (!trackStats[track]) trackStats[track] = { total: 0, correct: 0 }
    trackStats[track].total++
    if ((a as any).is_correct) trackStats[track].correct++
  }

  const joinDate = new Date(user.created_at ?? Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <TopNav isAuth />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

        {/* Profile Header */}
        <Card style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-gold) 0%, rgba(201,169,110,0.4) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--color-bg)',
          }}>
            {(profile?.username ?? profile?.display_name ?? 'U')[0].toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 4 }}>
              {profile?.display_name ?? profile?.username ?? 'Data Learner'}
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: 12 }}>
              @{profile?.username ?? 'user'} · Member since {joinDate}
            </p>

            {/* XP bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold)' }}>Level {xpInfo.level}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>{xpInfo.current}/{xpInfo.needed} XP to next level</span>
              </div>
              <div style={{ background: 'var(--color-bg)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{
                  background: 'var(--color-gold)', height: '100%', borderRadius: 4,
                  width: `${Math.min(100, (xpInfo.current / xpInfo.needed) * 100)}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="max-md:grid-cols-2">
          {[
            { label: 'Total XP', value: (profile?.xp_total ?? 0).toLocaleString(), color: 'var(--color-gold)' },
            { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 70 ? 'var(--color-correct)' : 'var(--color-text)' },
            { label: 'Streak', value: `${streak?.current_streak ?? 0}d`, color: 'var(--color-gold)' },
            { label: 'Best Streak', value: `${streak?.longest_streak ?? 0}d`, color: 'var(--color-text)' },
          ].map(({ label, value, color }) => (
            <Card key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color, marginBottom: 4 }}>{value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>{label}</div>
            </Card>
          ))}
        </div>

        {/* Track Breakdown */}
        {Object.keys(trackStats).length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 20 }}>Performance by Track</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(trackStats).map(([track, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100)
                const color = TRACK_COLORS[track] ?? 'var(--color-gold)'
                return (
                  <div key={track}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color }}>
                        {TRACK_LABELS[track] ?? track.toUpperCase()}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {stats.correct}/{stats.total} · {pct}%
                      </span>
                    </div>
                    <div style={{ background: 'var(--color-bg)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                      <div style={{ background: color, height: '100%', borderRadius: 4, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* No activity state */}
        {totalAttempts === 0 && (
          <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 8 }}>No challenges completed yet</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>Complete your first challenge to see your performance stats here.</p>
            <Link href="/challenge" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--color-gold)', color: 'var(--color-bg)',
              fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
              padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
            }}>Start Today's Challenge →</Link>
          </Card>
        )}
      </main>
    </div>
  )
}
