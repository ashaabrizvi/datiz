'use client'
import { TopNav } from '@/components/nav/TopNav'
import { WaitlistForm } from '@/components/landing/WaitlistForm'
import { StreakDemo } from '@/components/landing/StreakDemo'
import { ChallengePreview } from '@/components/landing/ChallengePreview'

const TRACKS = [
  { tag: 'SQL_', name: 'SQL', desc: 'Window functions, CTEs, optimization, real query scenarios.' },
  { tag: 'PY_', name: 'Python', desc: 'Pandas, data wrangling, automation, and analytics scripts.' },
  { tag: 'XL_', name: 'Excel', desc: 'Pivot tables, VLOOKUP, dashboards, and business formulas.' },
  { tag: 'BIZ_', name: 'Business Case', desc: 'Consulting-style scenarios. Structure your thinking like an analyst.' },
]

const FEATURES = [
  { icon: '🔥', title: 'Daily Streaks', desc: 'Miss a day and your streak breaks. That\'s the point. Consistency beats cramming every time.' },
  { icon: '🏆', title: 'Leaderboard', desc: 'See how you rank against other data professionals. Real competition drives real learning.' },
  { icon: '🎯', title: 'Interview-focused', desc: 'Every question mirrors what top companies actually ask. Bain, McKinsey, Google-level rigor.' },
  { icon: '⚡', title: '5 minutes daily', desc: 'Not a course. Not a bootcamp. One sharp challenge a day that fits into your morning routine.' },
  { icon: '🤖', title: 'AI Explanations', desc: 'Wrong answer? Get a plain-English breakdown of exactly why — powered by Claude AI.' },
  { icon: '📈', title: 'Progress Tracking', desc: 'Watch your accuracy improve over time across SQL, Python, Excel, and Business Cases.' },
]

const AUDIENCE = ['Data Analysts', 'Data Engineers', 'BI Developers', 'Analytics Engineers', 'CS Students', 'MBA Aspirants', 'Consulting Preps', 'SQL Beginners', 'Career Switchers']

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
      <TopNav />

      {/* Hero */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
          <span style={{ display: 'block', width: 32, height: 1, background: 'rgba(201,169,110,0.5)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-gold)' }}>
            The Duolingo for Data Professionals
          </span>
          <span style={{ display: 'block', width: 32, height: 1, background: 'rgba(201,169,110,0.5)' }} />
        </div>

        {/* H1 */}
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.12, letterSpacing: '-0.02em', marginBottom: 20 }}>
          Become <span style={{ color: 'var(--color-gold)' }}>1% Better</span> at Data Every Day
        </h1>

        <p style={{ fontSize: 17, color: 'var(--color-text-muted)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Daily SQL, Python, Excel, Analytics and AI challenges — designed for data professionals who want to stay sharp, interview-ready, and ahead of the curve.
        </p>

        {/* Streak */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <StreakDemo />
        </div>

        {/* Waitlist */}
        <div id="waitlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <WaitlistForm source="hero" />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
            Free to join. No spam. Ever.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginTop: 48 }}>
          {[['5 min', 'Daily commitment'], ['4', 'Challenge tracks'], ['∞', 'Career upside']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--color-text)' }}>{num}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 860, margin: '0 auto', height: 1, background: 'var(--color-border)' }} />

      {/* Tracks */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 40px)', textAlign: 'center', marginBottom: 40 }}>
          One challenge. Four tracks. Every single day.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {TRACKS.map(t => (
            <div key={t.name} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '24px 20px', transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold)', marginBottom: 10 }}>{t.tag}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 8 }}>{t.name}</div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Challenge Preview */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 20 }}>
          Try a sample question
        </p>
        <ChallengePreview />
      </section>

      <div style={{ maxWidth: 860, margin: '0 auto', height: 1, background: 'var(--color-border)' }} />

      {/* Features */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 40px)', textAlign: 'center', marginBottom: 48 }}>
          Built for how data professionals actually learn.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '28px 24px' }}>
              <div style={{ fontSize: 22, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 8 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 3.5vw, 34px)', marginBottom: 28 }}>
          If data is your career, DATIZ is your daily edge.
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {AUDIENCE.map(tag => (
            <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 16px', borderRadius: 100, border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginBottom: 16 }}>Early access</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 40px)', marginBottom: 12 }}>Be first in. Get lifetime benefits.</h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            Join the waitlist. First 100 users get free premium access at launch.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <WaitlistForm source="cta" />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-gold)' }}>DATIZ</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>thedataguy.ai · Built for data professionals</span>
      </footer>
    </div>
  )
}
