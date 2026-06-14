import { Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import type { BrandProduct } from '@/types'

type PriceEntry = { retailPrice: number; memberPrice: number; stock: number }

interface Props {
  products: BrandProduct[]
  selection: Record<string, PriceEntry>
  onToggle: (p: BrandProduct) => void
  onUpdate: (id: string, field: keyof PriceEntry, value: number) => void
}

export default function BrandProductTable({ products, selection, onToggle, onUpdate }: Props) {
  if (!products.length) {
    return (
      <div className="text-center py-16 text-slate-t">
        <Package size={36} className="mx-auto mb-3 opacity-25" />
        <p className="text-sm">此品牌目前沒有商品</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-surface text-xs font-semibold text-slate-t uppercase tracking-wide">
        <span />
        <span className="col-span-4">商品名稱</span>
        <span className="col-span-2">分類</span>
        <span className="col-span-2">建議售價</span>
        <span className="col-span-1">門市售價</span>
        <span className="col-span-1">會員價</span>
        <span className="col-span-1">初始庫存</span>
      </div>

      <div className="divide-y divide-border-t">
        {products.map(p => {
          const entry = selection[p.id]
          const checked = !!entry
          return (
            <div
              key={p.id}
              className={`grid grid-cols-12 gap-2 px-5 py-3 items-center transition-colors ${checked ? 'bg-primary/5' : 'hover:bg-surface/60'}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(p)}
                disabled={!p.isActive}
                className="w-4 h-4 accent-primary cursor-pointer"
              />

              <div className="col-span-4">
                <p className="font-medium text-ink text-sm">{p.name}</p>
                {p.barcode && <p className="text-xs text-slate-t font-mono mt-0.5">{p.barcode}</p>}
              </div>

              <span className="col-span-2 text-sm text-slate-t">{p.category}</span>
              <span className="col-span-2 text-sm text-slate-t">{formatPrice(p.suggestedPrice)}</span>

              <div className="col-span-1">
                {checked
                  ? <Input type="number" value={entry.retailPrice} min={0} onChange={e => onUpdate(p.id, 'retailPrice', Number(e.target.value))} className="h-8 text-sm px-2" />
                  : <span className="text-slate-t/40 text-sm">—</span>}
              </div>
              <div className="col-span-1">
                {checked
                  ? <Input type="number" value={entry.memberPrice} min={0} onChange={e => onUpdate(p.id, 'memberPrice', Number(e.target.value))} className="h-8 text-sm px-2" />
                  : <span className="text-slate-t/40 text-sm">—</span>}
              </div>
              <div className="col-span-1">
                {checked
                  ? <Input type="number" value={entry.stock} min={0} onChange={e => onUpdate(p.id, 'stock', Number(e.target.value))} className="h-8 text-sm px-2" />
                  : <span className="text-slate-t/40 text-sm">—</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
