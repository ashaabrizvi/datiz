'use client'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface Props {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
}

export function StreakCalendar({ currentStreak, longestStreak, lastActiveDate }: Props) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (27 - i))
    const dateStr = d.toISOString().split('T')[0]
    const isToday = dateStr === todayStr
    const isPast = dateStr < todayStr

    let done = false
    if (lastActiveDate && isPast) {
      const diff = (new Date(todayStr).getTime() - new Date(dateStr).getTime()) / 86400000
      done = diff <= currentStreak
    }
    if (lastActiveDate === todayStr && isToday) done = true

    return { label: DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1], isToday, done }
  })

  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17 }}>Your Streak</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--color-gold)' }}>{currentStreak}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22 }}>{longestStreak}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Best</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {days.map((day, i) => (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
            ...(day.done ? { background: 'var(--color-gold)', color: 'var(--color-bg)' }
              : day.isToday ? { background: 'transparent', border: '1.5px solid var(--color-gold)', color: 'var(--color-gold)', boxShadow: '0 0 10px rgba(201,169,110,0.25)' }
              : { background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' })
          }}>
            {day.label}
          </div>
        ))}
      </div>
    </div>
  )
}
