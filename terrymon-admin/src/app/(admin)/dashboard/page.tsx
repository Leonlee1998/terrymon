import Link from 'next/link'
import { getDashboardMetrics } from '@/services/adminApi'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function StatCard({
  label, value, sub, tone = 'default', href,
}: {
  label: string
  value: string | number
  sub?: string
  tone?: 'default' | 'warning' | 'success' | 'danger'
  href?: string
}) {
  const tones = {
    default: 'text-ink',
    warning: 'text-accent',
    success: 'text-primary',
    danger: 'text-error',
  }
  const content = (
    <Card className={tone === 'warning' && Number(value) > 0 ? 'border-accent/40 bg-accent-light/20' : ''}>
      <CardContent className="pt-5">
        <p className="text-sm text-slate-t">{label}</p>
        <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-t">{sub}</p>}
        {href && <p className="mt-2 text-xs font-medium text-primary">前往處理 →</p>}
      </CardContent>
    </Card>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

export default async function DashboardPage() {
  const m = await getDashboardMetrics()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ink">營運總覽</h1>

      {/* 待處理事項 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-t uppercase tracking-wide">待處理事項</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="待審商家" value={m.vendorPendingCount}
            sub={m.vendorPendingCount > 0 ? '需要審核' : '無待審項目'}
            tone={m.vendorPendingCount > 0 ? 'warning' : 'default'}
            href={m.vendorPendingCount > 0 ? '/vendors?status=pending' : undefined}
          />
          <StatCard
            label="待審機構" value={m.orgPendingCount}
            sub={m.orgPendingCount > 0 ? '需要審核' : '無待審項目'}
            tone={m.orgPendingCount > 0 ? 'warning' : 'default'}
            href={m.orgPendingCount > 0 ? '/organizations?status=pending' : undefined}
          />
          <StatCard
            label="待審進駐" value={m.placementPendingCount}
            sub={m.placementPendingCount > 0 ? '需要審核' : '無待審項目'}
            tone={m.placementPendingCount > 0 ? 'warning' : 'default'}
            href={m.placementPendingCount > 0 ? '/store-placements?status=pending' : undefined}
          />
        </div>
      </section>

      {/* 財務指標（近 30 天）*/}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-t uppercase tracking-wide">財務指標（近 30 天）</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="GMV" value={formatPrice(m.gmv30d)} sub="服務 + 商城消費" tone="success" />
          <StatCard
            label="淨營收" value={formatPrice(m.netRevenue30d)}
            sub={`GMV 扣退款 ${formatPrice(m.refundAmount30d)}`}
            tone={m.netRevenue30d >= 0 ? 'success' : 'danger'}
          />
          <StatCard
            label="退款率" value={`${m.refundRate30d.toFixed(1)}%`}
            sub={`退款 ${formatPrice(m.refundAmount30d)}`}
            tone={m.refundRate30d > 5 ? 'warning' : 'default'}
          />
          <StatCard
            label="平台餘額負債" value={formatPrice(m.totalPlatformBalance)}
            sub="會員錢包餘額合計"
          />
        </div>
      </section>

      {/* 儲值 + 會員 + 平台 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-t uppercase tracking-wide">會員 & 平台</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="會員總數" value={m.memberCount.toLocaleString('zh-TW')} sub={`本月新增 ${m.newMembersThisMonth}`} />
          <StatCard label="本週活躍會員" value={m.activeMembersThisWeek} sub="近 7 天有消費紀錄" />
          <StatCard
            label="近 30 天儲值"
            value={formatPrice(m.topupAmount30d)}
            sub={`共 ${m.topupCount30d} 筆`}
          />
          <StatCard label="店鋪總數" value={m.storeCount} href="/stores" />
        </div>
      </section>

      {/* 快捷連結 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-t uppercase tracking-wide">快速導覽</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/finance', label: '金流對帳' },
            { href: '/reports', label: '報表分析' },
            { href: '/audit-log', label: '稽核紀錄' },
            { href: '/members', label: '會員管理' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="rounded-md border border-border-t px-4 py-2 text-sm text-slate-t hover:bg-primary-bg hover:text-primary">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
