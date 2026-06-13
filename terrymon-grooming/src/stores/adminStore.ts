'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  MOCK_GROOMERS, MOCK_SERVICES, MOCK_SHOP_PRODUCTS,
  MOCK_SHIFTS, MOCK_STORE_HOURS, MOCK_GROOMING_RECORDS,
  BREED_DATABASE,
} from '@/lib/mock'
import { CONTRACT_TEMPLATE } from '@/lib/mock'
import { adminApi } from '@/services/api'
import type {
  Groomer, GroomingService, ShopProduct,
  GroomerShift, StoreHours, GroomingRecord, Breed,
} from '@/types'

// MOCK_GROOMING_RECORDS / GroomingRecord kept for future record-access actions
void (MOCK_GROOMING_RECORDS as GroomingRecord[])

interface AdminStore {
  isLoggedIn: boolean
  groomers: Groomer[]
  services: GroomingService[]
  shopProducts: ShopProduct[]
  shifts: GroomerShift[]
  storeHours: StoreHours[]
  breeds: Breed[]
  shopName: string; shopPhone: string; shopAddress: string; shopLineId: string
  contractTemplate: string

  login: () => void
  logout: () => void
  load: () => Promise<void>

  // Shop
  updateShopInfo: (info: Partial<Pick<AdminStore, 'shopName' | 'shopPhone' | 'shopAddress' | 'shopLineId'>>) => void
  updateContractTemplate: (text: string) => void

  // Groomers
  addGroomer:    (g: Groomer) => void
  updateGroomer: (g: Groomer) => void
  toggleGroomer: (id: string) => void

  // Services
  addService:    (s: GroomingService) => void
  updateService: (s: GroomingService) => void
  toggleService: (id: string) => void

  // Shop Products
  addProduct:    (p: ShopProduct) => void
  updateProduct: (p: ShopProduct) => void
  toggleProduct: (id: string) => void

  // Schedule
  setShift:    (shift: GroomerShift) => void
  updateHours: (hours: StoreHours[]) => void

  // Breeds
  addBreed:    (b: Breed) => void
  updateBreed: (b: Breed) => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      groomers:     MOCK_GROOMERS,
      services:     MOCK_SERVICES,
      shopProducts: MOCK_SHOP_PRODUCTS,
      shifts:       MOCK_SHIFTS,
      storeHours:   MOCK_STORE_HOURS,
      breeds:       BREED_DATABASE,
      shopName: 'TerryMon 寵物美容', shopPhone: '04-2345-6789', shopAddress: '台中市西區精誠路 88 號', shopLineId: '@terrymon',
      contractTemplate: CONTRACT_TEMPLATE,

      login:  () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
      load: async () => {
        const [groomers, services, shopProducts, shifts, storeHours] = await Promise.all([
          adminApi.getGroomers(),
          adminApi.getServices(),
          adminApi.getProducts(),
          adminApi.getShifts(),
          adminApi.getStoreHours(),
        ])
        set({ groomers, services, shopProducts, shifts, storeHours })
      },

      updateShopInfo: (info) => set(info),
      updateContractTemplate: (text) => set({ contractTemplate: text }),

      addGroomer:    (g) => set(s => ({ groomers: [...s.groomers, g] })),
      updateGroomer: (g) => set(s => ({ groomers: s.groomers.map(x => x.id === g.id ? g : x) })),
      toggleGroomer: (id) => set(s => ({ groomers: s.groomers.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g) })),

      addService:    (sv) => set(s => ({ services: [...s.services, sv] })),
      updateService: (sv) => set(s => ({ services: s.services.map(x => x.id === sv.id ? sv : x) })),
      toggleService: (id) => set(s => ({ services: s.services.map(sv => sv.id === id ? { ...sv, isEnabled: !sv.isEnabled } : sv) })),

      addProduct:    (p) => set(s => ({ shopProducts: [...s.shopProducts, p] })),
      updateProduct: (p) => set(s => ({ shopProducts: s.shopProducts.map(x => x.id === p.id ? p : x) })),
      toggleProduct: (id) => set(s => ({ shopProducts: s.shopProducts.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p) })),

      setShift: (shift) => set(s => {
        const exists = s.shifts.find(sh => sh.groomerId === shift.groomerId && sh.date === shift.date)
        return {
          shifts: exists
            ? s.shifts.map(sh => sh.groomerId === shift.groomerId && sh.date === shift.date ? shift : sh)
            : [...s.shifts, shift],
        }
      }),
      updateHours: (hours) => set({ storeHours: hours }),

      addBreed:    (b) => set(s => ({ breeds: [...s.breeds, b] })),
      updateBreed: (b) => set(s => ({ breeds: s.breeds.map(x => x.id === b.id ? b : x) })),
    }),
    { name: 'terrymon-admin' }
  )
)
