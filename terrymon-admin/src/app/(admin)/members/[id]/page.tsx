import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMemberDetail } from '@/services/adminApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import BalanceAdjustForm from '@/components/admin/BalanceAdjustForm'
import { TX_TYPE_LABEL } from '@/lib/labels'
import { formatPrice, formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getMemberDetail(id)
  if (!detail) notFound()
  const { member, pets, recentTx } = detail

  return (
    <div className="space-y-6">
      <div>
        <Link href="/members" className="text-sm text-slate-t hover:underline">← 返回會員列表</Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{member.name}</h1>
        <p className="text-sm text-slate-t">{member.email} · {member.phone}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>帳戶餘額</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-slate-t">儲值餘額</p>
                <p className="text-xl font-bold text-primary">{formatPrice(member.platformBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-t">回饋點數</p>
                <p className="text-xl font-bold text-ink">{member.points.toLocaleString('zh-TW')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-t">等級</p>
                <p className="mt-1"><Badge tone="info">{member.tier}</Badge></p>
              </div>
            </div>
            <div className="border-t border-border-t pt-4">
              <p className="mb-2 text-sm font-medium text-ink">人工調整</p>
              <BalanceAdjustForm memberId={member.id} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>寵物（{pets.length}）</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pets.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm text-ink">{p.name}<span className="ml-2 text-xs text-slate-t">{p.breed || p.species}</span></span>
                {!p.isActive && <Badge tone="neutral">已停用</Badge>}
              </div>
            ))}
            {pets.length === 0 && <p className="text-sm text-slate-t">尚無寵物</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>近期交易</CardTitle></CardHeader>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-2 font-medium">時間</th>
              <th className="px-4 py-2 font-medium">類型</th>
              <th className="px-4 py-2 text-right font-medium">金額</th>
              <th className="px-4 py-2 font-medium">備註</th>
            </tr>
          </thead>
          <tbody>
            {recentTx.map((t) => (
              <tr key={t.id} className="border-t border-border-t">
                <td className="px-4 py-2 text-slate-t">{formatDateTime(t.createdAt)}</td>
                <td className="px-4 py-2">{TX_TYPE_LABEL[t.type]}</td>
                <td className="px-4 py-2 text-right">{formatPrice(t.totalAmount)}</td>
                <td className="px-4 py-2 text-slate-t">{t.note ?? '—'}</td>
              </tr>
            ))}
            {recentTx.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-t">尚無交易紀錄</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
