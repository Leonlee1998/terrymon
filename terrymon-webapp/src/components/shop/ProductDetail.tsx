'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Minus, Plus, ShoppingCart, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import ImageGallery from './ImageGallery'
import VendorSection from './VendorSection'
import ProductInfoTabs from './ProductInfoTabs'
import type { Product, Vendor } from '@/types'

interface Props {
  product: Product
  vendor: Vendor | null
}

export default function ProductDetail({ product, vendor }: Props) {
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const router = useRouter()
  const soldOut = product.stock <= 0
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  function handleAdd() {
    addItem(product, qty)
    toast.success(`已加入購物車 ×${qty}`)
  }

  function handleBuyNow() {
    addItem(product, qty)
    router.push('/shop/cart')
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border-t">
        <div className="flex items-center h-14 px-4 max-w-2xl mx-auto w-full">
          <button onClick={() => router.back()} className="text-slate-t hover:text-ink transition-colors mr-3">
            <ArrowLeft size={20} />
          </button>
          <span className="flex-1 font-semibold text-ink text-sm truncate">{product.name}</span>
          <button onClick={() => router.push('/shop/cart')} className="text-slate-t hover:text-ink p-1">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 pb-32 max-w-2xl mx-auto w-full">
        <ImageGallery images={product.images.length ? product.images : [product.imageUrl]} alt={product.name} />

        {/* Price block */}
        <div className="bg-white px-4 pt-3 pb-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2 flex-wrap flex-1">
              <span className="text-2xl font-black text-accent">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-t line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {discount && (
                <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded font-bold">-{discount}%</span>
              )}
            </div>
            {vendor && (
              <button
                onClick={() => router.push(`/messages/shop/${vendor.id}?msg=${encodeURIComponent(`我想詢問關於「${product.name}」的問題`)}`)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary text-primary text-xs font-semibold hover:bg-primary-bg transition-colors"
              >
                <MessageCircle size={14} />
                詢問商家
              </button>
            )}
          </div>

          <h1 className="text-base font-bold text-ink mt-2 leading-snug">{product.name}</h1>

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-t">
            <span className="flex items-center gap-0.5">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="font-medium text-ink">{product.rating}</span>
            </span>
            <span>{product.reviewCount.toLocaleString()} 評論</span>
            {product.stock <= 10 && product.stock > 0 && (
              <span className="text-amber-600 font-medium">僅剩 {product.stock} 件</span>
            )}
            {soldOut && <span className="text-red-500 font-medium">暫時缺貨</span>}
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {product.tags.map(tag => (
                <span key={tag} className="bg-surface text-slate-t text-xs px-2 py-0.5 rounded-full border border-border-t">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Vendor */}
        {vendor && <div className="mb-2"><VendorSection vendor={vendor} /></div>}

        {/* Tabs: description + specs */}
        <div className="mb-2"><ProductInfoTabs product={product} /></div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border-t bg-white md:bottom-0 md:left-60">
        <div className="flex items-center gap-2 px-4 py-3 max-w-2xl mx-auto w-full">
          <div className="flex items-center border border-border-t rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={soldOut || qty <= 1}
              className="w-9 h-9 flex items-center justify-center text-slate-t hover:text-ink disabled:opacity-30"
            >
              <Minus size={15} />
            </button>
            <span className="w-8 text-center font-semibold text-ink text-sm">{qty}</span>
            <button
              onClick={() => setQty(q => Math.min(product.stock, q + 1))}
              disabled={soldOut || qty >= product.stock}
              className="w-9 h-9 flex items-center justify-center text-slate-t hover:text-ink disabled:opacity-30"
            >
              <Plus size={15} />
            </button>
          </div>
          <Button
            onClick={handleAdd}
            disabled={soldOut}
            variant="outline"
            className="flex-1 h-10 border-primary text-primary hover:bg-primary-bg font-semibold"
          >
            加入購物車
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={soldOut}
            className="flex-1 h-10 bg-accent hover:bg-accent-hover text-white font-semibold"
          >
            立即購買
          </Button>
        </div>
      </div>
    </div>
  )
}
