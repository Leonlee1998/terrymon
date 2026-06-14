import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Brand, BrandStatus } from '@/types'

type SavePayload = { id?: string; name: string; contactName?: string; contactPhone?: string; contactEmail?: string; status: BrandStatus }

interface Props {
  brand:   Brand | null
  open:    boolean
  onClose: () => void
  onSave:  (data: SavePayload) => Promise<void>
}

const EMPTY = { name: '', contactName: '', contactPhone: '', contactEmail: '' }

export default function BrandDialog({ brand, open, onClose, onSave }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(brand
      ? { name: brand.name, contactName: brand.contactName ?? '', contactPhone: brand.contactPhone ?? '', contactEmail: brand.contactEmail ?? '' }
      : EMPTY)
  }, [brand, open])

  function set(field: keyof typeof EMPTY, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await onSave({
        ...(brand?.id && { id: brand.id }),
        name:         form.name.trim(),
        contactName:  form.contactName  || undefined,
        contactPhone: form.contactPhone || undefined,
        contactEmail: form.contactEmail || undefined,
        status:       brand?.status ?? 'pending',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? '編輯品牌' : '新增品牌'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-xs font-medium text-slate-t">品牌名稱 *</label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1" placeholder="毛孩自然坊" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-t">聯絡人</label>
              <Input value={form.contactName} onChange={e => set('contactName', e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-t">聯絡電話</label>
              <Input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-t">Email</label>
            <Input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} className="mt-1" />
          </div>
          <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="w-full bg-primary text-white">
            {saving ? '儲存中...' : (brand ? '儲存修改' : '新增品牌')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
