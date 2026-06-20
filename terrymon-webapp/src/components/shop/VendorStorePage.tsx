'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import ProductCard from './ProductCard'
import VendorStoreHeader from './VendorStoreHeader'
import type { Product, Vendor } from '@/types'

interface Props {
  vendor: Vendor
  products: Product[]
}

export default function VendorStorePage({ vendor, products }: Props) {
  const router = useRouter()
  const totalItems = useCartStore(s => s.totalItems())
  const tabRef = useRef<HTMLDivElement>(null)

  // Build unique section tabs from products (preserve insertion order)
  const sections = ['全部', ...Array.from(
    new Set(products.map(p => p.storeSection).filter(Boolean) as string[])
  )]

  const [activeSection, setActiveSection] = useState('全部')

  const filtered = activeSection === '全部'
    ? products
    : products.filter(p => p.storeSection === activeSection)

  function selectSection(section: string) {
    setActiveSection(section)
    tabRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Sticky top nav */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border-t">
        <div className="flex items-center h-14 px-4 max-w-2xl mx-auto w-full">
          <button onClick={() => router.back()} className="text-slate-t hover:text-ink mr-3">
            <ArrowLeft size={20} />
          </button>
          <span className="flex-1 font-semibold text-ink text-sm truncate">{vendor.storeName}</span>
          <button
            onClick={() => router.push(`/messages/shop/${vendor.id}`)}
            className="text-slate-t hover:text-ink p-1 transition-colors"
            aria-label="與商家聊聊"
          >
            <MessageCircle size={20} />
          </button>
          <button onClick={() => router.push('/shop/cart')} className="relative text-slate-t hover:text-ink p-1">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Vendor banner */}
      <VendorStoreHeader vendor={vendor} productCount={products.length} />

      {/* Sticky section tabs */}
      {sections.length > 1 && (
        <div className="sticky top-14 z-10 bg-white border-b border-border-t">
          <div className="flex overflow-x-auto scrollbar-none px-4 gap-1 max-w-2xl mx-auto">
            {sections.map(section => (
              <button
                key={section}
                onClick={() => selectSection(section)}
                className={`shrink-0 px-3.5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === section
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-t hover:text-ink'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product grid */}
      <div ref={tabRef} className="flex-1 max-w-2xl mx-auto w-full px-3 py-3">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-t text-sm">此分類目前沒有商品</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
