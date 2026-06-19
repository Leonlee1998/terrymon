/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  lookupMember, MOCK_MEMBER, MOCK_PETS, MOCK_QUEUE, MOCK_GROOMERS, MOCK_SERVICES, MOCK_SHOP_PRODUCTS,
  MOCK_SHIFTS, MOCK_STORE_HOURS, MOCK_GROOMING_RECORDS, MOCK_BRANDS, MOCK_BRAND_PRODUCTS, MOCK_STORES, BREED_DATABASE,
} from '@/lib/mock'
import { configuredStoreId, getSupabase } from '@/lib/supabase'
import type {
  Member, Pet, CompleteServicePayload, QueueItem, Groomer, GroomingService,
  ShopProduct, GroomerShift, StoreHours, GroomingRecord,
  Brand, BrandProduct, Store, BreedOption, SpeciesType,
} from '@/types'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))
const TEST_MEMBER_INPUTS = new Set(['test', '0912345678', '0912-345-678', 'terrymon-m001', 'terrymon-m001-1718000000'])

function normalizeLookupInput(input: string) {
  return input.trim().toLowerCase()
}

function isTestLookup(input: string) {
  const normalized = normalizeLookupInput(input)
  const digitsOnly = normalized.replace(/\D/g, '')
  return TEST_MEMBER_INPUTS.has(normalized) || TEST_MEMBER_INPUTS.has(digitsOnly)
}

// Kiosk 操作（lookupMember, checkin, complete, topup）走 API Route（server-side service_role）
// Admin 讀取操作仍走 browser client（開發期用 mock）
async function fallback<T>(fn: () => Promise<T>, mock: T | (() => T)): Promise<T> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await delay()
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
  try {
    return await fn()
  } catch (error) {
    console.warn('[grooming:api:fallback]', error)
    await delay()
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
    primaryCaregiverId: row.primary_caregiver_id ?? undefined,
    name: row.name,
    species: row.species,
    breedId: row.breed_id ?? undefined,
    breed: row.breed ?? '',
    birthDate: row.birth_date ?? '',
    weight: Number(row.weight ?? 0),
    photoUrl: row.photo_url ?? '',
    allergies: row.allergies ?? [],
    chipId: row.chip_id ?? undefined,
    gender: row.gender ?? undefined,
    isNeutered: row.is_neutered ?? undefined,
    bloodType: row.blood_type ?? undefined,
    caregiver: row.caregiver ?? undefined,
    notes: row.notes ?? '',
    isActive: row.is_active ?? true,
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

function mockBreedOptions(species?: SpeciesType): BreedOption[] {
  return BREED_DATABASE
    .filter(breed => !species || breed.species === species)
    .map((breed, index) => ({
      id: breed.id,
      species: breed.species,
      nameZh: breed.name,
      nameEn: breed.nameEn,
      aliases: [],
      registrySources: ['mock'],
      group: '',
      size: 'unknown' as const,
      coatType: [breed.defaultCoatLength],
      groomingTags: breed.tags,
      vetRiskTags: [],
      legalStatusTw: 'allowed' as const,
      legalNote: null,
      sortOrder: index + 1,
    }))
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
    applicableSpecies: Array.isArray(row.applicable_species) ? row.applicable_species : ['dog', 'cat'],
  }
}

