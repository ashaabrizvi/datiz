'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function TopNav({ isAuth = false }: { isAuth?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header style={{ background: 'rgba(28,28,28,0.92)', backdropFilter: 'blur(12px)' }}
        className="sticky top-0 z-50 border-b border-[--color-border] px-10 py-6 flex items-center justify-between max-md:px-5 max-md:py-4">
        <Link href="/" className="font-[--font-mono] text-[18px] text-[--color-gold] font-medium tracking-[0.08em]">
          DATIZ
        </Link>

        {/* Desktop nav */}
        {isAuth ? (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-[13px] text-[--color-text-muted] hover:text-[--color-text] transition-colors">Dashboard</Link>
            <Link href="/challenge" className="text-[13px] text-[--color-text-muted] hover:text-[--color-text] transition-colors">Challenge</Link>
            <Link href="/leaderboard" className="text-[13px] text-[--color-text-muted] hover:text-[--color-text] transition-colors">Leaderboard</Link>
            <Button size="sm" variant="outline">Profile</Button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-[13px] text-[--color-text-muted] hover:text-[--color-text] transition-colors">Sign in</Link>
            <a href="#waitlist"><Button size="sm">Join Waitlist</Button></a>
          </nav>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <span className="block w-5 h-[1.5px] bg-[--color-text]" />
          <span className="block w-5 h-[1.5px] bg-[--color-text]" />
          <span className="block w-4 h-[1.5px] bg-[--color-text]" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <nav className="relative ml-auto w-[280px] h-full bg-[--color-bg-elevated] border-l border-[--color-border] p-8 flex flex-col gap-6">
            <button onClick={() => setOpen(false)} className="self-end text-[--color-text-muted] text-[20px] leading-none cursor-pointer">✕</button>
            <Link href="/" onClick={() => setOpen(false)} className="font-[--font-mono] text-[16px] text-[--color-gold] tracking-[0.08em]">DATIZ</Link>
            {isAuth ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-[15px] text-[--color-text]">Dashboard</Link>
                <Link href="/challenge" onClick={() => setOpen(false)} className="text-[15px] text-[--color-text]">Today's Challenge</Link>
                <Link href="/leaderboard" onClick={() => setOpen(false)} className="text-[15px] text-[--color-text]">Leaderboard</Link>
                <Link href="/profile" onClick={() => setOpen(false)} className="text-[15px] text-[--color-text]">Profile</Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-[15px] text-[--color-text]">Sign in</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="text-[15px] text-[--color-text]">Create account</Link>
                <a href="#waitlist" onClick={() => setOpen(false)}><Button>Join Waitlist</Button></a>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
