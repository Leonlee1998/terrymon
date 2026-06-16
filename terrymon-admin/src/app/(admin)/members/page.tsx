import Link from 'next/link'
import { listMembers } from '@/services/adminApi'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import MemberSearch from '@/components/admin/MemberSearch'
import { formatPrice } from '@/lib/utils'
import type { MemberTier } from '@/types'

export const dynamic = 'force-dynamic'

const TIER_TONE: Record<MemberTier, 'neutral' | 'info' | 'warning'> = {
  basic: 'neutral', silver: 'info', gold: 'warning',
}

export default async function MembersPage({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const members = await listMembers(q)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">會員管理</h1>
      <MemberSearch initial={q ?? ''} />

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">會員</th>
              <th className="px-4 py-3 font-medium">電話</th>
              <th className="px-4 py-3 font-medium">等級</th>
              <th className="px-4 py-3 text-right font-medium">儲值餘額</th>
              <th className="px-4 py-3 text-right font-medium">點數</th>
              <th className="px-4 py-3 text-center font-medium">寵物</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
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
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-t">沒有符合的會員</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