function mapPosInventory(row: any): ShopProduct {
  const bp = row.brand_products ?? {}
  return {
    id:          row.id,
    storeId:     row.store_id,
    name:        bp.name     ?? '',
    category:    bp.category ?? '',
    price:       Number(row.retail_price  ?? 0),
    memberPrice: Number(row.member_price  ?? row.retail_price ?? 0),
    stock:       row.stock   ?? 0,
    imageUrl:    bp.image_url ?? undefined,
    barcode:     bp.barcode  ?? undefined,
    isActive:    row.is_active,
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
  lookupMember: async (input: string): Promise<{
    member: Member | null
    preSelectedPet?: Pet | null
    todayAppointment?: { id: string; time: string; petName: string; petId: string; notes: string } | null
  }> => {
    if (isTestLookup(input)) {
      await delay(250)
      return { member: { ...MOCK_MEMBER, pets: MOCK_PETS }, preSelectedPet: null, todayAppointment: null }
    }

    return fallback(
      async () => {
        const res = await apiPost<{
          member: Member | null
          preSelectedPet?: Pet | null
          todayAppointment?: { id: string; time: string; petName: string; petId: string; notes: string } | null
        }>('/api/kiosk/lookup', { q: input })
        return { member: res.member, preSelectedPet: res.preSelectedPet, todayAppointment: res.todayAppointment ?? null }
      },
      () => ({ member: lookupMember(input), preSelectedPet: null, todayAppointment: null }),
    )
  },

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

  completeService: async (payload: CompleteServicePayload & { balanceUsed?: number; appointmentId?: string; groomerId?: string }): Promise<{ success: boolean; documentId: string }> => fallback(
    async () => {
      const result = await apiPost<{ success: boolean; documentId: string }>('/api/pos/complete', {
        memberId:        payload.memberId,
        petId:           payload.petId,
        mainServiceId:   payload.mainServiceId,
        addonServiceIds: payload.addonServiceIds,
        totalPrice:      payload.totalPrice,
        balanceUsed:     payload.balanceUsed ?? 0,
        signatureUrl:    payload.signatureUrl,
        contractUrl:     payload.contractUrl,
        appointmentId:   payload.appointmentId,
        groomerId:       payload.groomerId,
      })
      return result
    },
    () => ({ success: true, documentId: `DOC_${Date.now()}` }),
  ),

  topup: async (memberId: string, amount: number, cardLast4?: string): Promise<{ success: boolean; transactionId: string }> => fallback(
    async () => {
      return apiPost<{ success: boolean; transactionId: string }>('/api/pos/topup', {
        memberId, amount, cardLast4,
      })
    },
    () => ({ success: true, transactionId: `TX_${Date.now()}` }),
  ),

  checkin: async (payload: { memberId: string; petId: string; weight: number; queueNum: string }): Promise<{ success: boolean }> => fallback(
    async () => {
      return apiPost<{ success: boolean }>('/api/kiosk/checkin', {
        memberId: payload.memberId,
        petId:    payload.petId,
        weight:   payload.weight,
      })
    },
    { success: true },
  ),

  getAppointmentToday: async (memberId: string): Promise<{ id: string; time: string; petName: string; petId: string; notes: string } | null> => fallback(
    async () => {
      const storeId = await getStoreId()
      const today = new Date().toISOString().split('T')[0]
      const { data } = await getSupabase()!
        .from('appointments')
        .select('id, scheduled_time, pet_id, notes, pets(name)')
        .eq('member_id', memberId)
        .eq('store_id', storeId)
        .eq('type', 'grooming')
        .eq('scheduled_date', today)
        .in('status', ['confirmed', 'pending'])
        .order('scheduled_time', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (!data) return null
      const petRow = (data as any).pets
      const pet = petRow && typeof petRow === 'object' && !Array.isArray(petRow) ? petRow : {}
      return {
        id:      String(data.id),
        time:    String((data as any).scheduled_time ?? '').slice(0, 5),
        petName: String(pet.name ?? ''),
        petId:   String((data as any).pet_id ?? ''),
        notes:   String((data as any).notes ?? ''),
      }
    },
    null,
  ),

  deductStock: async (inventoryId: string, qty: number): Promise<{ remainingStock: number }> => fallback(
    async () => apiPost<{ remainingStock: number }>('/api/pos/deduct-stock', { inventoryId, qty }),
    () => ({ remainingStock: 0 }),
  ),

  getAppointmentById: async (id: string): Promise<{ id: string; time: string; petName: string; petId: string; notes: string } | null> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('appointments')
        .select('id, scheduled_time, pet_id, notes, pets(name)')
        .eq('id', id)
        .single()
      if (error || !data) return null
      const petRow = (data as any).pets
      const pet = petRow && typeof petRow === 'object' && !Array.isArray(petRow) ? petRow : {}
      return {
        id:      String(data.id),
        time:    String((data as any).scheduled_time ?? '').slice(0, 5),
        petName: String(pet.name ?? ''),
        petId:   String((data as any).pet_id ?? ''),
        notes:   String((data as any).notes ?? ''),
      }
    },
    null,
  ),
}

