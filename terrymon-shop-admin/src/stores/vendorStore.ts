'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_VENDOR, MOCK_PRODUCTS, MOCK_PROMOTIONS } from '@/lib/mock'
import type { Vendor, Product, Promotion } from '@/types'

interface VendorStore {
  isLoggedIn: boolean
  vendor: Vendor | null
  products: Product[]
  promotions: Promotion[]

  login: () => void
  logout: () => void
  updateProduct: (p: Product) => void
  addProduct: (p: Product) => void
  toggleProductStatus: (id: string) => void
  addPromotion: (p: Promotion) => void
  togglePromotion: (id: string) => void
}

export const useVendorStore = create<VendorStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      vendor: null,
      products: MOCK_PRODUCTS,
      promotions: MOCK_PROMOTIONS,

      login: () => set({ isLoggedIn: true, vendor: MOCK_VENDOR }),
      logout: () => set({ isLoggedIn: false, vendor: null }),

      updateProduct: (p) =>
        set(s => ({ products: s.products.map(x => x.id === p.id ? p : x) })),
      addProduct: (p) =>
        set(s => ({ products: [...s.products, p] })),
      toggleProductStatus: (id) =>
        set(s => ({
          products: s.products.map(p =>
            p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' as const : 'active' as const } : p
          ),
        })),
      addPromotion: (p) =>
        set(s => ({ promotions: [...s.promotions, p] })),
      togglePromotion: (id) =>
        set(s => ({
          promotions: s.promotions.map(p =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        })),
    }),
    { name: 'terrymon-vendor' }
  )
)
