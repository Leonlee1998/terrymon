'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import CartItemRow from '@/components/shop/CartItemRow'

const SHIPPING_THRESHOLD = 999
const SHIPPING_FEE = 60

export default function CartClient() {
  const router = useRouter()
  const items = useCartStore(s => s.items)
  const totalPrice = useCartStore(s => s.totalPrice())
  const totalItems = useCartStore(s => s.totalItems())

  const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const grandTotal = totalPrice + shippingFee

  function handleCheckout() {
    router.push('/shop/checkout')
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border-t">
        <div className="flex items-center h-14 px-4 max-w-2xl mx-auto w-full gap-3">
          <button
            onClick={() => router.back()}
            className="text-slate-t hover:text-ink transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-ink text-base flex-1">
            購物車
            {totalItems > 0 && (
              <span className="text-slate-t font-normal ml-1">· {totalItems} 件</span>
            )}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 px-8 gap-4">
            <span className="text-6xl">🛒</span>
            <p className="text-lg font-semibold text-ink">購物車是空的</p>
            <p className="text-sm text-slate-t text-center">快去逛逛，找到喜愛的毛孩好物</p>
            <Link href="/shop">
              <Button className="mt-2 bg-primary hover:bg-primary-hover text-white">
                去逛逛
              </Button>
            </Link>
          </div>
        ) : (
          <div className="pb-52">
            {/* Item list */}
            <div className="bg-white divide-y divide-border-t">
              {items.map(item => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </div>

            {/* Shipping note */}
            <div className="mx-4 mt-3 p-3 bg-primary-bg rounded-xl border border-primary/20">
              {shippingFee === 0 ? (
                <p className="text-xs text-primary font-medium">🎉 已達免運門檻，享免運費！</p>
              ) : (
                <p className="text-xs text-slate-t">
                  再購買 <span className="text-primary font-semibold">{formatPrice(SHIPPING_THRESHOLD - totalPrice)}</span> 即可享免運費
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom summary */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border-t safe-bottom shadow-lg">
          <div className="px-4 pt-3 pb-2 max-w-2xl mx-auto w-full space-y-1.5">
            <div className="flex justify-between text-sm text-slate-t">
              <span>商品小計</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-t">
              <span>運費</span>
              <span>{shippingFee === 0 ? '免費' : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-ink text-base pt-1 border-t border-border-t">
              <span>總計</span>
              <span className="text-primary">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <div className="px-4 pb-3 max-w-2xl mx-auto w-full">
            <Button
              onClick={handleCheckout}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold"
            >
              前���結帳
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
