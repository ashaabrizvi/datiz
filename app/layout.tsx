import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, DM_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DATIZ — Become 1% Better at Data Every Day',
  description: 'Daily SQL, Python, Excel, and Analytics challenges for data professionals. 5 minutes a day. Interview-ready in weeks.',
  openGraph: {
    title: 'DATIZ — The Duolingo for Data Professionals',
    description: 'Daily SQL, Python, Excel, and Analytics challenges. 5 minutes a day.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
