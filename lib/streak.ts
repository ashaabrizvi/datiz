export interface StreakData {
  current_streak: number
  longest_streak: number
  last_active_date: string | null
}

export function calcStreak(existing: StreakData | null): StreakData {
  const today = new Date().toISOString().split('T')[0]

  if (!existing || !existing.last_active_date) {
    return { current_streak: 1, longest_streak: 1, last_active_date: today }
  }

  const last = existing.last_active_date
  if (last === today) {
    return existing
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = last === yesterdayStr ? existing.current_streak + 1 : 1
  const longest = Math.max(newStreak, existing.longest_streak)

  return { current_streak: newStreak, longest_streak: longest, last_active_date: today }
}
