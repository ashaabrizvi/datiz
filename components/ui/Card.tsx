import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export function Card({ elevated, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[--radius-card] border border-[--color-border] p-6 ${elevated ? 'bg-[--color-bg-elevated]' : 'bg-[--color-bg-card]'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
