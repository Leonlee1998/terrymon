'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCartStore } from '@/stores/cartStore'
import type { Product } from '@/types'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selection, setSelection] = useState<{ productId: string | null; qty: number }>({
    productId: null,
    qty: 1,
  })
  const addItem = useCartStore((state) => state.addItem)

  if (!product) {
    return null
  }

  const qty = selection.productId === product.id ? selection.qty : 1
  const maxQty = Math.max(product.stock, 1)
  const setQty = (nextQty: number) => {
    setSelection({ productId: product.id, qty: nextQty })
  }
  const decrease = () => setQty(Math.max(1, qty - 1))
  const increase = () => setQty(Math.min(maxQty, qty + 1))

  const handleAddToCart = () => {
    addItem(product, qty)
    toast.success('已加入購物車')
    onClose()
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-md">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />

        <div className="space-y-4 p-4">
          <DialogHeader>
            <DialogTitle className="text-xl leading-snug">{product.name}</DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {product.description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="block text-muted-foreground">價格</span>
              <strong className="text-lg text-primary">NT$ {product.price.toLocaleString()}</strong>
            </div>
            <div>
              <span className="block text-muted-foreground">庫存</span>
              <strong className="text-lg text-ink">{product.stock}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border-t p-2">
            <span className="text-sm font-medium">數量</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon-sm" onClick={decrease}>
                <Minus />
                <span className="sr-only">減少數量</span>
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={increase}
                disabled={qty >= maxQty}
              >
                <Plus />
                <span className="sr-only">增加數量</span>
              </Button>
            </div>
          </div>

          <Button
            type="button"
            className="h-10 w-full bg-primary text-white hover:bg-primary-hover"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            加入購物車
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
