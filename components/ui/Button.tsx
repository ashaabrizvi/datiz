'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-[--font-sans] font-medium transition-opacity rounded-[--radius-card] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
    const variants = {
      primary: 'bg-[--color-gold] text-[--color-bg] hover:opacity-85',
      ghost: 'bg-transparent text-[--color-text-muted] hover:text-[--color-text]',
      outline: 'bg-transparent border border-[--color-border] text-[--color-text] hover:border-[--color-gold]',
    }
    const sizes = {
      sm: 'text-[12px] px-[14px] py-[8px]',
      md: 'text-[13px] px-[20px] py-[10px]',
      lg: 'text-[14px] px-[24px] py-[14px]',
    }
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
