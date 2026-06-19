'use client'
import { create } from 'zustand'
import type { GroomingStore, GroomingServiceItem, AvailableSlot } from '@/types'

export type BookingStep = 'pet' | 'store' | 'service' | 'slot' | 'details' | 'confirm'
export const BOOKING_STEPS: BookingStep[] = ['pet', 'store', 'service', 'slot', 'details', 'confirm']

interface BookingState {
  step: BookingStep

  // Step 1 - Pet
  petId: string | null
  petName: string

  // Step 2 - Store
  store: GroomingStore | null

  // Step 3 - Service
  mainService: GroomingServiceItem | null
  addonServices: GroomingServiceItem[]

  // Step 4 - Slot
  date: string        // YYYY-MM-DD
  slot: AvailableSlot | null

  // Step 5 - Details
  notes: string
  photoUrl: string | null
  preferSpecificGroomer: boolean

  // Actions
  setStep:       (step: BookingStep) => void
  nextStep:      () => void
  prevStep:      () => void
  setPet:        (id: string, name: string) => void
  setStore:      (store: GroomingStore) => void
  setMainService:(svc: GroomingServiceItem) => void
  toggleAddon:   (svc: GroomingServiceItem) => void
  setDate:       (date: string) => void
  setSlot:       (slot: AvailableSlot) => void
  setNotes:      (notes: string) => void
  setPhotoUrl:   (url: string | null) => void
  setPreferGroomer: (v: boolean) => void
  reset:         () => void

  // Derived
  totalPrice:    () => number
  estimatedDuration: () => number
  isStepComplete:(step: BookingStep) => boolean
}

const initialState = {
  step: 'pet' as BookingStep,
  petId: null,
  petName: '',
  store: null,
  mainService: null,
  addonServices: [],
  date: '',
  slot: null,
  notes: '',
  photoUrl: null,
  preferSpecificGroomer: false,
}

export const useBookingStore = create<BookingState>()((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  nextStep: () => {
    const cur = BOOKING_STEPS.indexOf(get().step)
    if (cur < BOOKING_STEPS.length - 1) set({ step: BOOKING_STEPS[cur + 1] })
  },

  prevStep: () => {
    const cur = BOOKING_STEPS.indexOf(get().step)
    if (cur > 0) set({ step: BOOKING_STEPS[cur - 1] })
  },

  setPet: (id, name) => set({ petId: id, petName: name }),

  setStore: (store) => set({ store, mainService: null, addonServices: [], date: '', slot: null }),

  setMainService: (svc) => set({ mainService: svc, addonServices: [], date: '', slot: null }),

  toggleAddon: (svc) =>
    set(s => ({
      addonServices: s.addonServices.some(a => a.id === svc.id)
        ? s.addonServices.filter(a => a.id !== svc.id)
        : [...s.addonServices, svc],
    })),

  setDate: (date) => set({ date, slot: null }),

  setSlot: (slot) => set({ slot }),

  setNotes: (notes) => set({ notes }),

  setPhotoUrl: (url) => set({ photoUrl: url }),

  setPreferGroomer: (v) => set({ preferSpecificGroomer: v }),

  reset: () => set(initialState),

  totalPrice: () => {
    const { mainService, addonServices } = get()
    const base = mainService?.price ?? 0
    return base + addonServices.reduce((sum, a) => sum + a.price, 0)
  },

  estimatedDuration: () => {
    const { mainService, addonServices } = get()
    const base = mainService?.duration ?? 0
    return base + addonServices.reduce((sum, a) => sum + a.duration, 0)
  },

  isStepComplete: (step) => {
    const s = get()
    switch (step) {
      case 'pet':     return !!s.petId
      case 'store':   return !!s.store
      case 'service': return !!s.mainService
      case 'slot':    return !!s.date && !!s.slot
      case 'details': return true
      case 'confirm': return false
      default:        return false
    }
  },
}))
