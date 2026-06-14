'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ShopProductTable from '@/components/admin/ShopProductTable'
import ShopProductEditDialog from '@/components/admin/ShopProductEditDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi, posApi } from '@/services/api'
import type { ShopProduct } from '@/types'

export default function AdminShopProducts() {
  const [products,    setProducts]    = useState<ShopProduct[]>([])
  const [filterCat,   setFilterCat]   = useState('全部')
  const [editTarget,  setEditTarget]  = useState<ShopProduct | null>(null)
  const [sellTarget,  setSellTarget]  = useState<ShopProduct | null>(null)
  const [sellQty,     setSellQty]     = useState(1)
  const [selling,     setSelling]     = useState(false)

  const load = useCallback(() => {
    adminApi.getProducts().then(setProducts)
  }, [])

  useEffect(() => { load() }, [load])

  const categories = ['全部', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
  const displayed  = filterCat === '全部' ? products : products.filter(p => p.category === filterCat)

  async function handleToggle(p: ShopProduct) {
    const next = !p.isActive
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, isActive: next } : x))
    try {
      await adminApi.updateInventoryItem(p.id, { isActive: next })
    } catch {
      setProducts(ps => ps.map(x => x.id === p.id ? { ...x, isActive: p.isActive } : x))
      toast.error('更新失敗，請稍後再試')
    }
  }

  async function handleSave(id: string, retailPrice: number, memberPrice: number, stock: number) {
    await adminApi.updateInventoryItem(id, { retailPrice, memberPrice, stock })
    setProducts(ps => ps.map(p => p.id === id ? { ...p, price: retailPrice, memberPrice, stock } : p))
    toast.success('商品已更新')
  }

  async function handleSell() {
    if (!sellTarget || sellQty < 1) return
    setSelling(true)
    try {
      const { remainingStock } = await posApi.deductStock(sellTarget.id, sellQty)
      setProducts(ps => ps.map(p => p.id === sellTarget.id ? { ...p, stock: remainingStock } : p))
      toast.success(`已售出 ${sellQty} 件「${sellTarget.name}」，剩餘 ${remainingStock} 件`)
      setSellTarget(null)
    } catch (e) {
      toast.error((e as Error).message || '售出失敗')
    } finally {
      setSelling(false)
    }
  }

  return (
    <div className="p-6">
      <AdminPageHeader
        title="現場商品"
        subtitle="管理 POS 機可銷售的現場商品（來源：品牌商品 Push）"
      />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
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

      <ShopProductTable
        products={displayed}
        onToggle={handleToggle}
        onEdit={setEditTarget}
        onSell={p => { setSellTarget(p); setSellQty(1) }}
      />

      <ShopProductEditDialog
        product={editTarget} open={!!editTarget}
        onClose={() => setEditTarget(null)} onSave={handleSave}
      />

      {/* 售出 Dialog */}
      <Dialog open={!!sellTarget} onOpenChange={v => !v && setSellTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>售出商品</DialogTitle>
          </DialogHeader>
          {sellTarget && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-ink font-medium">{sellTarget.name}</p>
              <p className="text-xs text-slate-t">現有庫存：{sellTarget.stock} 件</p>
              <div>
                <label className="text-xs font-medium text-slate-t">售出數量</label>
                <Input type="number" value={sellQty} min={1} max={sellTarget.stock}
                  onChange={e => setSellQty(Number(e.target.value))} className="mt-1" />
              </div>
              <Button onClick={handleSell} disabled={selling || sellQty < 1 || sellQty > sellTarget.stock}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                {selling ? '處理中...' : `確認售出 ${sellQty} 件`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
