import { getRevenueByDay } from '@/services/adminApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RevenueChart from '@/components/admin/RevenueChart'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const data = await getRevenueByDay(30)
  const total = data.reduce((sum, d) => sum + d.amount, 0)
  const avg = data.length ? Math.round(total / data.length) : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">報表</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="pt-5">
          <p className="text-sm text-slate-t">近 30 天總營收</p>
          <p className="mt-2 text-2xl font-bold text-primary">{formatPrice(total)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-sm text-slate-t">日均營收</p>
          <p className="mt-2 text-2xl font-bold text-ink">{formatPrice(avg)}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>每日營收趨勢（服務 + 商城消費）</CardTitle></CardHeader>
        <CardContent><RevenueChart data={data} /></CardContent>
      </Card>
    </div>
  )
}
