'use client'
import { InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`bg-[--color-bg-card] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] rounded-[--radius-card] px-[18px] py-[14px] text-[14px] font-[--font-sans] outline-none focus:border-[--color-gold] transition-colors w-full ${className}`}
      {...props}
    />
  )
)
Input.displayName = 'Input'
