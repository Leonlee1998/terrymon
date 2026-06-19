import Link from 'next/link'
import { listMembers } from '@/services/adminApi'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { SortableTh } from '@/components/ui/sortable-th'
import { Pagination } from '@/components/ui/pagination'
import MemberSearch from '@/components/admin/MemberSearch'
import { formatPrice } from '@/lib/utils'
import type { MemberTier } from '@/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const TIER_TONE: Record<MemberTier, 'neutral' | 'info' | 'warning'> = {
  basic: 'neutral', silver: 'info', gold: 'warning',
}

export default async function MembersPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; sort?: string; order?: string; page?: string }> }) {
  const raw = await searchParams
  const sp = raw as Record<string, string | undefined>
  const offset = (Number(raw.page ?? 1) - 1) * PAGE_SIZE

  const { rows, total } = await listMembers({
    q: raw.q, sort: raw.sort, order: raw.order, limit: PAGE_SIZE, offset,
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Number(raw.page ?? 1)
  const sortBy = raw.sort ?? 'created_at'
  const sortOrder = raw.order ?? 'desc'

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">會員管理</h1>
      <MemberSearch initial={raw.q ?? ''} sp={sp} />

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <SortableTh col="name"             label="會員"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <th className="px-4 py-3 font-medium">電話</th>
              <SortableTh col="tier"             label="等級"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
              <SortableTh col="platform_balance" label="儲值餘額" sortBy={sortBy} sortOrder={sortOrder} sp={sp} align="right" />
              <SortableTh col="points"           label="點數"   sortBy={sortBy} sortOrder={sortOrder} sp={sp} align="right" />
              <th className="px-4 py-3 text-center font-medium">寵物</th>
              <SortableTh col="created_at"       label="加入日期" sortBy={sortBy} sortOrder={sortOrder} sp={sp} />
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-border-t hover:bg-primary-bg/40">
                <td className="px-4 py-3">
                  <Link href={`/members/${m.id}`} className="font-medium text-primary hover:underline">
                    {m.name}
                  </Link>
                  <p className="text-xs text-slate-t">{m.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-t">{m.phone}</td>
                <td className="px-4 py-3"><Badge tone={TIER_TONE[m.tier]}>{m.tier}</Badge></td>
                <td className="px-4 py-3 text-right">{formatPrice(m.platformBalance)}</td>
                <td className="px-4 py-3 text-right">{m.points.toLocaleString('zh-TW')}</td>
                <td className="px-4 py-3 text-center text-slate-t">{m.petCount}</td>
                <td className="px-4 py-3 text-slate-t text-xs">
                  {new Date(m.createdAt).toLocaleDateString('zh-TW')}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-t">沒有符合的會員</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} total={total} sp={sp} />
    </div>
  )
}
