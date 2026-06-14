'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_PRODUCTS, MOCK_PROMOTIONS } from '@/lib/mock'
import type { Vendor, Product, Promotion, ProductFormData } from '@/types'
import { vendorApi } from '@/services/api'

interface VendorStore {
  isLoggedIn: boolean
  vendor: Vendor | null
  products: Product[]
  promotions: Promotion[]

  load: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  addProduct: (data: ProductFormData) => Promise<void>
  updateProduct: (id: string, data: ProductFormData) => Promise<void>
  toggleProductStatus: (id: string) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  updateProductStock: (productId: string, stock: number) => void
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

      load: async () => {
        const [products, promotions] = await Promise.all([
          vendorApi.getProducts(),
          vendorApi.getPromotions(),
        ])
        const vendor = await vendorApi.getVendor(products)
        set({ vendor, products, promotions })
      },
      login: async (email, password) => {
        const vendor = await vendorApi.signIn(email, password)
        const [products, promotions] = await Promise.all([
          vendorApi.getProducts(),
          vendorApi.getPromotions(),
        ])
        set({ isLoggedIn: true, vendor, products, promotions })
      },
      logout: async () => {
        await vendorApi.signOut()
        set({ isLoggedIn: false, vendor: null })
      },

      addProduct: async (data) => {
        const product = await vendorApi.createProduct(data)
        set(s => ({ products: [...s.products, product] }))
      },
      updateProduct: async (id, data) => {
        const product = await vendorApi.updateProduct(id, data)
        set(s => ({ products: s.products.map(x => x.id === id ? product : x) }))
      },
      toggleProductStatus: async (id) => {
        const current = get().products.find(p => p.id === id)
        if (!current) return
        const newStatus = current.status === 'active' ? 'inactive' as const : 'active' as const
        set(s => ({ products: s.products.map(p => p.id === id ? { ...p, status: newStatus } : p) }))
        try {
          const updated = await vendorApi.patchProductStatus(id, newStatus)
          set(s => ({ products: s.products.map(p => p.id === id ? updated : p) }))
        } catch (e) {
          set(s => ({ products: s.products.map(p => p.id === id ? current : p) }))
          throw e
        }
      },
      deleteProduct: async (id) => {
        await vendorApi.deleteProduct(id)
        set(s => ({ products: s.products.filter(p => p.id !== id) }))
      },
      updateProductStock: (productId, stock) =>
        set(s => ({
          products: s.products.map(p => p.id === productId ? { ...p, stock } : p),
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
