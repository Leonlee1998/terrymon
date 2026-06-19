import Link from 'next/link'
import { listVendors } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SortableTh } from '@/components/ui/sortable-th'
import { Pagination } from '@/components/ui/pagination'
import VendorActions from '@/components/admin/VendorActions'
import type { VendorStatus } from '@/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const STATUS_TONE: Record<VendorStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning', approved: 'success', suspended: 'danger',
}
const STATUS_LABEL: Record<VendorStatus, string> = {
  pending: '待審', approved: '已核准', suspended: '已停權',
}
const STATUS_FILTERS: { key?: VendorStatus; label: string }[] = [
  { label: '全部' }, { key: 'pending', label: '待審' },
  { key: 'approved', label: '已核准' }, { key: 'suspended', label: '已停權' },
]

export default async function VendorsPage({
  searchParams,
}: { searchParams: Promise<{ status?: VendorStatus; q?: string; sort?: string; order?: string; page?: string }> }) {
  const raw = await searchParams
  const sp = raw as Record<string, string | undefined>
  const offset = (Number(raw.page ?? 1) - 1) * PAGE_SIZE

  const { rows, total } = await listVendors({
    status: raw.status, q: raw.q, sort: raw.sort, order: raw.order,
    limit: PAGE_SIZE, offset,
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Number(raw.page ?? 1)
  const sortBy = raw.sort ?? 'created_at'
  const sortOrder = raw.order ?? 'desc'

  function statusTabUrl(s?: VendorStatus) {
    const p = new URLSearchParams()
    if (s) p.set('status', s)
    if (raw.q) p.set('q', raw.q)
    if (raw.sort) p.set('sort', raw.sort)
    if (raw.order) p.set('order', raw.order)
    return `/vendors${p.toString() ? `?${p}` : ''}`
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">商家管理</h1>

      {/* 搜尋 + 狀態篩選 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form method="GET" className="flex gap-2">
          {raw.status && <input type="hidden" name="status" value={raw.status} />}
          {raw.sort   && <input type="hidden" name="sort"   value={raw.sort} />}
          {raw.order  && <input type="hidden" name="order"  value={raw.order} />}
          <input
            name="q" defaultValue={raw.q ?? ''}
            placeholder="商家名稱 / Email / 統編"
            className="rounded-md border border-border-t px-3 py-1.5 text-sm w-56"
          />
          <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90">
            搜尋
          </button>
        </form>

        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.label}
              href={statusTabUrl(f.key)}
              className={`rounded-full px-3 py-1 text-sm ${raw.status === f.key ? 'bg-primary text-white' : 'bg-muted text-slate-t hover:bg-primary-bg'}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <SortableTh col="store_name"      label="商家"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <th className="px-4 py-3 font-medium">負責人</th>
              <SortableTh col="status"          label="狀態"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <SortableTh col="commission_rate" label="抽成"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} align="right" />
              <SortableTh col="created_at"      label="建立日期" sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} className="border-t border-border-t hover:bg-primary-bg/40">
                <td className="px-4 py-3">
                  <Link href={`/vendors/${v.id}`} className="font-medium text-primary hover:underline">{v.storeName}</Link>
                  <p className="text-xs text-slate-t">{v.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-t">{v.ownerName}</td>
                <td className="px-4 py-3"><Badge tone={STATUS_TONE[v.status]}>{STATUS_LABEL[v.status]}</Badge></td>
                <td className="px-4 py-3 text-right">{v.commissionRate}%</td>
                <td className="px-4 py-3 text-xs text-slate-t">
                  {new Date(v.createdAt).toLocaleDateString('zh-TW')}
                </td>
                <td className="px-4 py-3"><VendorActions vendorId={v.id} status={v.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-t">沒有符合的商家</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} total={total} sp={sp} />
    </div>
  )
}
