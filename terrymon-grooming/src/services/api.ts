import { lookupMember } from '@/lib/mock'
import type { Member, CompleteServicePayload } from '@/types'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

export const posApi = {
  lookupMember: async (input: string): Promise<Member | null> => {
    await delay(600)
    return lookupMember(input)
  },
  completeService: async (payload: CompleteServicePayload): Promise<{ success: boolean; documentId: string }> => {
    await delay(800)
    console.log('[COMPLETE SERVICE — will call API after backend ready]', payload)
    return { success: true, documentId: `DOC_${Date.now()}` }
  },
  checkin: async (payload: { memberId: string; petId: string; weight: number; queueNum: string }): Promise<{ success: boolean }> => {
    await delay(600)
    console.log('[CHECKIN]', payload)
    return { success: true }
  },
}
