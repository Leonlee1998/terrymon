import type { Member } from '@/types'
import { lookupMember } from '@/lib/mock'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export interface CheckinPayload {
  memberId: string
  petId: string
  weight: number
}

export interface CheckoutPayload {
  queueNum: string
  memberId: string
  petId: string
  totalPrice: number
}

export const posApi = {
  lookupMember: async (input: string): Promise<Member | null> => {
    await delay(600)
    return lookupMember(input)
  },

  checkin: async (payload: CheckinPayload): Promise<{ success: boolean }> => {
    await delay(800)
    console.log('[CHECKIN]', payload)
    return { success: true }
  },

  checkout: async (payload: CheckoutPayload): Promise<{ success: boolean; receiptId: string }> => {
    await delay(800)
    console.log('[CHECKOUT]', payload)
    return { success: true, receiptId: `RCP_${Date.now()}` }
  },
}
