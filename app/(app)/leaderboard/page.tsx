import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/nav/TopNav'
import { Card } from '@/components/ui/Card'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('leaderboard_weekly')
    .select('*')
    .order('weekly_xp', { ascending: false })
    .limit(50)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <TopNav isAuth />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginBottom: 8 }}>This week</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32 }}>Leaderboard</h1>
        </div>

        <Card>
          {!rows?.length ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 0', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              No activity yet this week. Be the first!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 72px', gap: 12, padding: '0 0 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
                {['#', 'Player', 'XP', 'Correct', 'Streak'].map(h => (
                  <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>{h}</span>
                ))}
              </div>

              {rows.map((row: any, i: number) => {
                const isMe = row.id === user.id
                return (
                  <div key={row.id} style={{
                    display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 72px', gap: 12,
                    padding: '14px 0', borderBottom: '1px solid var(--color-border)',
                    background: isMe ? 'rgba(201,169,110,0.06)' : 'transparent',
                    borderRadius: isMe ? 6 : 0,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: i < 3 ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {medals[i] ?? `${i + 1}`}
                    </span>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: isMe ? 500 : 400 }}>{row.display_name ?? row.username}</span>
                      {isMe && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-gold)', marginLeft: 8 }}>you</span>}
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>Lv.{row.level}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-gold)' }}>{row.weekly_xp}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-correct)' }}>{row.correct_count}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>🔥 {row.current_streak}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
