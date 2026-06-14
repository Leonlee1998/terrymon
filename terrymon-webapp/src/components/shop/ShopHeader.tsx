'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

export default function ShopHeader() {
  const totalItems = useCartStore(s => s.totalItems())

  return (
    <header className="sticky top-0 z-20 border-b border-[#f1deca] bg-[#fff8ed]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <h2 className="font-bold text-ink text-base">商城</h2>
        <Link
          href="/shop/cart"
          className="relative grid size-10 place-items-center rounded-2xl border border-[#eadfd2] bg-white text-ink shadow-sm transition hover:border-primary/40"
          aria-label={`購物車，共 ${totalItems} 件`}
        >
          <ShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
