'use client'
import { useEffect, useRef } from 'react'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function StreakDemo() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const total = 21
    const doneUntil = 5

    Array.from({ length: total }).forEach((_, i) => {
      const div = document.createElement('div')
      div.textContent = DAYS[i % 7]

      const baseStyle = 'width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-family:var(--font-mono);font-weight:500;transition:all 0.2s;'

      if (i < doneUntil) {
        div.setAttribute('style', baseStyle + 'background:#C9A96E;color:#1C1C1C;')
      } else if (i === doneUntil) {
        div.setAttribute('style', baseStyle + 'background:transparent;border:1.5px solid #C9A96E;color:#C9A96E;box-shadow:0 0 10px rgba(201,169,110,0.25);')
      } else {
        div.setAttribute('style', baseStyle + 'background:#242424;border:1px solid #333333;color:#8A8480;')
      }

      ref.current!.appendChild(div)
    })
  }, [])

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <span className="font-[--font-mono] text-[10px] uppercase tracking-[0.12em] text-[--color-text-muted]">
        Your streak this month
      </span>
      <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '210px' }} />
    </div>
  )
}
