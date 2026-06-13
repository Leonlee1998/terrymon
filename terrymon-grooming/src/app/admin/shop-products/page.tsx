'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import type { ShopProduct } from '@/types'

export default function AdminShopProducts() {
  const { shopProducts, addProduct, updateProduct, toggleProduct } = useAdminStore()
  const [editTarget, setEditTarget] = useState<ShopProduct | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [filterCat, setFilterCat] = useState('全部')

  const [form, setForm] = useState({
    name: '', category: '', price: 0, memberPrice: 0, stock: 0, barcode: '',
  })

  const categories = ['全部', ...Array.from(new Set(shopProducts.map(p => p.category)))]

  const displayed = filterCat === '全部'
    ? shopProducts
    : shopProducts.filter(p => p.category === filterCat)

  function openNew() {
    setForm({ name: '', category: '', price: 0, memberPrice: 0, stock: 0, barcode: '' })
    setEditTarget(null)
    setIsNew(true)
  }

  function openEdit(p: ShopProduct) {
    setForm({ name: p.name, category: p.category, price: p.price, memberPrice: p.memberPrice, stock: p.stock, barcode: p.barcode ?? '' })
    setEditTarget(p)
    setIsNew(false)
  }

  function onSave() {
    if (!form.name.trim()) return
    if (editTarget) {
      updateProduct({ ...editTarget, ...form, price: Number(form.price), memberPrice: Number(form.memberPrice), stock: Number(form.stock) })
      toast.success('商品已更新')
      setEditTarget(null)
    } else {
      addProduct({ id: `SP${Date.now()}`, storeId: 'S001', isActive: true, ...form, price: Number(form.price), memberPrice: Number(form.memberPrice), stock: Number(form.stock) })
      toast.success('商品已新增')
      setIsNew(false)
    }
  }

  return (
    <div className="p-6">
      <AdminPageHeader
        title="現場商品"
        subtitle="管理 POS 機可銷售的現場商品"
        action={
          <Button onClick={openNew} className="bg-primary text-white">
            <Plus size={16} className="mr-2" />
            新增商品
          </Button>
        }
      />

      {/* Category filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filterCat === cat
                ? 'bg-primary text-white border-primary'
                : 'border-border-t text-slate-t hover:border-primary hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product table */}
      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-5 py-3 bg-surface text-xs font-semibold text-slate-t uppercase">
          <span className="col-span-2">商品名稱</span>
          <span>分類</span>
          <span>一般價 / 會員價</span>
          <span>庫存</span>
          <span className="text-center">啟用</span>
        </div>
        <div className="divide-y divide-border-t">
          {displayed.map(p => (
            <div key={p.id} className="grid grid-cols-6 gap-4 px-5 py-3 items-center">
              <div className="col-span-2">
                <p className="font-medium text-ink text-sm">{p.name}</p>
                {p.barcode && <p className="text-xs text-slate-t font-mono">{p.barcode}</p>}
              </div>
              <p className="text-sm text-slate-t">{p.category}</p>
              <div>
                <p className="text-sm font-semibold text-ink">{formatPrice(p.price)}</p>
                <p className="text-xs text-primary">{formatPrice(p.memberPrice)}</p>
              </div>
              <div className={`text-sm font-medium ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-ink'}`}>
                {p.stock} 件
                {p.stock === 0 && <span className="text-xs ml-1">售完</span>}
                {p.stock > 0 && p.stock <= 5 && <span className="text-xs ml-1">低庫存</span>}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Switch checked={p.isActive} onCheckedChange={() => toggleProduct(p.id)} />
                <button onClick={() => openEdit(p)} className="text-xs text-primary hover:underline">
                  編輯
                </button>
              </div>
            </div>
          ))}
          {displayed.length === 0 && (
            <p className="text-center text-slate-t py-8 text-sm">此分類尚無商品</p>
          )}
        </div>
      </div>

      {/* Edit/Add dialog */}
      <Dialog open={!!editTarget || isNew} onOpenChange={() => { setEditTarget(null); setIsNew(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? '編輯商品' : '新增商品'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-ink">商品名稱 *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink">分類</label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1" placeholder="清潔 / 護理 / 保健" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">條碼（選填）</label>
                <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">一般售價</label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">會員價</label>
                <Input type="number" value={form.memberPrice} onChange={e => setForm(f => ({ ...f, memberPrice: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">現有庫存</label>
                <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="mt-1" />
              </div>
            </div>
            <Button onClick={onSave} className="w-full bg-primary text-white">
              {editTarget ? '儲存修改' : '新增商品'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
