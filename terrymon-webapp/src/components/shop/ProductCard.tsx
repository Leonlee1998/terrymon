'use client'

import Link from 'next/link'
import { Plus, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem)
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    addItem(product)
    toast.success('已加入購物車', { description: product.name })
  }

  return (
    <Link href={`/shop/${product.id}`}>
      <article className="group overflow-hidden rounded-[22px] border border-[#eadfd2] bg-white shadow-sm shadow-[#e9cda7]/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#e8b56e]/20">
        <div className="relative aspect-square overflow-hidden bg-[#fff7ed]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-1 text-[10px] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-amber-700 shadow-sm">
              庫存 {product.stock}
            </span>
          )}
        </div>

        <div className="space-y-2 p-3">
          <p className="truncate text-xs font-medium text-[#8d7f71]">{product.vendorName}</p>
          <p className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink">
            {product.name}
          </p>

          <div className="flex items-center gap-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-t">{product.rating} ({product.reviewCount})</span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <span className="font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="ml-1 text-xs text-slate-t line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="grid size-9 shrink-0 place-items-center rounded-2xl bg-accent text-white shadow-sm shadow-accent/20 transition hover:bg-[#ff8a5f]"
            >
              <Plus size={17} />
              <span className="sr-only">加入購物車</span>
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
