'use client'
import { create } from 'zustand'
import type { Member, Pet, KioskService } from '@/types'

export type PaymentMode = 'card' | 'balance' | 'mixed'
export type CheckinMode = 'walk_in' | 'has_appointment'

interface KioskStore {
  member:          Member | null
  selectedPet:     Pet | null
  checkinMode:     CheckinMode
  selectedMain:    KioskService | null
  selectedAddons:  KioskService[]
  selectedGroomer: string | null
  selectedTime:    string | null
  paymentMode:     PaymentMode
  balanceToUse:    number
  signatureData:   string | null
  contractUrl:     string | null
  weight:          string | null
  queueNum:        string | null

  setMember:       (m: Member) => void
  setSelectedPet:  (p: Pet) => void
  setCheckinMode:  (mode: CheckinMode) => void
  setMainService:  (s: KioskService) => void
  toggleAddon:     (s: KioskService) => void
  setGroomer:      (name: string) => void
  setTime:         (time: string) => void
  setPaymentMode:  (mode: PaymentMode) => void
  setBalanceToUse: (amount: number) => void
  setSignature:    (data: string) => void
  setContractUrl:  (url: string) => void
  setWeight:       (w: string) => void
  setQueueNum:     (q: string) => void
  reset:           () => void

  totalPrice:    () => number
  totalDuration: () => number
  serviceNames:  () => string[]
  cardAmount:    () => number
}

const INITIAL_STATE = {
  member: null, selectedPet: null, checkinMode: 'walk_in' as CheckinMode,
  selectedMain: null, selectedAddons: [],
  selectedGroomer: null, selectedTime: null,
  paymentMode: 'card' as PaymentMode, balanceToUse: 0,
  signatureData: null, contractUrl: null,
  weight: null, queueNum: null,
}

export function generateQueueNum(): string {
  const num = Math.floor(Math.random() * 900) + 100
  return `A${num}`
}

export const useKioskStore = create<KioskStore>()((set, get) => ({
  ...INITIAL_STATE,

  setMember:       (m) => set({ member: m }),
  setSelectedPet:  (p) => set({ selectedPet: p }),
  setCheckinMode:  (mode) => set({ checkinMode: mode }),
  setMainService:  (s) => set({ selectedMain: s }),
  toggleAddon: (s) => {
    const curr = get().selectedAddons
    const exists = curr.find(a => a.id === s.id)
    set({ selectedAddons: exists ? curr.filter(a => a.id !== s.id) : [...curr, s] })
  },
  setGroomer:      (name) => set({ selectedGroomer: name }),
  setTime:         (time) => set({ selectedTime: time }),
  setPaymentMode:  (mode) => set({ paymentMode: mode }),
  setBalanceToUse: (amount) => set({ balanceToUse: amount }),
  setSignature:    (data) => set({ signatureData: data }),
  setContractUrl:  (url)  => set({ contractUrl: url }),
  setWeight:       (w)    => set({ weight: w }),
  setQueueNum:     (q)    => set({ queueNum: q }),
  reset: () => set(INITIAL_STATE),

  totalPrice: () => {
    const { selectedMain, selectedAddons } = get()
    return (selectedMain?.price ?? 0) + selectedAddons.reduce((s, a) => s + a.price, 0)
  },
  totalDuration: () => {
    const { selectedMain, selectedAddons } = get()
    return (selectedMain?.duration ?? 0) + selectedAddons.reduce((s, a) => s + a.duration, 0)
  },
  serviceNames: () => {
    const { selectedMain, selectedAddons } = get()
    return [selectedMain?.name ?? '', ...selectedAddons.map(a => a.name)].filter(Boolean)
  },
  cardAmount: () => {
    const { balanceToUse } = get()
    return Math.max(0, get().totalPrice() - balanceToUse)
  },
}))
