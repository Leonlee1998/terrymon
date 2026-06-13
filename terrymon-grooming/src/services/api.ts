/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  lookupMember, MOCK_QUEUE, MOCK_GROOMERS, MOCK_SERVICES, MOCK_SHOP_PRODUCTS,
  MOCK_SHIFTS, MOCK_STORE_HOURS, MOCK_GROOMING_RECORDS,
} from '@/lib/mock'
import { configuredStoreId, getSupabase } from '@/lib/supabase'
import type {
  Member, CompleteServicePayload, QueueItem, Groomer, GroomingService,
  ShopProduct, GroomerShift, StoreHours, GroomingRecord,
} from '@/types'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

async function fallback<T>(fn: () => Promise<T>, mock: T | (() => T)): Promise<T> {
  const supabase = getSupabase()
  if (!supabase) {
    await delay()
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
  try {
    return await fn()
  } catch (error) {
    console.warn('[grooming:supabase:fallback]', error)
    await delay()
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
}

async function getStoreId(type = 'grooming') {
  if (configuredStoreId) return configuredStoreId
  const { data, error } = await getSupabase()!
    .from('stores')
    .select('id')
    .eq('type', type)
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
    chipId: row.chip_id ?? undefined,
    notes: row.notes ?? '',
    isActive: row.is_active ?? true,
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
    tier: row.tier ?? 'silver',
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

function mapGroomer(row: any): Groomer {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    rank: 'stylist',
    specialties: [],
    maxDailySlots: 8,
    isActive: row.is_active ?? true,
    joinedAt: row.created_at,
  }
}

function mapService(row: any): GroomingService {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    description: row.description ?? '',
    category: row.is_addon ? 'addon' : 'main',
    isEnabled: row.is_enabled ?? true,
    priceMatrix: [{
      weightRangeId: 'all',
      coatLength: 'medium',
      regularPrice: row.price,
      memberPrice: row.price,
      balancePrice: row.price,
      durationMin: row.duration,
    }],
    applicableSpecies: ['dog', 'cat'],
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  }
}

function mapKioskService(row: any) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    duration: row.duration,
    description: row.description ?? '',
    isAddon: row.is_addon ?? false,
    enabled: row.is_enabled ?? true,
  }
}

function mapShopProduct(row: any): ShopProduct {
  return {
    id: row.id,
    storeId: row.vendor_id ?? '',
    name: row.name,
    category: row.category,
    price: row.price,
    memberPrice: row.price,
    stock: row.stock,
    imageUrl: row.image_url ?? undefined,
    isActive: row.status === 'active',
  }
}

function mapRecord(row: any): GroomingRecord {
  return {
    id: row.id,
    appointmentId: row.appointment_id ?? undefined,
    memberId: row.member_id,
    memberName: row.members?.name ?? '',
    petId: row.pet_id,
    petName: row.pets?.name ?? '',
    petBreed: row.pets?.breed ?? '',
    petWeight: Number(row.pets?.weight ?? 0),
    groomerId: row.groomer_id ?? '',
    groomerName: row.groomers?.name ?? '',
    storeId: row.store_id,
    date: String(row.created_at).slice(0, 10),
    startTime: String(row.created_at).slice(11, 16),
    services: row.service_names ?? [],
    totalPrice: row.total_price ?? 0,
    paymentMethod: 'card',
    balanceUsed: 0,
    cardAmount: row.total_price ?? 0,
    status: 'completed',
    contractUrl: row.contract_url ?? undefined,
    receiptUrl: row.receipt_url ?? undefined,
    cctv: [],
    notes: row.notes ?? '',
    createdAt: row.created_at,
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

  getQueue: async (): Promise<QueueItem[]> => fallback(
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
      return data.map(mapQueue)
    },
    MOCK_QUEUE,
  ),

  completeService: async (payload: CompleteServicePayload): Promise<{ success: boolean; documentId: string }> => fallback(
    async () => {
      const storeId = await getStoreId()
      const { data, error } = await getSupabase()!
        .from('grooming_records')
        .insert({
          member_id: payload.memberId,
          pet_id: payload.petId,
          store_id: storeId,
          main_service_id: payload.mainServiceId,
          addon_service_ids: payload.addonServiceIds,
          service_names: [],
          total_price: payload.totalPrice,
          signature_data: payload.signatureData,
          contract_text: payload.contractHtml,
          signed_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      if (error) throw error
      return { success: true, documentId: data.id }
    },
    () => ({ success: true, documentId: `DOC_${Date.now()}` }),
  ),

  checkin: async (payload: { memberId: string; petId: string; weight: number; queueNum: string }): Promise<{ success: boolean }> => fallback(
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
        type: 'grooming',
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
}

export const adminApi = {
  getGroomers: async (): Promise<Groomer[]> => fallback(
    async () => {
      const storeId = await getStoreId()
      const { data, error } = await getSupabase()!.from('groomers').select('*').eq('store_id', storeId)
      if (error) throw error
      return data.map(mapGroomer)
    },
    MOCK_GROOMERS,
  ),
  getServices: async (): Promise<GroomingService[]> => fallback(
    async () => {
      const storeId = await getStoreId()
      const { data, error } = await getSupabase()!.from('grooming_services').select('*').eq('store_id', storeId)
      if (error) throw error
      return data.map(mapService)
    },
    MOCK_SERVICES,
  ),
  getKioskServices: async () => fallback(
    async () => {
      const storeId = await getStoreId()
      const { data, error } = await getSupabase()!
        .from('grooming_services')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_enabled', true)
        .order('sort_order')
      if (error) throw error
      return data.map(mapKioskService)
    },
    [],
  ),
  getProducts: async (): Promise<ShopProduct[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!.from('products').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapShopProduct)
    },
    MOCK_SHOP_PRODUCTS,
  ),
  getRecords: async (): Promise<GroomingRecord[]> => fallback(
    async () => {
      const storeId = await getStoreId()
      const { data, error } = await getSupabase()!
        .from('grooming_records')
        .select('*, members(name), pets(name,breed,weight), groomers(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapRecord)
    },
    MOCK_GROOMING_RECORDS,
  ),
  getShifts: async (): Promise<GroomerShift[]> => fallback(async () => MOCK_SHIFTS, MOCK_SHIFTS),
  getStoreHours: async (): Promise<StoreHours[]> => fallback(async () => MOCK_STORE_HOURS, MOCK_STORE_HOURS),
}