export const adminApi = {
  getBreeds: async (species?: SpeciesType): Promise<BreedOption[]> => fallback(
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
      const storeId = await getStoreId()
      const { data, error } = await getSupabase()!
        .from('pos_inventory')
        .select('*, brand_products(name, category, barcode, image_url)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapPosInventory)
    },
    MOCK_SHOP_PRODUCTS,
  ),

  updateInventoryItem: async (
    id: string,
    fields: { retailPrice?: number; memberPrice?: number; stock?: number; isActive?: boolean },
  ): Promise<void> => fallback(
    async () => {
      const patch: Record<string, unknown> = {}
      if (fields.retailPrice  !== undefined) patch.retail_price = fields.retailPrice
      if (fields.memberPrice  !== undefined) patch.member_price = fields.memberPrice
      if (fields.stock        !== undefined) patch.stock        = fields.stock
      if (fields.isActive     !== undefined) patch.is_active    = fields.isActive
      const { error } = await getSupabase()!.from('pos_inventory').update(patch).eq('id', id)
      if (error) throw error
    },
    undefined,
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
  saveService: async (service: GroomingService, isNew: boolean): Promise<void> => fallback(
    async () => {
      const storeId = await getStoreId()
      const row = {
        store_id:           storeId,
        name:               service.name,
        description:        service.description,
        is_addon:           service.category !== 'main',
        is_enabled:         service.isEnabled,
        applicable_species: service.applicableSpecies,
        sort_order:         service.sortOrder,
        price_matrix:       service.priceMatrix,
      }
      if (isNew) {
        const { error } = await getSupabase()!.from('grooming_services').insert(row)
        if (error) throw error
      } else {
        const { error } = await getSupabase()!
          .from('grooming_services')
          .update(row)
          .eq('id', service.id)
        if (error) throw error
      }
    },
    undefined,
  ),
}

export const brandApi = {
  getBrands: (): Promise<Brand[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!.from('brands').select('*').order('name')
      if (error) throw error
      return data.map((r: any): Brand => ({
        id: r.id, name: r.name, status: r.status,
        contactName: r.contact_name, contactPhone: r.contact_phone, contactEmail: r.contact_email,
        createdAt: r.created_at,
      }))
    },
    MOCK_BRANDS,
  ),

  getBrandProducts: (brandId: string): Promise<BrandProduct[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('brand_products')
        .select('*, brands(name)')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('category')
      if (error) throw error
      return data.map((r: any): BrandProduct => ({
        id: r.id, brandId: r.brand_id, brandName: r.brands?.name,
        name: r.name, category: r.category ?? '',
        description: r.description, costPrice: Number(r.cost_price ?? 0),
        suggestedPrice: Number(r.suggested_price ?? 0),
        barcode: r.barcode, imageUrl: r.image_url, isActive: r.is_active,
        createdAt: r.created_at,
      }))
    },
    MOCK_BRAND_PRODUCTS.filter(p => p.brandId === brandId),
  ),

  getStores: (): Promise<Store[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!.from('stores').select('*').eq('is_active', true).order('name')
      if (error) throw error
      return data.map((r: any): Store => ({
        id: r.id, name: r.name, type: r.type ?? 'grooming',
        address: r.address, isActive: r.is_active,
      }))
    },
    MOCK_STORES,
  ),

  upsertBrand: async (brand: {
    id?: string; name: string; contactName?: string; contactPhone?: string; contactEmail?: string; status?: string
  }): Promise<{ id?: string }> => fallback(
    async () => apiPost<{ id?: string }>('/api/brand/manage', brand),
    () => ({ id: `BR${Date.now()}` }),
  ),

  setBrandStatus: async (id: string, status: 'pending' | 'active' | 'suspended'): Promise<void> => fallback(
    async () => { await fetch('/api/brand/manage', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }) },
    undefined,
  ),

  pushInventory: async (
    brandId: string,
    storeId: string,
    items: { brandProductId: string; retailPrice: number; memberPrice?: number; stock: number }[],
  ): Promise<{ success: boolean; count: number }> => fallback(
    async () => apiPost<{ success: boolean; count: number }>('/api/brand/push-inventory', { brandId, storeId, items }),
    () => ({ success: true, count: items.length }),
  ),
}
