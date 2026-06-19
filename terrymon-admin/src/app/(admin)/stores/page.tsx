import Link from 'next/link'
import { listStores } from '@/services/adminApi'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StoreToggle from '@/components/admin/StoreToggle'
import type { StoreType } from '@/types'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<StoreType, string> = { grooming: '美容', vet: '醫療', shop: '商城' }

export default async function StoresPage({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const { stores, groomingStores } = await listStores(q)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">店鋪管理</h1>

      <form method="GET" className="flex max-w-sm gap-2">
        <input
          name="q" defaultValue={q ?? ''}
          placeholder="搜尋名稱 / 地址 / 城市"
          className="flex-1 rounded-md border border-border-t px-3 py-1.5 text-sm"
        />
        <button type="submit"
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90">
          搜尋
        </button>
        {q && (
          <Link href="/stores" className="rounded-md border border-border-t px-3 py-1.5 text-sm hover:bg-muted">
            清除
          </Link>
        )}
      </form>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>營運店鋪（stores）
            <span className="ml-2 text-sm font-normal text-slate-t">{stores.length} 間</span>
          </CardTitle>
        </CardHeader>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">名稱</th>
              <th className="px-4 py-3 font-medium">類型</th>
              <th className="px-4 py-3 font-medium">地址</th>
              <th className="px-4 py-3 font-medium">狀態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((st) => (
              <tr key={st.id} className="border-t border-border-t">
                <td className="px-4 py-3 font-medium text-ink">{st.name}</td>
                <td className="px-4 py-3"><Badge tone="info">{TYPE_LABEL[st.type]}</Badge></td>
                <td className="px-4 py-3 text-slate-t">{st.address ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge tone={st.isActive ? 'success' : 'neutral'}>{st.isActive ? '營運中' : '已停用'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <StoreToggle id={st.id} kind="store" active={st.isActive} />
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-t">
                {q ? '沒有符合的店鋪' : '尚無店鋪'}
              </td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>實體美容店（grooming_stores · 可進駐）
            <span className="ml-2 text-sm font-normal text-slate-t">{groomingStores.length} 間</span>
          </CardTitle>
        </CardHeader>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">名稱</th>
              <th className="px-4 py-3 font-medium">城市</th>
              <th className="px-4 py-3 font-medium">地址</th>
              <th className="px-4 py-3 font-medium">狀態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {groomingStores.map((g) => (
              <tr key={g.id} className="border-t border-border-t">
                <td className="px-4 py-3 font-medium text-ink">{g.name}</td>
                <td className="px-4 py-3 text-slate-t">{g.city ?? '—'}</td>
                <td className="px-4 py-3 text-slate-t">{g.address ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge tone={g.status === 'active' ? 'success' : 'neutral'}>
                    {g.status === 'active' ? '開放中' : '未開放'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <StoreToggle id={g.id} kind="grooming" active={g.status === 'active'} />
                </td>
              </tr>
            ))}
            {groomingStores.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-t">
                {q ? '沒有符合的店鋪' : '尚無實體美容店'}
              </td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
