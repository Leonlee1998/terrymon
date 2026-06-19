import Link from 'next/link'

interface Props {
  currentPage: number
  totalPages: number
  total: number
  sp: Record<string, string | undefined>
}

function url(sp: Record<string, string | undefined>, page: number) {
  const p = new URLSearchParams()
  Object.entries({ ...sp, page: String(page) }).forEach(([k, v]) => { if (v != null) p.set(k, v) })
  return `?${p}`
}

export function Pagination({ currentPage, totalPages, total, sp }: Props) {
  if (totalPages <= 1) return <p className="mt-3 text-sm text-slate-t">共 {total} 筆</p>

  const cls = 'rounded-md border border-border-t px-3 py-1.5 text-sm hover:bg-muted'

  return (
    <div className="mt-4 flex items-center gap-3">
      {currentPage > 1
        ? <Link href={url(sp, currentPage - 1)} className={cls}>上一頁</Link>
        : <span className={`${cls} opacity-30 pointer-events-none`}>上一頁</span>
      }
      <span className="text-sm text-slate-t">
        第 {currentPage} / {totalPages} 頁（共 {total} 筆）
      </span>
      {currentPage < totalPages
        ? <Link href={url(sp, currentPage + 1)} className={cls}>下一頁</Link>
        : <span className={`${cls} opacity-30 pointer-events-none`}>下一頁</span>
      }
    </div>
  )
}
