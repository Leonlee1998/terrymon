import { create } from 'zustand'

import type { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  decrementItem: (productId: string) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product, qty = 1) =>
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id)

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, qty: Math.min(item.qty + qty, product.stock) }
              : item
          ),
        }
      }

      return {
        items: [...state.items, { product, qty: Math.min(qty, product.stock) }],
      }
    }),
  decrementItem: (productId) =>
    set((state) => ({
      items: state.items
        .map((item) => (item.product.id === productId ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    })),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),
  clearCart: () => set({ items: [] }),
}))
