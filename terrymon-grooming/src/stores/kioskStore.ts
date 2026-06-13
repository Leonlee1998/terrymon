'use client'
import { create } from 'zustand'
import type { Member, Pet, GroomingService } from '@/types'

interface KioskStore {
  member: Member | null
  selectedPet: Pet | null
  selectedMain: GroomingService | null
  selectedAddons: GroomingService[]
  signatureData: string | null
  setMember: (m: Member) => void
  setSelectedPet: (p: Pet) => void
  setMainService: (s: GroomingService) => void
  toggleAddon: (s: GroomingService) => void
  setSignature: (data: string) => void
  reset: () => void
  totalPrice: () => number
  totalDuration: () => number
}

export const useKioskStore = create<KioskStore>()((set, get) => ({
  member: null, selectedPet: null,
  selectedMain: null, selectedAddons: [], signatureData: null,
  setMember: (m) => set({ member: m }),
  setSelectedPet: (p) => set({ selectedPet: p }),
  setMainService: (s) => set({ selectedMain: s }),
  toggleAddon: (s) => {
    const curr = get().selectedAddons
    const exists = curr.find(a => a.id === s.id)
    set({ selectedAddons: exists ? curr.filter(a => a.id !== s.id) : [...curr, s] })
  },
  setSignature: (data) => set({ signatureData: data }),
  reset: () => set({
    member: null, selectedPet: null,
    selectedMain: null, selectedAddons: [], signatureData: null,
  }),
  totalPrice: () => {
    const { selectedMain, selectedAddons } = get()
    return (selectedMain?.price ?? 0) + selectedAddons.reduce((s, a) => s + a.price, 0)
  },
  totalDuration: () => {
    const { selectedMain, selectedAddons } = get()
    return (selectedMain?.duration ?? 0) + selectedAddons.reduce((s, a) => s + a.duration, 0)
  },
}))
