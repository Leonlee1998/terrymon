import Link from 'next/link'
import { listVendors } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VendorActions from '@/components/admin/VendorActions'
import type { VendorStatus } from '@/types'

export const dynamic = 'force-dynamic'

const STATUS_TONE: Record<VendorStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning', approved: 'success', suspended: 'danger',
}
const STATUS_LABEL: Record<VendorStatus, string> = {
  pending: '待審', approved: '已核准', suspended: '已停權',
}
const FILTERS: { key?: VendorStatus; label: string }[] = [
  { label: '全部' }, { key: 'pending', label: '待審' },
  { key: 'approved', label: '已核准' }, { key: 'suspended', label: '已停權' },
]

export default async function VendorsPage({
  searchParams,
}: { searchParams: Promise<{ status?: VendorStatus }> }) {
  const { status } = await searchParams
  const vendors = await listVendors(status)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">商家管理</h1>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/vendors?status=${f.key}` : '/vendors'}
            className={`rounded-full px-3 py-1 text-sm ${status === f.key ? 'bg-primary text-white' : 'bg-muted text-slate-t hover:bg-primary-bg'}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">商家</th>
              <th className="px-4 py-3 font-medium">負責人</th>
              <th className="px-4 py-3 font-medium">狀態</th>
              <th className="px-4 py-3 text-right font-medium">抽成</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-t border-border-t hover:bg-primary-bg/40">
                <td className="px-4 py-3">
                  <Link href={`/vendors/${v.id}`} className="font-medium text-primary hover:underline">{v.storeName}</Link>
                  <p className="text-xs text-slate-t">{v.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-t">{v.ownerName}</td>
                <td className="px-4 py-3"><Badge tone={STATUS_TONE[v.status]}>{STATUS_LABEL[v.status]}</Badge></td>
                <td className="px-4 py-3 text-right">{v.commissionRate}%</td>
                <td className="px-4 py-3"><VendorActions vendorId={v.id} status={v.status} /></td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-t">沒有商家</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
