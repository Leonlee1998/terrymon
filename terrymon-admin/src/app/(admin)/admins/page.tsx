import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import { listAdmins } from '@/services/adminApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import InviteAdminForm from '@/components/admin/InviteAdminForm'
import { RoleSelect, ToggleActiveButton } from '@/components/admin/AdminAccountActions'
import type { AdminRole } from '@/types'

export const dynamic = 'force-dynamic'

const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: '超級管理員', ops: '營運', finance: '財務', support: '客服',
}

export default async function AdminsPage() {
  const me = await getCurrentAdmin()
  if (me?.role !== 'super_admin') redirect('/dashboard')

  const admins = await listAdmins()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">管理員帳號</h1>

      <div className="mb-6">
        <InviteAdminForm />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-slate-t">
            <tr>
              <th className="px-4 py-3 font-medium">姓名</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">角色</th>
              <th className="px-4 py-3 font-medium">狀態</th>
              <th className="px-4 py-3 font-medium">建立時間</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isMe = a.id === me?.id
              return (
                <tr key={a.id} className="border-t border-border-t hover:bg-primary-bg/40">
                  <td className="px-4 py-3 font-medium text-ink">
                    {a.name}
                    {isMe && <span className="ml-1.5 text-xs text-slate-t">(我)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-t">{a.email}</td>
                  <td className="px-4 py-3">
                    {isMe
                      ? <Badge tone="info">{ROLE_LABEL[a.role]}</Badge>
                      : <RoleSelect adminId={a.id} currentRole={a.role} />
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={a.isActive ? 'success' : 'neutral'}>
                      {a.isActive ? '啟用中' : '已停用'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-t">
                    {new Date(a.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isMe && <ToggleActiveButton adminId={a.id} isActive={a.isActive} />}
                  </td>
                </tr>
              )
            })}
            {admins.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-t">沒有管理員帳號</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
