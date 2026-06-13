/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Member, QueueItem, ConsultationResult } from '@/types'
import { lookupMember, MOCK_QUEUE, MOCK_DONE_TODAY } from '@/lib/mock'
import { configuredStoreId, getSupabase } from '@/lib/supabase'

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

async function fallback<T>(fn: () => Promise<T>, mock: T | (() => T)): Promise<T> {
  const supabase = getSupabase()
  if (!supabase) {
    await delay(400)
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
  try {
    return await fn()
  } catch (error) {
    console.warn('[vet:supabase:fallback]', error)
    await delay(400)
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
}

async function getStoreId() {
  if (configuredStoreId) return configuredStoreId
  const { data, error } = await getSupabase()!
    .from('stores')
    .select('id')
    .eq('type', 'vet')
    .eq('is_active', true)
    .limit(1)
    .single()
  if (error) throw error
  return data.id as string
}

function mapPet(row: any) {
  return {
    id: row.id,
    memberId: row.member_id,
    name: row.name,
    species: row.species,
    breed: row.breed ?? '',
    birthDate: row.birth_date ?? '',
    weight: Number(row.weight ?? 0),
    photoUrl: row.photo_url ?? '',
    allergies: row.allergies ?? [],
    notes: row.notes ?? '',
  }
}

function mapMember(row: any): Member {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    qrCode: `TERRYMON-${row.id}`,
    memberSince: row.created_at,
    balance: row.platform_balance ?? 0,
    points: row.points ?? 0,
    pets: (row.pets ?? []).map(mapPet),
  }
}

function mapQueue(row: any): QueueItem {
  const pet = row.pets ?? {}
  const member = row.members ?? {}
  return {
    queueNum: String(row.id).slice(0, 8).toUpperCase(),
    petId: row.pet_id,
    memberId: row.member_id,
    memberName: member.name ?? '',
    status: row.status === 'checked_in' ? 'in-progress' : row.status === 'completed' ? 'done' : 'waiting',
    weight: Number(pet.weight ?? 0),
    checkinTime: row.scheduled_time ?? row.created_at,
    petName: pet.name ?? '',
    petBreed: pet.breed ?? '',
    allergies: pet.allergies ?? [],
  }
}

export const posApi = {
  lookupMember: async (input: string): Promise<Member | null> => fallback(
    async () => {
      const q = input.trim()
      const { data, error } = await getSupabase()!
        .from('members')
        .select('*, pets(*)')
        .or(`phone.eq.${q},email.eq.${q},id.eq.${q}`)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data ? mapMember(data) : null
    },
    () => lookupMember(input),
  ),

  getQueue: async (): Promise<{ waiting: QueueItem[]; inProgress: QueueItem | null; done: QueueItem[] }> => fallback(
    async () => {
      const storeId = await getStoreId()
      const { data, error } = await getSupabase()!
        .from('appointments')
        .select('*, members(name), pets(name,breed,weight,allergies)')
        .eq('store_id', storeId)
        .in('status', ['pending', 'confirmed', 'checked_in', 'completed'])
        .order('scheduled_date')
        .order('scheduled_time')
      if (error) throw error
      const queue = data.map(mapQueue)
      return {
        waiting: queue.filter(q => q.status === 'waiting'),
        inProgress: queue.find(q => q.status === 'in-progress') ?? null,
        done: queue.filter(q => q.status === 'done'),
      }
    },
    () => ({
      waiting: MOCK_QUEUE.filter(q => q.status === 'waiting'),
      inProgress: MOCK_QUEUE.find(q => q.status === 'in-progress') ?? null,
      done: MOCK_DONE_TODAY,
    }),
  ),

  checkin: async (payload: CheckinPayload): Promise<{ success: boolean }> => fallback(
    async () => {
      const storeId = await getStoreId()
      const today = new Date().toISOString().slice(0, 10)
      const now = new Date().toTimeString().slice(0, 8)
      const supabase = getSupabase()!

      await supabase.from('pets').update({ weight: payload.weight }).eq('id', payload.petId)
      const { error } = await supabase.from('appointments').insert({
        member_id: payload.memberId,
        pet_id: payload.petId,
        store_id: storeId,
        type: 'vet',
        scheduled_date: today,
        scheduled_time: now,
        status: 'checked_in',
        source: 'kiosk',
      })
      if (error) throw error
      return { success: true }
    },
    { success: true },
  ),

  completeConsultation: async (queueNum: string, payload: QueueItem, result: ConsultationResult) => fallback(
    async () => {
      const storeId = await getStoreId()
      const { error } = await getSupabase()!.from('medical_records').insert({
        member_id: payload.memberId,
        pet_id: payload.petId,
        store_id: storeId,
        clinic_name: 'TerryMon Vet',
        doctor_name: 'Doctor',
        visit_date: new Date().toISOString().slice(0, 10),
        chief_complaint: '',
        diagnosis: result.diagnosis,
        treatment: result.notes,
        prescriptions: result.prescriptions,
        follow_up_date: result.followUpDate,
        fee: result.fee,
      })
      if (error) throw error
      return { success: true, queueNum }
    },
    { success: true, queueNum },
  ),

  checkout: async (payload: CheckoutPayload): Promise<{ success: boolean; receiptId: string }> => fallback(
    async () => {
      const storeId = await getStoreId()
      const { data, error } = await getSupabase()!.from('transactions').insert({
        member_id: payload.memberId,
        store_id: storeId,
        type: 'service_payment',
        total_amount: payload.totalPrice,
        card_amount: payload.totalPrice,
        balance_after: 0,
        points_after: 0,
        payment_method: 'card',
      }).select('id').single()
      if (error) throw error
      return { success: true, receiptId: data.id }
    },
    () => ({ success: true, receiptId: `RCP_${Date.now()}` }),
  ),
}
