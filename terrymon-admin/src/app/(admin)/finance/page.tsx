import Link from 'next/link'
import { listTransactions } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TX_TYPE_LABEL } from '@/lib/labels'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { TransactionType } from '@/types'

export const dynamic = 'force-dynamic'

const FILTERS: { key?: TransactionType; label: string }[] = [
  { label: '全部' },
  { key: 'topup', label: '儲值' },
  { key: 'service_payment', label: '服務消費' },
  { key: 'order_payment', label: '商城消費' },
  { key: 'refund', label: '退款' },
  { key: 'balance_adjustment', label: '人工調整' },
]

export default async function FinancePage({
  searchParams,
}: { searchParams: Promise<{ type?: TransactionType }> }) {
  const { type } = await searchParams
  const txs = await listTransactions({ type })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">金流對帳</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/finance?type=${f.key}` : '/finance'}
            className={`rounded-full px-3 py-1 text-sm ${type === f.key ? 'bg-primary text-white' : 'bg-muted text-slate-t hover:bg-primary-bg'}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">時間</th>
              <th className="px-4 py-3 font-medium">會員</th>
              <th className="px-4 py-3 font-medium">類型</th>
              <th className="px-4 py-3 text-right font-medium">金額</th>
              <th className="px-4 py-3 font-medium">付款方式</th>
              <th className="px-4 py-3 font-medium">金流單號</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id} className="border-t border-border-t hover:bg-primary-bg/40">
                <td className="px-4 py-3 text-slate-t">{formatDateTime(t.createdAt)}</td>
                <td className="px-4 py-3 text-ink">{t.memberName ?? '—'}</td>
                <td className="px-4 py-3"><Badge tone="info">{TX_TYPE_LABEL[t.type]}</Badge></td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(t.totalAmount)}</td>
                <td className="px-4 py-3 text-slate-t">{t.paymentMethod ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-t">{t.gatewayTxId ?? '—'}</td>
              </tr>
            ))}
            {txs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-t">沒有交易紀錄</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
