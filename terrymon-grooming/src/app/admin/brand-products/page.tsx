'use client'
import { useState, useEffect, useCallback } from 'react'
import { Package, Send } from 'lucide-react'
import { toast } from 'sonner'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import BrandProductTable from '@/components/admin/BrandProductTable'
import { Button } from '@/components/ui/button'
import { brandApi } from '@/services/api'
import type { Brand, BrandProduct, Store } from '@/types'

type PriceEntry = { retailPrice: number; memberPrice: number; stock: number }
type Selection  = Record<string, PriceEntry>

export default function BrandProductsPage() {
  const [brands,   setBrands]   = useState<Brand[]>([])
  const [stores,   setStores]   = useState<Store[]>([])
  const [products, setProducts] = useState<BrandProduct[]>([])
  const [brandId,  setBrandId]  = useState('')
  const [storeIds, setStoreIds] = useState<Set<string>>(new Set())
  const [selection, setSelection] = useState<Selection>({})
  const [pushing, setPushing] = useState(false)

  useEffect(() => {
    brandApi.getBrands().then(data => setBrands(data.filter(b => b.status === 'active')))
    brandApi.getStores().then(data => setStores(data.filter(s => s.isActive)))
  }, [])

  useEffect(() => {
    if (!brandId) { setProducts([]); setSelection({}); return }
    brandApi.getBrandProducts(brandId).then(setProducts)
    setSelection({})
  }, [brandId])

  const toggleProduct = useCallback((p: BrandProduct) => {
    setSelection(s => {
      if (s[p.id]) { const next = { ...s }; delete next[p.id]; return next }
      return { ...s, [p.id]: { retailPrice: p.suggestedPrice, memberPrice: Math.round(p.suggestedPrice * 0.9), stock: 10 } }
    })
  }, [])

  const updateEntry = useCallback((id: string, field: keyof PriceEntry, value: number) => {
    setSelection(s => ({ ...s, [id]: { ...s[id], [field]: value } }))
  }, [])

  function toggleStore(id: string) {
    setStoreIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handlePush() {
    if (!brandId)                        return toast.error('請選擇品牌')
    if (!storeIds.size)                  return toast.error('請至少選擇一個門市')
    if (!Object.keys(selection).length)  return toast.error('請至少勾選一項商品')
    const items = Object.entries(selection).map(([brandProductId, v]) => ({ brandProductId, ...v }))
    setPushing(true)
    try {
      await Promise.all([...storeIds].map(sid => brandApi.pushInventory(brandId, sid, items)))
      toast.success(`已 push ${items.length} 項商品至 ${storeIds.size} 間門市`)
      setSelection({})
    } catch (e) {
      toast.error((e as Error).message || 'Push 失敗，請稍後再試')
    } finally {
      setPushing(false)
    }
  }

  const selectedCount = Object.keys(selection).length

  return (
    <div className="p-6">
      <AdminPageHeader
        title="品牌商品 Push"
        subtitle="選擇品牌商品後推送至指定門市，自動建立 POS 庫存"
        action={
          <Button onClick={handlePush} disabled={pushing || !selectedCount || !storeIds.size} className="bg-primary text-white">
            <Send size={16} className="mr-2" />
            {pushing ? '推送中...' : `Push（${selectedCount} 商品 × ${storeIds.size} 門市）`}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-ink mb-1">品牌</label>
          <select value={brandId} onChange={e => setBrandId(e.target.value)}
            className="w-full h-10 rounded-xl border border-border-t bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="">選擇品牌...</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-ink mb-1">目標門市（可多選）</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {stores.map(s => (
              <label key={s.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                storeIds.has(s.id) ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border-t text-slate-t hover:border-primary/50'
              }`}>
                <input type="checkbox" checked={storeIds.has(s.id)} onChange={() => toggleStore(s.id)} className="accent-primary" />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {selectedCount > 0 && storeIds.size > 0 && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
          已選 {selectedCount} 項商品，將 push 至 {storeIds.size} 間門市
        </div>
      )}

      {!brandId ? (
        <div className="text-center py-20 text-slate-t">
          <Package size={44} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">請先選擇品牌以查看商品目錄</p>
        </div>
      ) : (
        <BrandProductTable products={products} selection={selection} onToggle={toggleProduct} onUpdate={updateEntry} />
      )}
    </div>
  )
}
