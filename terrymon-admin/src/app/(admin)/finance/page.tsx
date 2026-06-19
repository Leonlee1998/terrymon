import Link from 'next/link'
import { listTransactions, getFinanceSummary } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import RefundDialog from '@/components/admin/RefundDialog'
import SettleButton from '@/components/admin/SettleButton'
import { TX_TYPE_LABEL } from '@/lib/labels'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { TransactionType } from '@/types'

export const dynamic = 'force-dynamic'

const REFUNDABLE: TransactionType[] = ['service_payment', 'order_payment', 'topup']

const TX_TONE: Partial<Record<TransactionType, 'neutral' | 'success' | 'warning' | 'danger' | 'info'>> = {
  topup: 'success',
  service_payment: 'info',
  order_payment: 'info',
  refund: 'danger',
  balance_adjustment: 'warning',
}

const PAGE_SIZE = 50

export default async function FinancePage({
  searchParams,
}: { searchParams: Promise<{ type?: string; from?: string; to?: string; search?: string; page?: string }> }) {
  const { type, from, to, search, page } = await searchParams
  const offset = (Number(page ?? 1) - 1) * PAGE_SIZE

  const opts = { type, from, to, search }

  const [{ rows, total }, summary] = await Promise.all([
    listTransactions({ ...opts, limit: PAGE_SIZE, offset }),
    getFinanceSummary(opts),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Number(page ?? 1)

  function buildUrl(params: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { type, from, to, search, ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    return `/finance${p.toString() ? `?${p}` : ''}`
  }

  const exportUrl = (() => {
    const p = new URLSearchParams()
    if (type) p.set('type', type)
    if (from) p.set('from', from)
    if (to) p.set('to', to)
    if (search) p.set('search', search)
    return `/api/finance/export${p.toString() ? `?${p}` : ''}`
  })()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">金流對帳</h1>
        <a
          href={exportUrl}
          className="rounded-md border border-border-t px-4 py-2 text-sm font-medium text-slate-t hover:bg-muted"
        >
          ↓ 匯出 CSV
        </a>
      </div>

      {/* 摘要統計 */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '期間收入', value: formatPrice(summary.totalIn), tone: 'text-primary' },
          { label: '期間退款', value: formatPrice(summary.totalRefund), tone: 'text-error' },
          { label: '刷卡待結算', value: formatPrice(summary.pendingSettlement), tone: 'text-accent' },
          { label: '總筆數', value: `${total} 筆`, tone: 'text-ink' },
        ].map(({ label, value, tone }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-slate-t">{label}</p>
            <p className={`mt-1 text-lg font-bold ${tone}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* 篩選器 */}
      <Card className="mb-4 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <input
            name="search" defaultValue={search ?? ''}
            placeholder="會員姓名 / Email / 金流單號"
            className="rounded-md border border-border-t px-3 py-1.5 text-sm w-56"
          />
          <select name="type" defaultValue={type ?? ''} className="rounded-md border border-border-t bg-white px-3 py-1.5 text-sm">
            <option value="">所有類型</option>
            {(Object.keys(TX_TYPE_LABEL) as TransactionType[]).map(k => (
              <option key={k} value={k}>{TX_TYPE_LABEL[k]}</option>
            ))}
          </select>
          <input type="date" name="from" defaultValue={from ?? ''} className="rounded-md border border-border-t px-3 py-1.5 text-sm" />
          <span className="self-center text-slate-t text-sm">至</span>
          <input type="date" name="to" defaultValue={to ?? ''} className="rounded-md border border-border-t px-3 py-1.5 text-sm" />
          <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90">
            篩選
          </button>
          <Link href="/finance" className="self-center text-sm text-slate-t hover:text-ink">清除</Link>
        </form>
      </Card>

      <p className="mb-2 text-sm text-slate-t">共 {total} 筆，本頁 {rows.length} 筆</p>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-slate-t">
              <tr>
                <th className="px-4 py-3 font-medium">時間</th>
                <th className="px-4 py-3 font-medium">會員</th>
                <th className="px-4 py-3 font-medium">類型</th>
                <th className="px-4 py-3 text-right font-medium">金額</th>
                <th className="px-4 py-3 font-medium">金流單號</th>
                <th className="px-4 py-3 font-medium">結算</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const isRefundable = REFUNDABLE.includes(t.type as TransactionType) && !t.originalTxId
                const isCardTx = t.cardAmount > 0
                const isSettled = !!t.settledAt

                return (
                  <tr key={t.id} className="border-t border-border-t hover:bg-primary-bg/40">
                    <td className="px-4 py-3 text-slate-t whitespace-nowrap">{formatDateTime(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{t.memberName ?? '—'}</p>
                      {t.memberEmail && <p className="text-xs text-slate-t">{t.memberEmail}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={TX_TONE[t.type as TransactionType] ?? 'neutral'}>
                        {TX_TYPE_LABEL[t.type as TransactionType] ?? t.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-medium">{formatPrice(t.totalAmount)}</p>
                      {isCardTx && (
                        <p className="text-xs text-slate-t">刷卡 {formatPrice(t.cardAmount)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.gatewayTxId
                        ? <span className="font-mono text-xs text-slate-t">{t.gatewayTxId}</span>
                        : <span className="text-slate-t">—</span>
                      }
                      {t.paymentGateway && (
                        <p className="text-xs text-slate-t">{t.paymentGateway}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!isCardTx
                        ? <Badge tone="neutral">不適用</Badge>
                        : isSettled
                        ? <Badge tone="success">已結算</Badge>
                        : <Badge tone="warning">待結算</Badge>
                      }
                      {t.settledAt && (
                        <p className="text-xs text-slate-t mt-0.5">
                          {new Date(t.settledAt).toLocaleDateString('zh-TW')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {isCardTx && !isSettled && <SettleButton txId={t.id} />}
                        {isRefundable && (
                          <RefundDialog
                            txId={t.id}
                            maxAmount={t.totalAmount}
                            memberName={t.memberName}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-t">沒有符合的交易紀錄</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3">
          {currentPage > 1 && (
            <Link href={buildUrl({ page: String(currentPage - 1) })}
              className="rounded-md border border-border-t px-3 py-1.5 text-sm hover:bg-muted">
              上一頁
            </Link>
          )}
          <span className="text-sm text-slate-t">第 {currentPage} / {totalPages} 頁</span>
          {currentPage < totalPages && (
            <Link href={buildUrl({ page: String(currentPage + 1) })}
              className="rounded-md border border-border-t px-3 py-1.5 text-sm hover:bg-muted">
              下一頁
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
