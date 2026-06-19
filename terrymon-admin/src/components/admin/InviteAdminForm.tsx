'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { inviteAdmin } from '@/services/adminActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AdminRole } from '@/types'

const ROLES: { value: AdminRole; label: string }[] = [
  { value: 'ops', label: '營運 (ops)' },
  { value: 'finance', label: '財務 (finance)' },
  { value: 'support', label: '客服 (support)' },
  { value: 'super_admin', label: '超級管理員 (super_admin)' },
]

export default function InviteAdminForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminRole>('ops')
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await inviteAdmin(name, email, role)
      if (res.ok) {
        toast.success('邀請 Email 已寄出，帳號已建立')
        setOpen(false)
        setName('')
        setEmail('')
        setRole('ops')
      } else {
        toast.error(res.error ?? '邀請失敗')
      }
    })
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>+ 邀請管理員</Button>
    )
  }

  return (
    <div className="rounded-lg border border-border-t bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-ink">邀請新管理員</h2>
      <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-t">姓名</label>
          <Input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="管理員姓名" required className="w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-t">Email</label>
          <Input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@example.com" required className="w-56"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-t">角色</label>
          <select
            value={role} onChange={e => setRole(e.target.value as AdminRole)}
            className="rounded-md border border-border-t px-3 py-2 text-sm bg-white h-10"
          >
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? '寄送中…' : '送出邀請'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
        </div>
      </form>
      <p className="mt-3 text-xs text-slate-t">系統會向該 Email 寄出邀請連結，接受後即可登入後台。</p>
    </div>
  )
}
