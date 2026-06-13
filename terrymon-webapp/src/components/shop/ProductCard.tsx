'use client'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cartStore'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onSelect: () => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    addItem(product)
    toast.success('已加入購物車')
  }

  return (
    <article
      className="cursor-pointer overflow-hidden rounded-xl border border-border-t bg-white transition hover:shadow-sm"
      onClick={onSelect}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="aspect-square w-full object-cover"
      />

      <div className="space-y-3 p-3">
        <div className="space-y-1">
          <h3 className="min-h-10 overflow-hidden text-sm font-medium leading-5 text-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {product.name}
          </h3>
          <p className="font-bold text-primary">NT$ {product.price.toLocaleString()}</p>
        </div>

        <Button
          type="button"
          className="h-9 w-full bg-accent text-sm text-white hover:bg-accent-hover"
          onClick={handleAddToCart}
        >
          ＋ 加入購物車
        </Button>
      </div>
    </article>
  )
}
