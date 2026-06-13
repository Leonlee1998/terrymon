import Link from 'next/link'

interface Props {
  icon: string
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ icon, title, subtitle, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="font-semibold text-ink text-base">{title}</p>
      {subtitle && <p className="text-sm text-slate-t mt-1 max-w-xs">{subtitle}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
