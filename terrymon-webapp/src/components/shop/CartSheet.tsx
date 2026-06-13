'use client'

import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCartStore } from '@/stores/cartStore'

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, addItem, decrementItem, clearCart } = useCartStore()
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.qty, 0)

  const handleCheckout = () => {
    toast.info('線上結帳即將開放，歡迎至門市付款')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md gap-0 p-0">
        <SheetHeader className="border-b border-border-t pr-12">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle>購物車（{totalItems} 件）</SheetTitle>
            {items.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-red-600 hover:text-red-700"
                onClick={clearCart}
              >
                清空購物車
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div>
              <p className="font-medium text-ink">購物車是空的</p>
              <p className="mt-1 text-sm text-muted-foreground">挑選商品後會顯示在這裡。</p>
            </div>
            <SheetClose render={<Button variant="outline" />}>繼續購物</SheetClose>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {items.map((item) => {
                const subtotal = item.product.price * item.qty

                return (
                  <article
                    key={item.product.id}
                    className="grid grid-cols-[72px_1fr] gap-3 rounded-xl border border-border-t p-2"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-medium leading-5 text-ink">
                          {item.product.name}
                        </h3>
                        <span className="shrink-0 text-sm font-bold text-primary">
                          NT$ {subtotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => decrementItem(item.product.id)}
                          >
                            <Minus />
                            <span className="sr-only">減少數量</span>
                          </Button>
                          <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => addItem(item.product)}
                            disabled={item.qty >= item.product.stock}
                          >
                            <Plus />
                            <span className="sr-only">增加數量</span>
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          單價 NT$ {item.product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter className="border-t border-border-t">
            <div className="flex items-center justify-between text-base font-semibold">
              <span>總計</span>
              <span className="text-primary">NT$ {totalPrice.toLocaleString()}</span>
            </div>
            <Button
              type="button"
              className="h-10 w-full bg-primary text-white hover:bg-primary-hover"
              onClick={handleCheckout}
            >
              前往結帳
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
