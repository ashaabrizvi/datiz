'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function TopNav({ isAuth = false }: { isAuth?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header
        style={{ background: 'rgba(28,28,28,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        className="sticky top-0 z-50 border-b border-[--color-border]"
      >
        <div className="max-w-[1100px] mx-auto px-6 h-[60px] flex items-center justify-between max-md:px-4 max-md:h-[52px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group no-underline">
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: 'var(--color-gold)',
              textDecoration: 'none',
            }}>
              DATIZ
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              border: '1px solid var(--color-border)',
              borderRadius: 4,
              padding: '2px 5px',
              marginTop: 1,
            }}>
              BETA
            </span>
          </Link>

          {/* Desktop nav */}
          {isAuth ? (
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/challenge">Challenge</NavLink>
              <NavLink href="/leaderboard">Leaderboard</NavLink>
              <div style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 8px' }} />
              <Button size="sm" variant="outline">Profile</Button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-2">
              <NavLink href="/login">Sign in</NavLink>
              <div style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 4px' }} />
              <a href="#waitlist"><Button size="sm">Get early access →</Button></a>
            </nav>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 cursor-pointer"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-5 h-[1.5px] bg-[--color-text] transition-all" />
            <span className="block w-5 h-[1.5px] bg-[--color-text] transition-all" />
            <span className="block w-3 h-[1.5px] bg-[--color-text-muted] transition-all" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <nav className="relative ml-auto w-[300px] h-full bg-[--color-bg-elevated] border-l border-[--color-border] flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 h-[52px] border-b border-[--color-border]">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-gold)', letterSpacing: '0.18em' }}>DATIZ</span>
              <button onClick={() => setOpen(false)} className="text-[--color-text-muted] hover:text-[--color-text] transition-colors cursor-pointer text-lg leading-none">✕</button>
            </div>

            {/* Drawer links */}
            <div className="flex flex-col p-6 gap-1 flex-1">
              {isAuth ? (
                <>
                  <DrawerLink href="/dashboard" onClick={() => setOpen(false)}>📊 Dashboard</DrawerLink>
                  <DrawerLink href="/challenge" onClick={() => setOpen(false)}>⚡ Today's Challenge</DrawerLink>
                  <DrawerLink href="/leaderboard" onClick={() => setOpen(false)}>🏆 Leaderboard</DrawerLink>
                  <DrawerLink href="/profile" onClick={() => setOpen(false)}>👤 Profile</DrawerLink>
                </>
              ) : (
                <>
                  <DrawerLink href="/login" onClick={() => setOpen(false)}>Sign in</DrawerLink>
                  <DrawerLink href="/signup" onClick={() => setOpen(false)}>Create account</DrawerLink>
                  <div className="mt-4">
                    <a href="#waitlist" onClick={() => setOpen(false)}>
                      <Button className="w-full" size="lg">Get early access →</Button>
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Drawer footer */}
            <div className="px-6 py-4 border-t border-[--color-border]">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                thedataguy.ai · Built for data professionals
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, transition: 'color 0.15s, background 0.15s' }}
      className="hover:text-[--color-text] hover:bg-white/5"
    >
      {children}
    </Link>
  )
}

function DrawerLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text)', textDecoration: 'none', padding: '12px 16px', borderRadius: 10, transition: 'background 0.15s' }}
      className="hover:bg-white/5"
    >
      {children}
    </Link>
  )
}
