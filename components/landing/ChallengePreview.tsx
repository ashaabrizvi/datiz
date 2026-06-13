'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'

const OPTIONS = [
  { label: 'A', text: 'Use HAVING instead of WHERE', correct: false },
  { label: 'B', text: 'This query is correct ✓', correct: true },
  { label: 'C', text: 'Missing a JOIN clause', correct: false },
  { label: 'D', text: 'LIMIT should be FETCH FIRST', correct: false },
]

const CODE = `SELECT user_id,
       SUM(revenue) AS total_revenue
FROM   sales
WHERE  order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_revenue DESC
LIMIT  3;`

export function ChallengePreview() {
  const [selected, setSelected] = useState<number | null>(null)

  function pick(i: number) {
    if (selected !== null) return
    setSelected(i)
  }

  return (
    <div className="border border-[--color-border] rounded-[--radius-card] overflow-hidden">
      {/* Header */}
      <div className="bg-[--color-bg-elevated] border-b border-[--color-border] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-[--font-mono] text-[11px] text-[--color-text-muted]">SQL · Today's Challenge</span>
        </div>
        <Badge color="#C9A96E">Medium</Badge>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <p className="text-[15px] leading-relaxed text-[--color-text]">
          You have a <code className="font-[--font-mono] text-[--color-gold] text-[13px]">sales</code> table with columns{' '}
          <code className="font-[--font-mono] text-[--color-gold] text-[13px]">user_id</code>,{' '}
          <code className="font-[--font-mono] text-[--color-gold] text-[13px]">order_date</code>, and{' '}
          <code className="font-[--font-mono] text-[--color-gold] text-[13px]">revenue</code>. Find the top 3 users by total revenue in the last 30 days.
        </p>

        <pre className="bg-[--color-bg] border border-[--color-border] rounded-[8px] p-4 font-[--font-mono] text-[13px] leading-relaxed overflow-x-auto">
          <code>{CODE.split('\n').map((line, i) => {
            const highlighted = line
              .replace(/(SELECT|FROM|WHERE|GROUP BY|ORDER BY|LIMIT|SUM|INTERVAL|CURRENT_DATE)/g, '<span style="color:#C9A96E">$1</span>')
              .replace(/(total_revenue|user_id|order_date|revenue)/g, '<span style="color:#A8C4E0">$1</span>')
            return <span key={i} dangerouslySetInnerHTML={{ __html: highlighted + '\n' }} />
          })}</code>
        </pre>

        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === i
            const isCorrect = opt.correct

            let style: React.CSSProperties = {}
            if (selected !== null) {
              if (isSelected && isCorrect) style = { borderColor: '#6EAF8A', color: '#6EAF8A', backgroundColor: 'rgba(110,175,138,0.08)' }
              else if (isSelected && !isCorrect) style = { borderColor: '#AF6E6E', color: '#AF6E6E', backgroundColor: 'rgba(175,110,110,0.08)' }
              else style = { opacity: 0.4 }
            }

            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={selected !== null}
                style={style}
                className="text-left text-[12px] p-3 bg-[--color-bg-elevated] border border-[--color-border] rounded-[8px] font-[--font-sans] text-[--color-text] transition-all hover:border-[--color-gold] disabled:cursor-default cursor-pointer"
              >
                <span className="font-[--font-mono] text-[--color-text-muted] mr-2">{opt.label}.</span>
                {opt.text}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <p className="text-[13px] text-[--color-text-muted] leading-relaxed border-t border-[--color-border] pt-4 mt-2">
            {OPTIONS[selected].correct
              ? '✓ Correct! The query correctly filters by date before aggregating, groups by user, then limits to the top 3.'
              : '✗ Not quite. The query is already correct — HAVING would be used to filter on aggregated values, not on a date column.'}
          </p>
        )}
      </div>
    </div>
  )
}
