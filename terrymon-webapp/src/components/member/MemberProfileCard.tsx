'use client'
import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Member } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

const TIER_CONFIG = {
  basic:  { label: '普通會員', emoji: '🎖️' },
  silver: { label: '銀卡會員', emoji: '🥈' },
  gold:   { label: '金卡會員', emoji: '🥇' },
}

export default function MemberProfileCard({ member }: { member: Member }) {
  const { updateMember } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const tier = TIER_CONFIG[member.tier]

  function handleOpenEdit() {
    setForm({ name: member.name, phone: member.phone, email: member.email })
    setOpen(true)
  }

  async function onSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    updateMember({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() })
    setSaving(false)
    setOpen(false)
    toast.success('資料已更新')
  }

  return (
    <>
      <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">
              {member.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-black">{member.name}</h2>
              <p className="text-white/70 text-sm">{member.phone}</p>
              <p className="text-white/70 text-xs">{member.email}</p>
            </div>
          </div>
          <button
            onClick={handleOpenEdit}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
          >
            <Edit2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-white/20">
            {tier.emoji} {tier.label}
          </span>
          <span className="text-xs text-white/60">
            加入於 {formatDate(member.memberSince)}
          </span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯會員資料</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-ink block mb-1">姓名</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="王小明"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">手機號碼</label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="0912-345-678"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">電子信箱</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="name@email.com"
              />
            </div>
            <Button
              onClick={onSave}
              disabled={saving || !form.name.trim()}
              className="w-full bg-primary hover:bg-primary-hover text-white"
            >
              {saving ? '儲存中…' : '儲存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
