'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Store } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import CartItemRow from '@/components/shop/CartItemRow'
import type { CartItem } from '@/types'

const SHIPPING_THRESHOLD = 999
const SHIPPING_FEE = 60

function groupByVendor(items: CartItem[]) {
  const map = new Map<string, { vendorId: string; vendorName: string; items: CartItem[] }>()
  for (const item of items) {
    const key = item.product.vendorId
    if (!map.has(key)) map.set(key, { vendorId: key, vendorName: item.product.vendorName, items: [] })
    map.get(key)!.items.push(item)
  }
  return [...map.values()]
}

export default function CartClient() {
  const router = useRouter()
  const items = useCartStore(s => s.items)
  const totalPrice = useCartStore(s => s.totalPrice())
  const totalItems = useCartStore(s => s.totalItems())
  const groups = groupByVendor(items)
  const shippingFee = groups.length > 0 ? groups.length * SHIPPING_FEE : 0
  const shippingDisplay = totalPrice >= SHIPPING_THRESHOLD ? 0 : shippingFee
  const grandTotal = totalPrice + shippingDisplay

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border-t">
        <div className="flex items-center h-14 px-4 max-w-2xl mx-auto w-full gap-3">
          <button onClick={() => router.back()} className="text-slate-t hover:text-ink transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-ink text-base flex-1">
            購物車{totalItems > 0 && <span className="text-slate-t font-normal ml-1">· {totalItems} 件</span>}
          </h1>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 gap-4">
            <span className="text-6xl">🛒</span>
            <p className="text-lg font-semibold text-ink">購物車是空的</p>
            <p className="text-sm text-slate-t text-center">快去逛逛，找到喜愛的毛孩好物</p>
            <Link href="/shop"><Button className="mt-2 bg-primary hover:bg-primary-hover text-white">去逛逛</Button></Link>
          </div>
        ) : (
          <div className="pb-52 space-y-2 pt-2">
            {groups.map(group => {
              const groupTotal = group.items.reduce((s, i) => s + i.product.price * i.qty, 0)
              const groupShipping = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
              return (
                <div key={group.vendorId} className="bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-t">
                    <Store size={14} className="text-primary" />
                    <span className="text-sm font-semibold text-ink">{group.vendorName}</span>
                  </div>
                  <div className="divide-y divide-border-t">
                    {group.items.map(item => <CartItemRow key={item.product.id} item={item} />)}
                  </div>
                  <div className="flex justify-between px-4 py-2.5 border-t border-border-t text-xs text-slate-t">
                    <span>運費 {groupShipping === 0 ? '（免運）' : formatPrice(groupShipping)}</span>
                    <span>小計 <span className="font-semibold text-ink">{formatPrice(groupTotal)}</span></span>
                  </div>
                </div>
              )
            })}

            <div className="mx-3 p-3 bg-primary-bg rounded-xl border border-primary/20 text-xs">
              {shippingDisplay === 0
                ? <p className="text-primary font-medium">🎉 已達免運門檻，全店免運！</p>
                : <p className="text-slate-t">再買 <span className="text-primary font-semibold">{formatPrice(SHIPPING_THRESHOLD - totalPrice)}</span> 享全店免運</p>
              }
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-60 z-40 bg-white border-t border-border-t shadow-lg">
          <div className="px-4 pt-3 pb-2 max-w-2xl mx-auto w-full space-y-1">
            <div className="flex justify-between text-sm text-slate-t">
              <span>商品小計</span><span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-t">
              <span>運費（共 {groups.length} 間商家）</span>
              <span>{shippingDisplay === 0 ? '免費' : formatPrice(shippingDisplay)}</span>
            </div>
            <div className="flex justify-between font-bold text-ink text-base pt-1 border-t border-border-t">
              <span>總計</span><span className="text-primary">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <div className="px-4 pb-4 max-w-2xl mx-auto w-full">
            <Button onClick={() => router.push('/shop/checkout')} className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold">
              前往結帳
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
