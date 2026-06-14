'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
import { categoryLabel, speciesLabel } from '@/lib/shopFilters'
import { formatPrice } from '@/lib/utils'
import type { ProductStatus } from '@/types'

const STATUS_TABS: { label: string; value: ProductStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '上架', value: 'active' },
  { label: '下架', value: 'inactive' },
  { label: '售完', value: 'sold_out' },
  { label: '審核中', value: 'review' },
]

const STATUS_BADGE: Record<ProductStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  sold_out: 'bg-red-100 text-red-700',
  review: 'bg-yellow-100 text-yellow-700',
}

const STATUS_LABEL: Record<ProductStatus, string> = {
  active: '上架',
  inactive: '下架',
  sold_out: '售完',
  review: '審核中',
}

export default function ProductsPage() {
  const { products, toggleProductStatus } = useVendorStore()
  const [activeTab, setActiveTab] = useState<ProductStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState(new Set<string>())

  const filtered = products.filter(product => {
    if (activeTab !== 'all' && product.status !== activeTab) return false
    if (search && !product.name.includes(search)) return false
    return true
  })

  async function handleToggle(id: string) {
    if (toggling.has(id)) return
    setToggling(current => new Set(current).add(id))
    try {
      await toggleProductStatus(id)
    } catch {
      toast.error('商品狀態更新失敗')
    } finally {
      setToggling(current => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">商品管理</h1>
        <Link href="/products/new">
          <Button className="gap-2 bg-primary text-white hover:bg-primary-hover">
            <Plus size={16} /> 新增商品
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex gap-1 rounded-xl border border-border-t bg-surface p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab.value ? 'bg-primary text-white' : 'text-slate-t hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="搜尋商品..."
          className="h-9 rounded-xl border border-border-t bg-white px-3 text-sm text-ink outline-none placeholder:text-slate-t focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-t bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-t bg-surface">
              {['商品', '寵物/分類', '售價', '成本', '庫存', '銷量', '評分', '狀態', '操作'].map(header => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-t">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-t">
            {filtered.map(product => (
              <tr key={product.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-xl object-cover" />
                    <span className="max-w-[160px] truncate font-medium text-ink">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-t">
                  {speciesLabel(product.petSpecies ?? 'all')} · {categoryLabel(product.category)}
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 text-slate-t">{formatPrice(product.cost)}</td>
                <td className="px-4 py-3 text-slate-t">{product.stock}</td>
                <td className="px-4 py-3 text-slate-t">{product.totalSold}</td>
                <td className="px-4 py-3 text-slate-t">{product.rating} 分</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_BADGE[product.status]}`}>
                    {STATUS_LABEL[product.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(product.id)}
                      disabled={toggling.has(product.id)}
                      title={product.status === 'active' ? '切換為下架' : '切換為上架'}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        product.status === 'active' ? 'bg-primary' : 'bg-gray-200'
                      } ${toggling.has(product.id) ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        product.status === 'active' ? 'translate-x-4' : 'translate-x-1'
                      }`} />
                    </button>
                    <Link href={`/products/${product.id}`} className="flex items-center gap-1 text-xs text-slate-t hover:text-primary">
                      <Pencil size={13} /> 編輯
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-t">
            <p>找不到符合條件的商品</p>
          </div>
        )}
      </div>
    </div>
  )
}
