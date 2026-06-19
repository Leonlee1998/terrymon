'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { updateAdminRole, setAdminActive } from '@/services/adminActions'
import { Button } from '@/components/ui/button'
import type { AdminRole } from '@/types'

const ROLES: { value: AdminRole; label: string }[] = [
  { value: 'ops', label: '營運' },
  { value: 'finance', label: '財務' },
  { value: 'support', label: '客服' },
  { value: 'super_admin', label: '超級管理員' },
]

export function RoleSelect({ adminId, currentRole }: { adminId: string; currentRole: AdminRole }) {
  const [pending, start] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as AdminRole
    start(async () => {
      const res = await updateAdminRole(adminId, newRole)
      if (res.ok) toast.success('角色已更新')
      else toast.error(res.error ?? '更新失敗')
    })
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={onChange}
      disabled={pending}
      className="rounded-md border border-border-t px-2 py-1 text-xs bg-white disabled:opacity-60"
    >
      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
    </select>
  )
}

export function ToggleActiveButton({ adminId, isActive }: { adminId: string; isActive: boolean }) {
  const [pending, start] = useTransition()

  function toggle() {
    start(async () => {
      const res = await setAdminActive(adminId, !isActive)
      if (res.ok) toast.success(isActive ? '帳號已停用' : '帳號已啟用')
      else toast.error(res.error ?? '操作失敗')
    })
  }

  return (
    <Button size="sm" variant={isActive ? 'danger' : 'outline'} disabled={pending} onClick={toggle}>
      {isActive ? '停用' : '啟用'}
    </Button>
  )
}
