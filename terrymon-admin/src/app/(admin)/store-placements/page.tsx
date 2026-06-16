import { listPlacements } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PlacementActions from '@/components/admin/PlacementActions'
import { formatDate } from '@/lib/utils'
import type { PlacementStatus } from '@/types'

export const dynamic = 'force-dynamic'

const TONE: Record<PlacementStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  pending: 'warning', approved: 'success', rejected: 'danger', terminated: 'neutral',
}
const LABEL: Record<PlacementStatus, string> = {
  pending: '待審', approved: '已進駐', rejected: '已拒絕', terminated: '已終止',
}

export default async function StorePlacementsPage() {
  const placements = await listPlacements()

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink">進駐審核</h1>
      <p className="mb-6 text-sm text-slate-t">審核品牌商家進駐實體美容店（開通實體店鋪）</p>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">商家</th>
              <th className="px-4 py-3 font-medium">進駐店鋪</th>
              <th className="px-4 py-3 font-medium">狀態</th>
              <th className="px-4 py-3 text-right font-medium">上架費</th>
              <th className="px-4 py-3 text-right font-medium">抽成</th>
              <th className="px-4 py-3 font-medium">申請日</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((p) => (
              <tr key={p.id} className="border-t border-border-t">
                <td className="px-4 py-3 font-medium text-ink">{p.vendorName ?? p.vendorId}</td>
                <td className="px-4 py-3 text-slate-t">{p.storeName ?? p.storeId}</td>
                <td className="px-4 py-3"><Badge tone={TONE[p.status]}>{LABEL[p.status]}</Badge></td>
                <td className="px-4 py-3 text-right">{p.listingFee.toLocaleString('zh-TW')}</td>
                <td className="px-4 py-3 text-right">{p.commissionRate}%</td>
                <td className="px-4 py-3 text-slate-t">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3"><PlacementActions placement={p} /></td>
              </tr>
            ))}
            {placements.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-t">尚無進駐申請</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
