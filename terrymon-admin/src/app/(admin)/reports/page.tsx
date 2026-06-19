import Link from 'next/link'
import { getRevenueBreakdown, getMemberGrowth, getTopStores, getMemberTierDist } from '@/services/adminApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueBreakdownChart, MemberGrowthChart } from '@/components/admin/RevenueChart'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const PERIOD_OPTIONS = [
  { label: '7 天',  value: 7 },
  { label: '30 天', value: 30 },
  { label: '90 天', value: 90 },
]

const TIER_LABEL: Record<string, string> = { basic: '一般', silver: '銀卡', gold: '金卡' }
const TIER_COLOR: Record<string, string> = {
  basic: 'bg-slate-200', silver: 'bg-sky-200', gold: 'bg-amber-300',
}

export default async function ReportsPage({
  searchParams,
}: { searchParams: Promise<{ days?: string }> }) {
  const { days: daysParam } = await searchParams
  const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30

  const [breakdown, growth, topStores, tierDist] = await Promise.all([
    getRevenueBreakdown(days),
    getMemberGrowth(days),
    getTopStores(days, 10),
    getMemberTierDist(),
  ])

  const gmv  = breakdown.reduce((s, d) => s + d.service + d.order, 0)
  const refund = breakdown.reduce((s, d) => s + d.refund, 0)
  const net  = gmv - refund
  const topup = breakdown.reduce((s, d) => s + d.topup, 0)
  const newMembers = growth.reduce((s, d) => s + d.count, 0)
  const totalMembers = tierDist.reduce((s, t) => s + t.count, 0)

  return (
    <div className="space-y-6">
      {/* Header + Period Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">報表分析</h1>
        <div className="flex gap-1 rounded-lg border border-border-t bg-muted p-1">
          {PERIOD_OPTIONS.map(({ label, value }) => (
            <Link
              key={value}
              href={`/reports?days=${value}`}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                days === value ? 'bg-white text-ink shadow-sm' : 'text-slate-t hover:text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI 摘要 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: `近 ${days} 天 GMV`,  value: formatPrice(gmv),        sub: '服務 + 商城消費', color: 'text-primary' },
          { label: `近 ${days} 天淨營收`, value: formatPrice(net),        sub: `退款 ${formatPrice(refund)}`, color: net >= 0 ? 'text-primary' : 'text-error' },
          { label: `近 ${days} 天儲值`,   value: formatPrice(topup),      sub: '平台充值', color: 'text-ink' },
          { label: `近 ${days} 天新增會員`, value: newMembers,            sub: '人', color: 'text-ink' },
        ].map(({ label, value, sub, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-t">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-slate-t">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 收入拆分折線圖 */}
      <Card>
        <CardHeader>
          <CardTitle>收入趨勢拆分（服務 · 商城 · 儲值 · 退款）</CardTitle>
        </CardHeader>
        <CardContent><RevenueBreakdownChart data={breakdown} /></CardContent>
      </Card>

      {/* Top 店鋪 + 會員等級分佈 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Top 店鋪營收
              <span className="ml-1 text-xs font-normal text-slate-t">（近 {days} 天）</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {topStores.length === 0
              ? <p className="text-sm text-slate-t py-4 text-center">暫無資料</p>
              : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-t">
                      <th className="pb-2 font-medium">店鋪</th>
                      <th className="pb-2 text-right font-medium">營收</th>
                      <th className="pb-2 text-right font-medium">筆數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStores.map((st, i) => (
                      <tr key={i} className="border-t border-border-t">
                        <td className="py-2">
                          <span className="mr-2 text-xs text-slate-t">{i + 1}</span>
                          {st.storeName}
                        </td>
                        <td className="py-2 text-right font-medium text-primary">{formatPrice(st.revenue)}</td>
                        <td className="py-2 text-right text-slate-t">{st.txCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>會員等級分佈</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-3">
            {tierDist.length === 0
              ? <p className="text-sm text-slate-t py-4 text-center">暫無資料</p>
              : tierDist
                  .sort((a, b) => b.count - a.count)
                  .map(({ tier, count }) => {
                    const pct = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0
                    return (
                      <div key={tier}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium text-ink">{TIER_LABEL[tier] ?? tier}</span>
                          <span className="text-slate-t">{count.toLocaleString('zh-TW')} 人（{pct}%）</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${TIER_COLOR[tier] ?? 'bg-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
            }
          </CardContent>
        </Card>
      </div>

      {/* 新增會員趨勢 */}
      <Card>
        <CardHeader>
          <CardTitle>
            新增會員趨勢
            <span className="ml-1 text-xs font-normal text-slate-t">（近 {days} 天，共 {newMembers} 人）</span>
          </CardTitle>
        </CardHeader>
        <CardContent><MemberGrowthChart data={growth} /></CardContent>
      </Card>
    </div>
  )
}
