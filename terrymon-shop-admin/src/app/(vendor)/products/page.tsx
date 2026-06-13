'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
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
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  sold_out: 'bg-red-100 text-red-700',
  review:   'bg-yellow-100 text-yellow-700',
}
const STATUS_LABEL: Record<ProductStatus, string> = {
  active: '上架', inactive: '下架', sold_out: '售完', review: '審核中',
}

export default function ProductsPage() {
  const { products, toggleProductStatus } = useVendorStore()
  const [activeTab, setActiveTab] = useState<ProductStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab) return false
    if (search && !p.name.includes(search)) return false
    return true
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-ink">商品管理</h1>
        <Link href="/products/new">
          <Button className="bg-primary hover:bg-primary-hover text-white gap-2">
            <Plus size={16} /> 新增商品
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1 bg-surface border border-border-t rounded-xl p-1">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.value ? 'bg-primary text-white' : 'text-slate-t hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜尋商品..."
          className="h-9 rounded-xl border border-border-t bg-white px-3 text-sm text-ink placeholder:text-slate-t outline-none focus:border-primary"
        />
      </div>

      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-t bg-surface">
              {['商品', '分類', '售價', '成本', '庫存', '已售', '評分', '狀態', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-t">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-t">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                    <span className="font-medium text-ink max-w-[160px] truncate">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-t">{p.category}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-slate-t">{formatPrice(p.cost)}</td>
                <td className="px-4 py-3 text-slate-t">{p.stock}</td>
                <td className="px-4 py-3 text-slate-t">{p.totalSold}</td>
                <td className="px-4 py-3 text-slate-t">{p.rating} ⭐</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleProductStatus(p.id)}
                      title={p.status === 'active' ? '點擊下架' : '點擊上架'}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        p.status === 'active' ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        p.status === 'active' ? 'translate-x-4' : 'translate-x-1'
                      }`} />
                    </button>
                    <Link href={`/products/${p.id}`}
                      className="flex items-center gap-1 text-slate-t hover:text-primary text-xs">
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
            <p>沒有符合條件的商品</p>
          </div>
        )}
      </div>
    </div>
  )
}
