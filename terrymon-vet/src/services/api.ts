/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BreedOption, Member, QueueItem, ConsultationResult } from '@/types'
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
  medicalRecordId?: string
  totalPrice: number
  balanceUsed?: number
}

// Kiosk 操作（lookupMember, checkin, complete, checkout）走 API Route（server-side service_role）
// 候診隊列讀取仍走 browser client（開發期用 mock）
async function fallback<T>(fn: () => Promise<T>, mock: T | (() => T)): Promise<T> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await delay(400)
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
  try {
    return await fn()
  } catch (error) {
    console.warn('[vet:api:fallback]', error)
    await delay(400)
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
}

async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'API error')
  }
  return res.json()
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

function mapBreed(row: any): BreedOption {
  return {
    id: row.id,
    species: row.species,
    nameZh: row.canonical_name_zh,
    nameEn: row.canonical_name_en,
    aliases: row.aliases ?? [],
    registrySources: row.registry_sources ?? [],
    group: row.breed_group ?? '',
    size: row.size ?? 'unknown',
    coatType: row.coat_type ?? [],
    groomingTags: row.grooming_tags ?? [],
    vetRiskTags: row.vet_risk_tags ?? [],
    legalStatusTw: row.legal_status_tw ?? 'unknown',
    legalNote: row.legal_note ?? null,
    sortOrder: row.sort_order ?? 999,
  }
}

function mockBreedOptions(species?: 'dog' | 'cat'): BreedOption[] {
  const breeds: BreedOption[] = [
    { id: 'dog-mixed', species: 'dog', nameZh: '米克斯犬', nameEn: 'Mixed Breed Dog', aliases: ['混種犬'], registrySources: ['mock'], group: 'Mixed', size: 'unknown', coatType: ['varies'], groomingTags: [], vetRiskTags: [], legalStatusTw: 'allowed', legalNote: null, sortOrder: 1 },
    { id: 'dog-shiba-inu', species: 'dog', nameZh: '柴犬', nameEn: 'Shiba Inu', aliases: ['日本柴犬'], registrySources: ['mock'], group: 'Spitz', size: 'small', coatType: ['double'], groomingTags: ['雙層毛'], vetRiskTags: [], legalStatusTw: 'allowed', legalNote: null, sortOrder: 20 },
    { id: 'dog-poodle-toy', species: 'dog', nameZh: '玩具貴賓犬', nameEn: 'Poodle (Toy)', aliases: ['貴賓'], registrySources: ['mock'], group: 'Toy', size: 'toy', coatType: ['curly'], groomingTags: ['易打結'], vetRiskTags: [], legalStatusTw: 'allowed', legalNote: null, sortOrder: 21 },
    { id: 'cat-mixed', species: 'cat', nameZh: '米克斯貓', nameEn: 'Domestic Mixed Cat', aliases: ['家貓'], registrySources: ['mock'], group: 'Mixed', size: 'unknown', coatType: ['varies'], groomingTags: [], vetRiskTags: [], legalStatusTw: 'allowed', legalNote: null, sortOrder: 1 },
    { id: 'cat-british-shorthair', species: 'cat', nameZh: '英國短毛貓', nameEn: 'British Shorthair', aliases: ['英短'], registrySources: ['mock'], group: 'Shorthair', size: 'medium', coatType: ['short'], groomingTags: [], vetRiskTags: ['肥厚性心肌病'], legalStatusTw: 'allowed', legalNote: null, sortOrder: 20 },
    { id: 'cat-persian', species: 'cat', nameZh: '波斯貓', nameEn: 'Persian', aliases: [], registrySources: ['mock'], group: 'Longhair', size: 'medium', coatType: ['long'], groomingTags: ['長毛'], vetRiskTags: ['短吻呼吸道'], legalStatusTw: 'allowed', legalNote: null, sortOrder: 23 },
  ]
  return breeds.filter(breed => !species || breed.species === species)
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
    queueNum:      String(row.id).slice(0, 8).toUpperCase(),
    appointmentId: String(row.id),
    petId:         row.pet_id,
    memberId:      row.member_id,
    memberName:    member.name ?? '',
    status:        row.status === 'checked_in' ? 'in-progress' : row.status === 'completed' ? 'done' : 'waiting',
    weight:        Number(pet.weight ?? 0),
    checkinTime:   row.scheduled_time ?? row.created_at,
    petName:       pet.name ?? '',
    petBreed:      pet.breed ?? '',
    allergies:     pet.allergies ?? [],
  }
}

export const posApi = {
  getBreeds: async (species?: 'dog' | 'cat'): Promise<BreedOption[]> => fallback(
    async () => {
      let query = getSupabase()!
        .from('breed_master')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('canonical_name_zh', { ascending: true })

      if (species) query = query.eq('species', species)

      const { data, error } = await query
      if (error) throw error
      return data.map(mapBreed)
    },
    () => mockBreedOptions(species),
  ),
  lookupMember: async (input: string): Promise<Member | null> => fallback(
    async () => {
      const { member } = await apiPost<{ member: Member | null }>('/api/kiosk/lookup', { q: input })
      return member
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

  checkin: async (payload: CheckinPayload): Promise<{ success: boolean; appointmentId?: string }> => fallback(
    async () => {
      return apiPost<{ success: boolean; appointmentId?: string }>('/api/kiosk/checkin', {
        memberId: payload.memberId,
        petId:    payload.petId,
        weight:   payload.weight,
      })
    },
    { success: true },
  ),

  completeConsultation: async (queueNum: string, payload: QueueItem, result: ConsultationResult & { chiefComplaint?: string; clinicalFindings?: string }) => fallback(
    async () => {
      const res = await apiPost<{ success: boolean; medicalRecordId: string }>('/api/pos/complete', {
        memberId:      payload.memberId,
        petId:         payload.petId,
        petName:       payload.petName,
        memberName:    payload.memberName,
        appointmentId: payload.appointmentId,
        result: {
          diagnosis:        result.diagnosis,
          prescriptions:    result.prescriptions,
          notes:            result.notes,
          fee:              result.fee,
          followUpDate:     result.followUpDate,
          chiefComplaint:   result.chiefComplaint ?? '',
          clinicalFindings: result.clinicalFindings ?? '',
        },
      })
      return { success: res.success, queueNum, medicalRecordId: res.medicalRecordId }
    },
    { success: true, queueNum, medicalRecordId: '' },
  ),

  checkout: async (payload: CheckoutPayload): Promise<{ success: boolean; receiptId: string }> => fallback(
    async () => {
      const res = await apiPost<{ success: boolean; receiptId: string }>('/api/pos/checkout', {
        memberId:        payload.memberId,
        petId:           payload.petId,
        medicalRecordId: payload.medicalRecordId,
        totalPrice:      payload.totalPrice,
        balanceUsed:     payload.balanceUsed ?? 0,
      })
      return res
    },
    () => ({ success: true, receiptId: `RCP_${Date.now()}` }),
  ),
}
