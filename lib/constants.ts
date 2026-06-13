export const TRACKS = {
  sql: { label: 'SQL', tag: 'SQL_', color: '#A8C4E0' },
  python: { label: 'Python', tag: 'PY_', color: '#B8A9E0' },
  excel: { label: 'Excel', tag: 'XL_', color: '#A0C878' },
  biz: { label: 'Business Case', tag: 'BIZ_', color: '#E0C4A0' },
} as const

export type Track = keyof typeof TRACKS

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export type Difficulty = typeof DIFFICULTIES[number]

export const XP = {
  correct: 10,
  speedBonus: 5,
  speedThresholdMs: 30000,
  hardMultiplier: 1.5,
  retryXp: 5,
} as const

export const LEVELS = [0, 100, 250, 500, 1000, 2000, 4000, 7500, 12000, 20000]

export function getLevel(xp: number): number {
  return LEVELS.filter(threshold => xp >= threshold).length
}

export function xpToNextLevel(xp: number): { current: number; needed: number; level: number } {
  const level = getLevel(xp)
  const current = xp - (LEVELS[level - 1] ?? 0)
  const needed = (LEVELS[level] ?? LEVELS[LEVELS.length - 1]) - (LEVELS[level - 1] ?? 0)
  return { current, needed, level }
}
