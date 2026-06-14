'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Member, Pet } from '@/types'

interface AuthStore {
  member: Member | null
  isLoggedIn: boolean
  setMember: (m: Member) => void
  updateMember: (fields: Partial<Omit<Member, 'id' | 'pets'>>) => void
  addPet: (pet: Pet) => void
  updatePet: (pet: Pet) => void
  removePet: (petId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      member: null,
      isLoggedIn: false,
      setMember: (member) => set({ member, isLoggedIn: true }),
      updateMember: (fields) => set(state => ({
        member: state.member ? { ...state.member, ...fields } : null,
      })),
      addPet: (pet) => set(state => ({
        member: state.member
          ? { ...state.member, pets: [...state.member.pets, pet] }
          : null,
      })),
      updatePet: (pet) => set(state => ({
        member: state.member
          ? { ...state.member, pets: state.member.pets.map(p => p.id === pet.id ? pet : p) }
          : null,
      })),
      removePet: (petId) => set(state => ({
        member: state.member
          ? { ...state.member, pets: state.member.pets.filter(p => p.id !== petId) }
          : null,
      })),
      logout: () => set({ member: null, isLoggedIn: false }),
    }),
    { name: 'terrymon-auth' }
  )
)
