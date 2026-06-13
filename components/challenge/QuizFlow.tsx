'use client'
import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TRACKS } from '@/lib/constants'

interface Challenge {
  id: string
  track: string
  difficulty: string
  title: string
  question: string
  code_snippet?: string | null
  options: { label: string; text: string; is_correct: boolean }[]
  explanation?: string | null
}

type Step = 'answering' | 'result' | 'explaining'

export function QuizFlow({ challenge }: { challenge: Challenge }) {
  const [step, setStep] = useState<Step>('answering')
  const [selected, setSelected] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [aiExplanation, setAiExplanation] = useState('')
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [timeLeft, setTimeLeft] = useState(90)
  const startTime = useRef(Date.now())
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const track = TRACKS[challenge.track as keyof typeof TRACKS]

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  async function selectOption(i: number) {
    if (selected !== null) return
    clearInterval(timerRef.current)
    setSelected(i)
    const timeTaken = Date.now() - startTime.current

    const res = await fetch('/api/challenge/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: challenge.id, selected_option: i, time_taken_ms: timeTaken }),
    })
    const data = await res.json()
    setIsCorrect(data.is_correct)
    setXpEarned(data.xp_earned ?? 0)
    setTimeout(() => setStep('result'), 400)
  }

  async function explainMistake() {
    setStep('explaining')
    setLoadingExplain(true)
    setAiExplanation('')

    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: challenge.id, selected_option: selected }),
    })

    setLoadingExplain(false)
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    if (!reader) return

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setAiExplanation(prev => prev + decoder.decode(value))
    }
  }

  const timerPct = (timeLeft / 90) * 100
  const timerColor = timeLeft > 30 ? 'var(--color-correct)' : timeLeft > 10 ? 'var(--color-gold)' : 'var(--color-wrong)'

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Progress timer */}
      <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 4, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ background: timerColor, width: `${timerPct}%`, height: '100%', transition: 'width 1s linear, background 0.5s' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge color={track?.color}>{track?.label ?? challenge.track}</Badge>
          <Badge>{challenge.difficulty}</Badge>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: timeLeft <= 10 ? 'var(--color-wrong)' : 'var(--color-text-muted)' }}>
          {timeLeft}s
        </span>
      </div>

      {/* Question */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.5, marginBottom: 20 }}>
        {challenge.question}
      </h2>

      {/* Code snippet */}
      {challenge.code_snippet && (
        <pre style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 16, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.65, overflowX: 'auto', marginBottom: 24, whiteSpace: 'pre-wrap' }}>
          <code>{challenge.code_snippet}</code>
        </pre>
      )}

      {/* Options */}
      {step === 'answering' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="max-sm:grid-cols-1">
          {challenge.options.map((opt, i) => (
            <button key={i} onClick={() => selectOption(i)} disabled={selected !== null}
              style={{
                textAlign: 'left', padding: '14px 16px', background: 'var(--color-bg-elevated)',
                border: `1px solid ${selected === i ? (opt.is_correct ? '#6EAF8A' : '#AF6E6E') : 'var(--color-border)'}`,
                borderRadius: 8, cursor: selected !== null ? 'default' : 'pointer',
                color: selected === i ? (opt.is_correct ? '#6EAF8A' : '#AF6E6E') : 'var(--color-text)',
                opacity: selected !== null && selected !== i ? 0.45 : 1,
                transition: 'all 0.25s', fontSize: 13, fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginRight: 8 }}>{opt.label}.</span>
              {opt.text}
            </button>
          ))}
        </div>
      )}

      {/* Result */}
      {(step === 'result' || step === 'explaining') && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 16, borderRadius: 10, background: isCorrect ? 'rgba(110,175,138,0.1)' : 'rgba(175,110,110,0.1)', border: `1px solid ${isCorrect ? '#6EAF8A44' : '#AF6E6E44'}` }}>
            <span style={{ fontSize: 20 }}>{isCorrect ? '✓' : '✗'}</span>
            <div>
              <p style={{ fontWeight: 500, color: isCorrect ? 'var(--color-correct)' : 'var(--color-wrong)', fontSize: 15 }}>
                {isCorrect ? `Correct! +${xpEarned} XP` : 'Not quite.'}
              </p>
              {!isCorrect && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Correct: {challenge.options.find(o => o.is_correct)?.label}. {challenge.options.find(o => o.is_correct)?.text}
              </p>}
            </div>
          </div>

          {challenge.explanation && (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 20, padding: '16px 0', borderTop: '1px solid var(--color-border)' }}>
              {challenge.explanation}
            </p>
          )}

          {/* AI Explanation */}
          {step === 'explaining' && (
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>🤖 AI Explanation</p>
              {loadingExplain ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Thinking…</p>
              ) : (
                <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiExplanation}</p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!isCorrect && step === 'result' && (
              <Button variant="outline" onClick={explainMistake}>🤖 Explain my mistake</Button>
            )}
            <a href="/challenge">
              <Button>Next Challenge →</Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
