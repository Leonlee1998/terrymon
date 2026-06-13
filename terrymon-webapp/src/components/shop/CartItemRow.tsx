'use client'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'

interface Props { item: CartItem }

export default function CartItemRow({ item }: Props) {
  const { updateQty, removeItem } = useCartStore()
  const { product, qty } = item

  function handleDecrement() {
    if (qty === 1) {
      if (window.confirm(`確定要移除「${product.name}」嗎？`)) {
        removeItem(product.id)
      }
    } else {
      updateQty(product.id, qty - 1)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Product image */}
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-[60px] h-[60px] rounded-xl object-cover flex-shrink-0 bg-surface"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-t truncate">{product.vendorName}</p>
        <p className="text-sm font-medium text-ink leading-snug line-clamp-2 mt-0.5">
          {product.name}
        </p>
        <p className="text-sm font-bold text-primary mt-1">
          {formatPrice(product.price * qty)}
        </p>
      </div>

      {/* Qty controls + delete */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          {/* Minus / Trash */}
          <button
            onClick={handleDecrement}
            className="w-7 h-7 rounded-full border border-border-t flex items-center justify-center text-slate-t hover:text-red-500 hover:border-red-300 transition-colors"
          >
            {qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
          </button>

          <span className="w-6 text-center text-sm font-semibold text-ink">{qty}</span>

          {/* Plus */}
          <button
            onClick={() => updateQty(product.id, qty + 1)}
            disabled={qty >= product.stock}
            className="w-7 h-7 rounded-full border border-border-t flex items-center justify-center text-slate-t hover:text-primary hover:border-primary disabled:opacity-30 transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
