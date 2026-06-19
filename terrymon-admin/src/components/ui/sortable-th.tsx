import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  col: string
  label: string
  sortBy: string
  sortOrder: string
  sp: Record<string, string | undefined>
  align?: 'left' | 'right'
  className?: string
}

export function SortableTh({ col, label, sortBy, sortOrder, sp, align = 'left', className }: Props) {
  const isActive = sortBy === col
  const nextOrder = isActive && sortOrder === 'asc' ? 'desc' : 'asc'

  const p = new URLSearchParams()
  Object.entries({ ...sp, sort: col, order: nextOrder }).forEach(([k, v]) => {
    if (v != null && k !== 'page') p.set(k, v)
  })

  return (
    <th className={cn('px-4 py-3 font-medium', className)}>
      <Link
        href={`?${p}`}
        className={cn(
          'inline-flex items-center gap-1 hover:text-ink',
          align === 'right' && 'flex-row-reverse w-full justify-start',
        )}
      >
        {label}
        <span className="text-[10px] opacity-50">
          {isActive ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </Link>
    </th>
  )
}
