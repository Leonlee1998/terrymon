import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-md border border-border-t bg-white px-3 text-sm text-ink',
          'placeholder:text-slate-t/60 focus:outline-none focus:ring-2 focus:ring-ring/40',
          className
        )}
        {...props}
      />
    )
  }
)
