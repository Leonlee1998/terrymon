import Link from 'next/link'
import { listPlacements } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SortableTh } from '@/components/ui/sortable-th'
import { Pagination } from '@/components/ui/pagination'
import PlacementActions from '@/components/admin/PlacementActions'
import { formatDate, formatPrice } from '@/lib/utils'
import type { PlacementStatus } from '@/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const TONE: Record<PlacementStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  pending: 'warning', approved: 'success', rejected: 'danger', terminated: 'neutral',
}
const LABEL: Record<PlacementStatus, string> = {
  pending: '待審', approved: '已進駐', rejected: '已拒絕', terminated: '已終止',
}
const STATUS_FILTERS: { key?: PlacementStatus; label: string }[] = [
  { label: '全部' }, { key: 'pending', label: '待審' },
  { key: 'approved', label: '已進駐' }, { key: 'rejected', label: '已拒絕' },
  { key: 'terminated', label: '已終止' },
]

export default async function StorePlacementsPage({
  searchParams,
}: { searchParams: Promise<{ status?: PlacementStatus; sort?: string; order?: string; page?: string }> }) {
  const raw = await searchParams
  const sp = raw as Record<string, string | undefined>
  const offset = (Number(raw.page ?? 1) - 1) * PAGE_SIZE

  const { rows, total } = await listPlacements({
    status: raw.status, sort: raw.sort, order: raw.order,
    limit: PAGE_SIZE, offset,
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Number(raw.page ?? 1)
  const sortBy = raw.sort ?? 'created_at'
  const sortOrder = raw.order ?? 'desc'

  function statusTabUrl(s?: PlacementStatus) {
    const p = new URLSearchParams()
    if (s) p.set('status', s)
    if (raw.sort) p.set('sort', raw.sort)
    if (raw.order) p.set('order', raw.order)
    return `/store-placements${p.toString() ? `?${p}` : ''}`
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink">進駐審核</h1>
      <p className="mb-4 text-sm text-slate-t">審核品牌商家進駐實體美容店（開通實體店鋪）</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link key={f.label} href={statusTabUrl(f.key)}
            className={`rounded-full px-3 py-1 text-sm ${raw.status === f.key ? 'bg-primary text-white' : 'bg-muted text-slate-t hover:bg-primary-bg'}`}>
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">商家</th>
              <th className="px-4 py-3 font-medium">進駐店鋪</th>
              <SortableTh col="status"          label="狀態"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <SortableTh col="listing_fee"     label="上架費" sortBy={sortBy} sortOrder={sortOrder} sp={sp} align="right" />
              <SortableTh col="commission_rate" label="抽成"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} align="right" />
              <SortableTh col="created_at"      label="申請日" sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border-t hover:bg-primary-bg/40">
                <td className="px-4 py-3 font-medium text-ink">{p.vendorName ?? p.vendorId.slice(0, 8)}</td>
                <td className="px-4 py-3 text-slate-t">{p.storeName ?? p.storeId.slice(0, 8)}</td>
                <td className="px-4 py-3"><Badge tone={TONE[p.status]}>{LABEL[p.status]}</Badge></td>
                <td className="px-4 py-3 text-right">{formatPrice(p.listingFee)}</td>
                <td className="px-4 py-3 text-right">{p.commissionRate}%</td>
                <td className="px-4 py-3 text-xs text-slate-t">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3"><PlacementActions placement={p} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-t">沒有符合的進駐申請</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} total={total} sp={sp} />
    </div>
  )
}
