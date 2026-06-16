import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const tones: Record<Tone, string> = {
  neutral: 'bg-muted text-slate-t',
  success: 'bg-primary-bg text-primary',
  warning: 'bg-accent-light text-accent',
  danger: 'bg-red-50 text-error',
  info: 'bg-sky-50 text-info',
}

export function Badge({ tone = 'neutral', children, className }: {
  tone?: Tone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  )
}
