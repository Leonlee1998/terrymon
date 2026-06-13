'use client'
import { create } from 'zustand'
import type { Member, Pet } from '@/types'

interface KioskStore {
  member: Member | null
  selectedPet: Pet | null
  weight: string
  queueNum: string
  setMember: (m: Member) => void
  setSelectedPet: (p: Pet) => void
  setWeight: (w: string) => void
  assignQueue: () => void
  reset: () => void
}

let counter = 6

export const useKioskStore = create<KioskStore>()((set) => ({
  member: null, selectedPet: null, weight: '', queueNum: '',
  setMember: (m) => set({ member: m }),
  setSelectedPet: (p) => set({ selectedPet: p }),
  setWeight: (w) => set({ weight: w }),
  assignQueue: () => set({ queueNum: `A00${counter++}` }),
  reset: () => set({ member: null, selectedPet: null, weight: '', queueNum: '' }),
}))

