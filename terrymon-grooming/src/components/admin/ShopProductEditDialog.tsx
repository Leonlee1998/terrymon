import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ShopProduct } from '@/types'

interface Props {
  product:  ShopProduct | null
  open:     boolean
  onClose:  () => void
  onSave:   (id: string, retailPrice: number, memberPrice: number, stock: number) => Promise<void>
}

export default function ShopProductEditDialog({ product, open, onClose, onSave }: Props) {
  const [form, setForm] = useState({ price: 0, memberPrice: 0, stock: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) setForm({ price: product.price, memberPrice: product.memberPrice, stock: product.stock })
  }, [product])

  async function handleSave() {
    if (!product) return
    setSaving(true)
    try {
      await onSave(product.id, form.price, form.memberPrice, form.stock)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編輯商品定價與庫存</DialogTitle>
        </DialogHeader>
        {product && (
          <div className="space-y-4 mt-2">
            <p className="text-sm font-medium text-ink">{product.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-t">門市售價</label>
                <Input type="number" value={form.price} min={0}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-t">會員價</label>
                <Input type="number" value={form.memberPrice} min={0}
                  onChange={e => setForm(f => ({ ...f, memberPrice: Number(e.target.value) }))}
                  className="mt-1" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-t">庫存數量</label>
                <Input type="number" value={form.stock} min={0}
                  onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                  className="mt-1" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-white">
              {saving ? '儲存中...' : '儲存'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
