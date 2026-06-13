'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'

export default function CartFAB() {
  const { totalItems, totalPrice } = useCartStore()
  const count = totalItems()
  const price = totalPrice()

  if (count === 0) return null

  return (
    <Link
      href="/shop/cart"
      className="fixed bottom-24 right-4 md:bottom-8 md:right-6 z-40
                 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30
                 flex items-center gap-2 px-4 py-3 hover:bg-primary-hover transition-colors"
    >
      <ShoppingCart size={20} />
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] font-medium opacity-80">{count} 件商品</span>
        <span className="text-sm font-bold">{formatPrice(price)}</span>
      </div>
    </Link>
  )
}
