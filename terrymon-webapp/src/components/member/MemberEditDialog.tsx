'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Member } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member
}

type MemberForm = {
  name: string
  phone: string
  email: string
  recipientName: string
  shippingPhone: string
  zipCode: string
  city: string
  district: string
  address: string
}

type FieldKey = keyof MemberForm

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-t">{label}</label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export default function MemberEditDialog({ open, onOpenChange, member }: Props) {
  const { updateMember } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<MemberForm>({
    name: member.name,
    phone: member.phone,
    email: member.email,
    recipientName: member.shippingAddress?.recipientName ?? '',
    shippingPhone: member.shippingAddress?.phone ?? '',
    zipCode: member.shippingAddress?.zipCode ?? '',
    city: member.shippingAddress?.city ?? '',
    district: member.shippingAddress?.district ?? '',
    address: member.shippingAddress?.address ?? '',
  })

  function setField(key: FieldKey) {
    return (value: string) => setForm(current => ({ ...current, [key]: value }))
  }

  async function onSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 400))

    const hasShipping = form.recipientName.trim() && form.address.trim()
    updateMember({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      shippingAddress: hasShipping ? {
        recipientName: form.recipientName.trim(),
        phone: form.shippingPhone.trim(),
        zipCode: form.zipCode.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        address: form.address.trim(),
      } : member.shippingAddress,
    })

    setSaving(false)
    onOpenChange(false)
    toast.success('會員資料已更新')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>編輯會員資料</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">個人資訊</p>
          <TextField label="姓名" value={form.name} onChange={setField('name')} placeholder="王小明" />
          <TextField label="手機號碼" value={form.phone} onChange={setField('phone')} placeholder="0912-345-678" />
          <TextField label="電子信箱" value={form.email} onChange={setField('email')} placeholder="name@email.com" type="email" />

          <div className="mt-1 border-t border-border-t pt-3">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">寄件資訊</p>
            <div className="space-y-3">
              <TextField label="收件人姓名" value={form.recipientName} onChange={setField('recipientName')} placeholder="王小明" />
              <TextField label="收件人手機" value={form.shippingPhone} onChange={setField('shippingPhone')} placeholder="0912-345-678" />
              <div className="grid grid-cols-3 gap-2">
                <TextField label="郵遞區號" value={form.zipCode} onChange={setField('zipCode')} placeholder="106" />
                <TextField label="縣市" value={form.city} onChange={setField('city')} placeholder="台北市" />
                <TextField label="區域" value={form.district} onChange={setField('district')} placeholder="大安區" />
              </div>
              <TextField label="詳細地址" value={form.address} onChange={setField('address')} placeholder="復興南路一段390號" />
            </div>
          </div>

          <Button
            onClick={onSave}
            disabled={saving || !form.name.trim()}
            className="mt-1 w-full bg-primary text-white hover:bg-primary-hover"
          >
            {saving ? '儲存中...' : '儲存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
