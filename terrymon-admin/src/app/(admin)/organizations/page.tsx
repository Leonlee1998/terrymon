import Link from 'next/link'
import { listOrganizations } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SortableTh } from '@/components/ui/sortable-th'
import { Pagination } from '@/components/ui/pagination'
import OrgActions from '@/components/admin/OrgActions'
import type { OrgStatus } from '@/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const STATUS_TONE: Record<OrgStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning', approved: 'success', suspended: 'danger',
}
const STATUS_LABEL: Record<OrgStatus, string> = {
  pending: '待審', approved: '已核准', suspended: '已停用',
}
const TYPE_LABEL: Record<string, string> = {
  individual: '個人中途', shelter: '收容所', rescue: '救援團體',
}
const STATUS_FILTERS: { key?: OrgStatus; label: string }[] = [
  { label: '全部' }, { key: 'pending', label: '待審' },
  { key: 'approved', label: '已核准' }, { key: 'suspended', label: '已停用' },
]

export default async function OrganizationsPage({
  searchParams,
}: { searchParams: Promise<{ status?: OrgStatus; q?: string; sort?: string; order?: string; page?: string }> }) {
  const raw = await searchParams
  const sp = raw as Record<string, string | undefined>
  const offset = (Number(raw.page ?? 1) - 1) * PAGE_SIZE

  const { rows, total } = await listOrganizations({
    status: raw.status, q: raw.q, sort: raw.sort, order: raw.order,
    limit: PAGE_SIZE, offset,
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Number(raw.page ?? 1)
  const sortBy = raw.sort ?? 'applied_at'
  const sortOrder = raw.order ?? 'desc'

  function statusTabUrl(s?: OrgStatus) {
    const p = new URLSearchParams()
    if (s) p.set('status', s)
    if (raw.q) p.set('q', raw.q)
    if (raw.sort) p.set('sort', raw.sort)
    if (raw.order) p.set('order', raw.order)
    return `/organizations${p.toString() ? `?${p}` : ''}`
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">機構審核</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form method="GET" className="flex gap-2">
          {raw.status && <input type="hidden" name="status" value={raw.status} />}
          {raw.sort   && <input type="hidden" name="sort"   value={raw.sort} />}
          {raw.order  && <input type="hidden" name="order"  value={raw.order} />}
          <input
            name="q" defaultValue={raw.q ?? ''}
            placeholder="機構名稱 / 電話 / 地址"
            className="rounded-md border border-border-t px-3 py-1.5 text-sm w-56"
          />
          <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90">
            搜尋
          </button>
        </form>

        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <Link key={f.label} href={statusTabUrl(f.key)}
              className={`rounded-full px-3 py-1 text-sm ${raw.status === f.key ? 'bg-primary text-white' : 'bg-muted text-slate-t hover:bg-primary-bg'}`}>
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <SortableTh col="name"       label="機構名稱" sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <SortableTh col="type"       label="類型"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <th className="px-4 py-3 font-medium">申請人</th>
              <SortableTh col="status"     label="狀態"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <SortableTh col="applied_at" label="申請日期" sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-border-t hover:bg-primary-bg/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{o.name}</p>
                  {o.certUrl && (
                    <a href={o.certUrl} target="_blank" rel="noreferrer"
                      className="text-xs text-primary hover:underline">查看認證文件</a>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-t">{TYPE_LABEL[o.type] ?? o.type}</td>
                <td className="px-4 py-3">
                  <p className="text-slate-t">{o.memberName}</p>
                  <p className="text-xs text-slate-t">{o.memberPhone}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-t">
                  {new Date(o.appliedAt).toLocaleDateString('zh-TW')}
                </td>
                <td className="px-4 py-3"><OrgActions orgId={o.id} status={o.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-t">沒有機構申請</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} total={total} sp={sp} />
    </div>
  )
}
