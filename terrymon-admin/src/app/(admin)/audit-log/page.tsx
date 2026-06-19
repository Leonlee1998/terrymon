import Link from 'next/link'
import { listAuditLogs, listAdmins } from '@/services/adminApi'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

const ACTION_LABELS: Record<string, string> = {
  vendor_approved: '核准商家', vendor_suspended: '停權商家', vendor_commission: '調整抽成',
  store_activate: '啟用店鋪', store_deactivate: '停用店鋪',
  grooming_store_active: '啟用美容店', grooming_store_inactive: '停用美容店',
  org_approved: '核准機構', org_suspended: '停權機構', org_rejected: '拒絕機構',
  placement_approved: '核准進駐', placement_rejected: '拒絕進駐', placement_terminated: '終止進駐',
  adjust_balance: '調整餘額', adjust_points: '調整點數',
  admin_invite: '邀請管理員', admin_role_change: '變更角色',
  admin_activate: '啟用帳號', admin_deactivate: '停用帳號',
}

const PAGE_SIZE = 50

export default async function AuditLogPage({
  searchParams,
}: { searchParams: Promise<{ adminId?: string; action?: string; from?: string; to?: string; page?: string }> }) {
  const { adminId, action, from, to, page } = await searchParams
  const offset = (Number(page ?? 1) - 1) * PAGE_SIZE

  const [{ rows, total }, admins] = await Promise.all([
    listAuditLogs({ adminId, action, from, to, limit: PAGE_SIZE, offset }),
    listAdmins(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Number(page ?? 1)

  function buildUrl(params: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { adminId, action, from, to, ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    const qs = p.toString()
    return `/audit-log${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">稽核紀錄</h1>

      {/* 篩選器 */}
      <Card className="mb-4 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <select name="adminId" defaultValue={adminId ?? ''} className="rounded-md border border-border-t bg-white px-3 py-1.5 text-sm">
            <option value="">所有管理員</option>
            {admins.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <select name="action" defaultValue={action ?? ''} className="rounded-md border border-border-t bg-white px-3 py-1.5 text-sm">
            <option value="">所有動作</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <input type="date" name="from" defaultValue={from ?? ''} className="rounded-md border border-border-t px-3 py-1.5 text-sm" />
          <span className="self-center text-slate-t text-sm">至</span>
          <input type="date" name="to" defaultValue={to ?? ''} className="rounded-md border border-border-t px-3 py-1.5 text-sm" />

          <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90">
            篩選
          </button>
          <Link href="/audit-log" className="rounded-md px-3 py-1.5 text-sm text-slate-t hover:text-ink">清除</Link>
        </form>
      </Card>

      <p className="mb-2 text-sm text-slate-t">共 {total} 筆</p>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">時間</th>
              <th className="px-4 py-3 font-medium">操作者</th>
              <th className="px-4 py-3 font-medium">動作</th>
              <th className="px-4 py-3 font-medium">目標表</th>
              <th className="px-4 py-3 font-medium">目標 ID</th>
              <th className="px-4 py-3 font-medium">變更摘要</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border-t hover:bg-primary-bg/40">
                <td className="px-4 py-3 text-slate-t whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleString('zh-TW', { hour12: false })}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{r.adminName ?? '—'}</p>
                  {r.adminEmail && <p className="text-xs text-slate-t">{r.adminEmail}</p>}
                </td>
                <td className="px-4 py-3 font-medium text-primary">
                  {ACTION_LABELS[r.action] ?? r.action}
                </td>
                <td className="px-4 py-3 text-slate-t">{r.targetTable ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-t font-mono">
                  {r.targetId ? r.targetId.slice(0, 8) + '…' : '—'}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <pre className="whitespace-pre-wrap text-xs text-slate-t">
                    {JSON.stringify(r.payload, null, 0).slice(0, 120)}
                  </pre>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-t">沒有稽核紀錄</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
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
