import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string
}

export function Badge({ color, className = '', children, ...props }: BadgeProps) {
  return (
    <span
      style={color ? { color, borderColor: color + '44', backgroundColor: color + '11' } : undefined}
      className={`inline-flex items-center gap-1 font-[--font-mono] text-[10px] uppercase tracking-[0.12em] px-[10px] py-[4px] rounded-full border border-[--color-border] text-[--color-text-muted] ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
