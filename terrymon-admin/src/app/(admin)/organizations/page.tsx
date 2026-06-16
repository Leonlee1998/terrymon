import Link from 'next/link'
import { listOrganizations } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import OrgActions from '@/components/admin/OrgActions'
import type { OrgStatus } from '@/types'

export const dynamic = 'force-dynamic'

const STATUS_TONE: Record<OrgStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning', approved: 'success', suspended: 'danger',
}
const STATUS_LABEL: Record<OrgStatus, string> = {
  pending: '待審', approved: '已核准', suspended: '已停用',
}
const TYPE_LABEL: Record<string, string> = {
  individual: '個人中途', shelter: '收容所', rescue: '救援團體',
}
const FILTERS: { key?: OrgStatus; label: string }[] = [
  { label: '全部' }, { key: 'pending', label: '待審' },
  { key: 'approved', label: '已核准' }, { key: 'suspended', label: '已停用' },
]

export default async function OrganizationsPage({
  searchParams,
}: { searchParams: Promise<{ status?: OrgStatus }> }) {
  const { status } = await searchParams
  const orgs = await listOrganizations(status)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">機構審核</h1>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/organizations?status=${f.key}` : '/organizations'}
            className={`rounded-full px-3 py-1 text-sm ${status === f.key ? 'bg-primary text-white' : 'bg-muted text-slate-t hover:bg-primary-bg'}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">機構名稱</th>
              <th className="px-4 py-3 font-medium">類型</th>
              <th className="px-4 py-3 font-medium">申請人</th>
              <th className="px-4 py-3 font-medium">狀態</th>
              <th className="px-4 py-3 font-medium">申請日期</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-t border-border-t hover:bg-primary-bg/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{o.name}</p>
                  {o.certUrl && (
                    <a href={o.certUrl} target="_blank" rel="noreferrer"
                      className="text-xs text-primary hover:underline">
                      查看認證文件
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-t">{TYPE_LABEL[o.type] ?? o.type}</td>
                <td className="px-4 py-3">
                  <p className="text-slate-t">{o.memberName}</p>
                  <p className="text-xs text-slate-t">{o.memberPhone}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-t">
                  {new Date(o.appliedAt).toLocaleDateString('zh-TW')}
                </td>
                <td className="px-4 py-3"><OrgActions orgId={o.id} status={o.status} /></td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-t">沒有機構申請</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
