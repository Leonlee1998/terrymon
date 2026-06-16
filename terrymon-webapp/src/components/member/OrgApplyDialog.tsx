'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { OrgType, Organization } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const ORG_TYPES: { value: OrgType; label: string; hint: string }[] = [
  { value: 'individual', label: '個人中途', hint: '個人短期照顧，無需立案' },
  { value: 'rescue',     label: '救援團體', hint: '非正式組織，建議提供社群連結' },
  { value: 'shelter',    label: '收容所',   hint: '立案機構，需提供立案文件' },
]

type Form = {
  type: OrgType
  name: string
  description: string
  phone: string
  address: string
  certUrl: string
}

const EMPTY: Form = { type: 'individual', name: '', description: '', phone: '', address: '', certUrl: '' }

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: (org: Organization) => void
}

export default function OrgApplyDialog({ open, onOpenChange, onSuccess }: Props) {
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) { toast.error('請填寫名稱'); return }
    setSaving(true)
    try {
      const org = await api.applyOrganization({
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        certUrl: form.certUrl.trim() || undefined,
      })
      toast.success('申請已送出，等待審核中')
      onSuccess(org)
      onOpenChange(false)
      setForm(EMPTY)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '申請失敗，請再試一次')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>申請成為機構 / 中途</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pb-2">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-ink">類型 *</legend>
            {ORG_TYPES.map(t => (
              <label key={t.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${form.type === t.value ? 'border-primary bg-primary-bg' : 'border-border-t'}`}>
                <input type="radio" name="orgType" value={t.value} checked={form.type === t.value}
                  onChange={() => set('type', t.value)} className="mt-0.5 accent-primary" />
                <div>
                  <p className="font-semibold text-ink">{t.label}</p>
                  <p className="text-xs text-slate-t">{t.hint}</p>
                </div>
              </label>
            ))}
          </fieldset>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">名稱 *</span>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="例：小毛球中途之家" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">簡介</span>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="介紹您的機構或中途服務" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">聯絡電話</span>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0912-345-678" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">地址</span>
              <Input value={form.address} onChange={e => set('address', e.target.value)} />
            </label>
          </div>

          {form.type !== 'individual' && (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">立案文件連結</span>
              <Input value={form.certUrl} onChange={e => set('certUrl', e.target.value)} placeholder="https://..." />
            </label>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>取消</Button>
            <Button onClick={handleSubmit} disabled={saving || !form.name.trim()} className="bg-primary text-white hover:bg-primary-hover">
              {saving ? '送出中...' : '送出申請'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
