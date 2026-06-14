import { Switch } from '@/components/ui/switch'
import { formatPrice } from '@/lib/utils'
import type { ShopProduct } from '@/types'

interface Props {
  products: ShopProduct[]
  onEdit:   (p: ShopProduct) => void
  onSell:   (p: ShopProduct) => void
  onToggle: (p: ShopProduct) => void
}

export default function ShopProductTable({ products, onEdit, onSell, onToggle }: Props) {
  if (!products.length) {
    return <p className="text-center text-slate-t py-10 text-sm">此分類尚無商品，請先從「品牌商品 Push」新增</p>
  }

  return (
    <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-surface text-xs font-semibold text-slate-t uppercase">
        <span className="col-span-4">商品名稱</span>
        <span className="col-span-2">分類</span>
        <span className="col-span-2">售價 / 會員價</span>
        <span className="col-span-2">庫存</span>
        <span className="col-span-2 text-center">操作</span>
      </div>

      <div className="divide-y divide-border-t">
        {products.map(p => (
          <div key={p.id} className="grid grid-cols-12 gap-2 px-5 py-3 items-center">
            <div className="col-span-4">
              <p className="font-medium text-ink text-sm">{p.name}</p>
              {p.barcode && <p className="text-xs text-slate-t font-mono mt-0.5">{p.barcode}</p>}
            </div>

            <p className="col-span-2 text-sm text-slate-t">{p.category}</p>

            <div className="col-span-2">
              <p className="text-sm font-semibold text-ink">{formatPrice(p.price)}</p>
              <p className="text-xs text-primary">{formatPrice(p.memberPrice)}</p>
            </div>

            <div className="col-span-2">
              <p className={`text-sm font-medium ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-ink'}`}>
                {p.stock} 件
                {p.stock === 0 && <span className="text-xs ml-1">售完</span>}
                {p.stock > 0 && p.stock <= 5 && <span className="text-xs ml-1">低庫存</span>}
              </p>
            </div>

            <div className="col-span-2 flex items-center justify-center gap-2">
              <Switch checked={p.isActive} onCheckedChange={() => onToggle(p)} />
              <button onClick={() => onEdit(p)} className="text-xs text-primary hover:underline">編輯</button>
              <button
                onClick={() => onSell(p)}
                disabled={p.stock === 0}
                className="text-xs text-amber-600 hover:underline disabled:opacity-30"
              >
                售出
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
