import { getDashboardStats } from '@/services/adminApi'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    { label: '會員總數', value: stats.memberCount.toLocaleString('zh-TW') },
    { label: '待審商家', value: stats.vendorPendingCount, accent: stats.vendorPendingCount > 0 },
    { label: '店鋪數', value: stats.storeCount },
    { label: '近 30 天營收', value: formatPrice(stats.revenue30d) },
    { label: '近 30 天儲值筆數', value: stats.topupCount30d },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">營運總覽</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-t">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.accent ? 'text-accent' : 'text-ink'}`}>
                {c.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
