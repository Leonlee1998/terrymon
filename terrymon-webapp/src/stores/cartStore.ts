'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem:    (product: Product, qty?: number) => void
  removeItem: (productId: string) => void
  decrementItem: (productId: string) => void
  updateQty:  (productId: string, qty: number) => void
  clear:      () => void
  clearCart:  () => void
  totalPrice: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) => {
        const existing = get().items.find(i => i.product.id === product.id)
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.product.id === product.id
                ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
                : i
            ),
          }))
        } else {
          set(s => ({ items: [...s.items, { product, qty }] }))
        }
      },
      removeItem: (id) =>
        set(s => ({ items: s.items.filter(i => i.product.id !== id) })),
      decrementItem: (id) => {
        const item = get().items.find(i => i.product.id === id)
        if (!item) return
        get().updateQty(id, item.qty - 1)
      },
      updateQty: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return }
        set(s => ({
          items: s.items.map(i => i.product.id === id ? { ...i, qty } : i),
        }))
      },
      clear: () => set({ items: [] }),
      clearCart: () => get().clear(),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'terrymon-cart' }
  )
)
