'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface Props { product: Product }

export default function ProductDetail({ product }: Props) {
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const router = useRouter()

  const soldOut = product.stock <= 0

  function handleAdd() {
    addItem(product, qty)
    toast.success(`已加入購物車 ×${qty}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Sticky back button */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border-t">
        <div className="flex items-center h-14 px-4 max-w-2xl mx-auto w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-slate-t hover:text-ink transition-colors"
          >
            <ArrowLeft size={18} />
            返回
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 pb-32 max-w-2xl mx-auto w-full">
        {/* Product image */}
        <div className="aspect-square w-full bg-surface overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-4">
          {/* Vendor */}
          <span className="inline-block bg-primary-bg text-primary text-xs font-medium px-2.5 py-1 rounded-full">
            {product.vendorName}
          </span>

          {/* Name */}
          <h1 className="text-xl font-bold text-ink leading-snug">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-ink">{product.rating}</span>
            <span className="text-xs text-slate-t">（{product.reviewCount} 則評論）</span>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(tag => (
                <span key={tag} className="bg-surface text-slate-t text-xs px-2.5 py-1 rounded-full border border-border-t">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-slate-t line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Low stock warning */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-amber-600 font-medium">⚠️ 僅剩 {product.stock} 件</p>
          )}
          {soldOut && (
            <p className="text-xs text-red-500 font-medium">暫時缺貨</p>
          )}

          <hr className="border-border-t" />

          {/* Specs */}
          {Object.keys(product.specs).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-2">商品規格</h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} className="border-b border-border-t last:border-0">
                      <td className="py-2 pr-4 text-slate-t w-1/3">{key}</td>
                      <td className="py-2 text-ink font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <hr className="border-border-t" />

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-2">商品說明</h3>
            <p className="text-sm text-slate-t leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border-t safe-bottom">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto w-full">
          {/* Qty selector */}
          <div className="flex items-center gap-2 border border-border-t rounded-xl overflow-hidden">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={soldOut || qty <= 1}
              className="w-10 h-10 flex items-center justify-center text-slate-t hover:text-ink disabled:opacity-30 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-semibold text-ink text-sm">{qty}</span>
            <button
              onClick={() => setQty(q => Math.min(product.stock, q + 1))}
              disabled={soldOut || qty >= product.stock}
              className="w-10 h-10 flex items-center justify-center text-slate-t hover:text-ink disabled:opacity-30 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add to cart */}
          <Button
            onClick={handleAdd}
            disabled={soldOut}
            className="flex-1 h-10 bg-primary hover:bg-primary-hover text-white font-semibold"
          >
            {soldOut ? '暫時缺貨' : '加入購物車'}
          </Button>
        </div>
      </div>
    </div>
  )
}
