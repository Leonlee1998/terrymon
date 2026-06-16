import {
  MOCK_MEMBER, MOCK_PETS, MOCK_MEDICAL, MOCK_APPOINTMENTS,
  MOCK_HEALTH_DATA, MOCK_DEVICES, MOCK_PRODUCTS, MOCK_ORDERS,
  MOCK_DOCUMENTS, MOCK_NOTIFICATIONS, MOCK_GROOMING_RECORDS,
} from '@/lib/mock'
import { MOCK_VENDORS } from '@/lib/mock/shop'
import { getMockBreeds } from '@/lib/breeds'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { ProductPetSpecies } from '@/lib/shopFilters'
import type {
  Member, Pet, MedicalRecord, Appointment, AppointmentStatus,
  PetHealthData, AIoTDevice, Product, Vendor, Order, OrderItem,
  DocItem, Notification, GroomingRecord, CartItem, PrescriptionItem, BreedOption,
  MemberEvent, EmergencyContact, CaregiverPermissions, PetCaregiver, PetTransfer, TransferType,
  Organization, OrgType, OrgStatus, AdoptionCheckpoint, CheckpointDetail,
  AdoptionTrackingPlan, PetDailyLog, VaccineReminder,
} from '@/types'
import { DEFAULT_CAREGIVER_PERMISSIONS } from '@/types'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

const _mockEmergencyContacts: Record<string, EmergencyContact[]> = {}
const _mockCaregivers: Record<string, PetCaregiver[]> = {}
const ALL_CATEGORY = '全部'
type DbRow = Record<string, unknown>
export type PetPayload = {
  name: string
  species: Pet['species']
  breedId?: string
  breed?: string
  birthDate?: string
  weight?: number
  photoUrl?: string
  allergies?: string[]
  chipId?: string
  gender?: 'male' | 'female'
  isNeutered?: boolean
  bloodType?: string
  caregiver?: string
  notes?: string
}

const stringValue = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const optionalString = (value: unknown) => typeof value === 'string' ? value : undefined
const nullableString = (value: unknown) => typeof value === 'string' ? value : null
const numberValue = (value: unknown, fallback = 0) => typeof value === 'number' ? value : Number(value ?? fallback)
const booleanValue = (value: unknown, fallback = false) => typeof value === 'boolean' ? value : fallback
const recordValue = (value: unknown): DbRow =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as DbRow : {}
const recordArray = (value: unknown): DbRow[] =>
  Array.isArray(value) ? value.filter(item => item && typeof item === 'object') as DbRow[] : []
const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
const stringRecord = (value: unknown): Record<string, string> => {
  const record = recordValue(value)
  return Object.fromEntries(
    Object.entries(record).map(([key, val]) => [key, typeof val === 'string' ? val : String(val ?? '')]),
  )
}

function mockProducts(params?: { category?: string; search?: string }) {
  let result = MOCK_PRODUCTS
  if (params?.category && params.category !== ALL_CATEGORY && params.category !== '?券') {
    result = result.filter(p => p.category === params.category)
  }
  if (params?.search) {
    const q = params.search.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    )
  }
  return result
}

async function fallback<T>(fn: () => Promise<T>, mock: T | (() => T)): Promise<T> {
  const supabase = getSupabase()
  if (!supabase) {
    await delay()
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }

  try {
    return await fn()
  } catch (error) {
    console.warn('[supabase:fallback]', error)
    await delay()
    return typeof mock === 'function' ? (mock as () => T)() : mock
  }
}

function fileSizeLabel(size?: number | null) {
  if (!size) return undefined
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function mapPet(row: DbRow): Pet {
  return {
    id: stringValue(row.id),
    memberId: stringValue(row.member_id),
    primaryCaregiverId: optionalString(row.primary_caregiver_id),
    name: stringValue(row.name),
    species: stringValue(row.species, 'other') as Pet['species'],
    breedId: optionalString(row.breed_id),
    breed: stringValue(row.breed),
    birthDate: stringValue(row.birth_date),
    weight: numberValue(row.weight),
    photoUrl: stringValue(row.photo_url),
    allergies: stringArray(row.allergies),
    chipId: optionalString(row.chip_id),
    gender: optionalString(row.gender) as Pet['gender'],
    isNeutered: typeof row.is_neutered === 'boolean' ? row.is_neutered : undefined,
    bloodType: optionalString(row.blood_type),
    caregiver: optionalString(row.caregiver),
    notes: stringValue(row.notes),
    isActive: booleanValue(row.is_active, true),
  }
}

function mapPetPayload(data: Partial<PetPayload>) {
  return {
    name: data.name,
    species: data.species,
    breed_id: data.breedId || null,
    breed: data.breed ?? '',
    birth_date: data.birthDate || null,
    weight: data.weight ?? null,
    photo_url: data.photoUrl ?? '',
    allergies: data.allergies ?? [],
    chip_id: data.chipId || null,
    gender: data.gender ?? null,
    is_neutered: data.isNeutered ?? null,
    blood_type: data.bloodType || null,
    caregiver: data.caregiver || null,
    notes: data.notes ?? '',
  }
}

function mapBreed(row: DbRow): BreedOption {
  return {
    id: stringValue(row.id),
    species: stringValue(row.species, 'dog') as BreedOption['species'],
    nameZh: stringValue(row.canonical_name_zh),
    nameEn: stringValue(row.canonical_name_en),
    aliases: stringArray(row.aliases),
    registrySources: stringArray(row.registry_sources),
    group: stringValue(row.breed_group),
    size: stringValue(row.size, 'unknown') as BreedOption['size'],
    coatType: stringArray(row.coat_type),
    groomingTags: stringArray(row.grooming_tags),
    vetRiskTags: stringArray(row.vet_risk_tags),
    legalStatusTw: stringValue(row.legal_status_tw, 'unknown') as BreedOption['legalStatusTw'],
    legalNote: nullableString(row.legal_note),
    sortOrder: numberValue(row.sort_order, 999),
  }
}

function mapMember(row: DbRow, pets: Pet[] = []): Member {
  return {
    id: stringValue(row.id),
    name: stringValue(row.name),
    phone: stringValue(row.phone),
    email: stringValue(row.email),
    avatarUrl: optionalString(row.avatar_url),
    handle: optionalString(row.handle),
    qrCode: `TERRYMON-${stringValue(row.id)}`,
    memberSince: stringValue(row.created_at),
    balance: numberValue(row.platform_balance),
    points: numberValue(row.points),
    tier: stringValue(row.tier, 'basic') as Member['tier'],
    pets,
  }
}

function mapAppointment(row: DbRow): Appointment {
  const store = recordValue(row.stores)
  return {
    id: stringValue(row.id),
    memberId: stringValue(row.member_id),
    petId: stringValue(row.pet_id),
    type: stringValue(row.type) as Appointment['type'],
    date: stringValue(row.scheduled_date),
    time: stringValue(row.scheduled_time).slice(0, 5),
    endTime: optionalString(row.end_time)?.slice(0, 5),
    location: stringValue(store.name),
    address: optionalString(store.address),
    status: stringValue(row.status) as AppointmentStatus,
    notes: stringValue(row.notes),
    reminderSent: booleanValue(row.reminder_sent),
  }
}

function mapMedical(row: DbRow): MedicalRecord {
  return {
    id: stringValue(row.id),
    petId: stringValue(row.pet_id),
    date: stringValue(row.visit_date),
    clinicName: stringValue(row.clinic_name),
    doctorName: stringValue(row.doctor_name),
    chiefComplaint: stringValue(row.chief_complaint),
    diagnosis: stringValue(row.diagnosis),
    treatment: stringValue(row.treatment),
    prescription: Array.isArray(row.prescriptions) ? row.prescriptions as PrescriptionItem[] : [],
    nextVisitDate: nullableString(row.follow_up_date),
    receiptUrl: nullableString(row.receipt_url),
    prescriptionUrl: nullableString(row.prescription_url),
    reportUrl: nullableString(row.report_url),
  }
}

function mapGrooming(row: DbRow): GroomingRecord {
  const store = recordValue(row.stores)
  const groomer = recordValue(row.groomers)
  return {
    id: stringValue(row.id),
    petId: stringValue(row.pet_id),
    date: stringValue(row.created_at),
    shopName: stringValue(store.name),
    groomerName: stringValue(groomer.name),
    services: stringArray(row.service_names),
    price: numberValue(row.total_price),
    contractUrl: nullableString(row.contract_url),
    receiptUrl: nullableString(row.receipt_url),
    photos: [],
    notes: stringValue(row.notes),
  }
}

function mapDevice(row: DbRow): AIoTDevice {
  return {
    id: stringValue(row.id),
    petId: stringValue(row.pet_id),
    name: stringValue(row.name),
    type: stringValue(row.type) as AIoTDevice['type'],
    status: stringValue(row.status, 'offline') as AIoTDevice['status'],
    lastSeen: stringValue(row.last_seen_at, stringValue(row.created_at)),
    batteryLevel: row.battery_level === null || row.battery_level === undefined ? undefined : numberValue(row.battery_level),
    streamUrl: optionalString(row.stream_url),
  }
}

function emptyHealthData(petId: string): PetHealthData {
  return {
    petId,
    weight: [],
    bloodSugar: [],
    bloodPressureSys: [],
    bloodPressureDia: [],
    heartRate: [],
    temperature: [],
  }
}

function mapProduct(row: DbRow): Product {
  const vendor = recordValue(row.vendors)
  const imageUrl = stringValue(row.image_url)
  const images = stringArray(row.images)
  return {
    id: stringValue(row.id),
    vendorId: stringValue(row.vendor_id),
    vendorName: stringValue(vendor.store_name, 'TerryMon'),
    name: stringValue(row.name),
    petSpecies: stringValue(row.pet_species, 'all') as ProductPetSpecies,
    category: stringValue(row.category),
    subcategory: optionalString(row.subcategory),
    price: numberValue(row.price),
    originalPrice: row.original_price === null || row.original_price === undefined ? undefined : numberValue(row.original_price),
    stock: numberValue(row.stock),
    imageUrl,
    images: images.length ? images : imageUrl ? [imageUrl] : [],
    description: stringValue(row.description),
    specs: stringRecord(row.specs),
    tags: stringArray(row.tags),
    storeSection: optionalString(row.store_section),
    rating: numberValue(row.rating),
    reviewCount: numberValue(row.review_count),
    isActive: stringValue(row.status) === 'active',
  }
}

function mapOrderItem(row: DbRow): OrderItem {
  return {
    productId: stringValue(row.product_id),
    productName: stringValue(row.product_name),
    price: numberValue(row.price),
    qty: numberValue(row.qty),
    imageUrl: stringValue(row.image_url),
  }
}

function mapOrder(row: DbRow): Order {
  return {
    id: stringValue(row.id),
    memberId: stringValue(row.member_id),
    vendorId: optionalString(row.vendor_id),
    vendorName: optionalString(row.vendor_name),
    items: recordArray(row.order_items).map(mapOrderItem),
    status: stringValue(row.status, 'pending') as Order['status'],
    totalPrice: numberValue(row.subtotal, numberValue(row.total_price)),
    shippingFee: numberValue(row.shipping_fee),
    address: stringValue(row.address),
    createdAt: stringValue(row.created_at),
    shippedAt: optionalString(row.shipped_at),
    trackingNumber: optionalString(row.tracking_number),
  }
}

function mapVendor(row: DbRow): Vendor {
  return {
    id: stringValue(row.id),
    storeName: stringValue(row.store_name),
    description: stringValue(row.description),
    storeDescription: optionalString(row.description),
    phone: optionalString(row.phone),
    logoUrl: optionalString(row.logo_url),
    rating: numberValue(row.rating, 5),
    reviewCount: numberValue(row.review_count),
    productCount: numberValue(row.product_count),
    isVerified: booleanValue(row.is_verified),
    joinedAt: stringValue(row.created_at),
  }
}

function mapDocument(row: DbRow): DocItem {
  return {
    id: stringValue(row.id),
    memberId: stringValue(row.member_id),
    petId: optionalString(row.pet_id),
    type: stringValue(row.type) as DocItem['type'],
    title: stringValue(row.title),
    url: stringValue(row.url),
    size: fileSizeLabel(row.file_size as number | null | undefined),
    createdAt: stringValue(row.created_at),
    isRead: booleanValue(row.is_read),
  }
}

function mapMemberEvent(row: DbRow): MemberEvent {
  return {
    id: stringValue(row.id),
    memberId: stringValue(row.member_id),
    petId: optionalString(row.pet_id),
    title: stringValue(row.title),
    date: stringValue(row.date),
    time: optionalString(row.time)?.slice(0, 5),
    notes: optionalString(row.notes),
    createdAt: stringValue(row.created_at),
  }
}

function mapOrganization(row: DbRow): Organization {
  return {
    id: stringValue(row.id),
    memberId: stringValue(row.member_id),
    name: stringValue(row.name),
    type: stringValue(row.type) as OrgType,
    description: stringValue(row.description),
    address: optionalString(row.address),
    phone: optionalString(row.phone),
    logoUrl: optionalString(row.logo_url),
    certUrl: optionalString(row.cert_url),
    socialLinks: typeof row.social_links === 'object' && row.social_links !== null && !Array.isArray(row.social_links)
      ? row.social_links as Record<string, string>
      : {},
    status: stringValue(row.status, 'pending') as OrgStatus,
    appliedAt: stringValue(row.applied_at),
    approvedAt: optionalString(row.approved_at),
  }
}

function mapCheckpointDetail(row: DbRow): CheckpointDetail {
  const plan = recordValue(row.adoption_tracking_plans)
  const org  = recordValue(plan.organizations)
  const pet  = recordValue(plan.pets)
  return {
    checkpoint: {
      id: stringValue(row.id),
      planId: stringValue(row.plan_id),
      dueMonth: numberValue(row.due_month),
      dueDate: stringValue(row.due_date),
      status: stringValue(row.status, 'pending') as AdoptionCheckpoint['status'],
      submittedAt: optionalString(row.submitted_at),
      photoUrls: stringArray(row.photo_urls),
      responses: Array.isArray(row.responses)
        ? row.responses as { q: string; a: string }[]
        : [],
    },
    questions: Array.isArray(plan.report_questions) ? plan.report_questions as string[] : [],
    orgName: stringValue(org.name),
    pet: {
      id: stringValue(pet.id),
      name: stringValue(pet.name),
      species: stringValue(pet.species),
      breed: stringValue(pet.breed),
      photoUrl: stringValue(pet.photo_url),
    },
  }
}

function mapNotification(row: DbRow): Notification {
  return {
    id: stringValue(row.id),
    memberId: stringValue(row.member_id),
    type: stringValue(row.type) as Notification['type'],
    title: stringValue(row.title),
    body: stringValue(row.body),
    isRead: booleanValue(row.is_read),
    createdAt: stringValue(row.created_at),
    actionUrl: optionalString(row.action_url),
  }
}

async function getActiveMemberId() {
  const member = await api.getMe()
  return member.id
}

async function getMemberForCurrentSession() {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data: userData } = await supabase.auth.getUser()
  let query = supabase.from('members').select('*').limit(1)

  if (userData.user) {
    query = query.eq('supabase_uid', userData.user.id)
  } else if (typeof window !== 'undefined') {
    return null
  } else {
    query = query.order('created_at', { ascending: true })
  }

  const { data, error } = await query.single()
  if (error) throw error

  const pets = await api.getPets(data.id)
  return mapMember(data, pets)
}

export const api = {
  login: async (email: string, password: string): Promise<Member> => {
    const supabase = getSupabase()
    if (!supabase) {
      await delay(600)
      return { ...MOCK_MEMBER }
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) throw authError

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('supabase_uid', authData.user.id)
      .single()
    if (error) throw error

    const pets = await api.getPets(data.id)
    return mapMember(data, pets)
  },

  register: async (data: { name: string; phone: string; email: string; password: string; handle: string }): Promise<Member> => {
    if (!isSupabaseConfigured()) {
      await delay(800)
      return { ...MOCK_MEMBER, name: data.name, phone: data.phone, email: data.email, handle: data.handle }
    }

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null
      throw new Error(payload?.error ?? 'Registration failed')
    }

    const member = await response.json() as Member

    const { error: signInError } = await getSupabase()!.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (signInError) throw signInError

    return member
  },

  logout: async (): Promise<void> => {
    const supabase = getSupabase()
    if (supabase) await supabase.auth.signOut()
    else await delay(200)
  },

  getMe: async (): Promise<Member> => fallback(
    async () => {
      const member = await getMemberForCurrentSession()
      if (!member) throw new Error('No active member')
      return member
    },
    () => ({ ...MOCK_MEMBER, pets: MOCK_PETS }),
  ),

  updateProfile: async (data: Partial<Member>) => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { error } = await getSupabase()!
        .from('members')
        .update({
          name: data.name,
          phone: data.phone,
          email: data.email,
          avatar_url: data.avatarUrl,
        })
        .eq('id', memberId)
      if (error) throw error
      return { success: true }
    },
    { success: true },
  ),

  getBreeds: async (species?: 'dog' | 'cat'): Promise<BreedOption[]> => fallback(
    async () => {
      let query = getSupabase()!
        .from('breed_master')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('canonical_name_zh', { ascending: true })

      if (species) {
        query = query.eq('species', species)
      }

      const { data, error } = await query
      if (error) throw error
      return data.map(mapBreed)
    },
    () => getMockBreeds(species),
  ),

  getPets: async (memberId?: string): Promise<Pet[]> => fallback(
    async () => {
      const ownerId = memberId ?? (await getActiveMemberId())
      const { data, error } = await getSupabase()!
        .from('pets')
        .select('*')
        .eq('member_id', ownerId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data.map(mapPet)
    },
    [],
  ),

  getPet: async (id: string): Promise<Pet> => fallback(
    async () => {
      const { data, error } = await getSupabase()!.from('pets').select('*').eq('id', id).single()
      if (error) throw error
      return mapPet(data)
    },
    () => {
      const pet = MOCK_PETS.find(p => p.id === id)
      if (!pet) throw new Error('Pet not found')
      return pet
    },
  ),

  createPet: async (data: PetPayload): Promise<Pet> => fallback(
    async () => {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapPetPayload(data)),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error ?? 'Create pet failed')
      }
      return response.json()
    },
    () => ({
      id: `PET_${Date.now()}`,
      memberId: MOCK_MEMBER.id,
      name: data.name,
      species: data.species,
      breed: data.breed ?? '',
      birthDate: data.birthDate ?? '',
      weight: data.weight ?? 0,
      photoUrl: data.photoUrl ?? '',
      allergies: data.allergies ?? [],
      chipId: data.chipId || undefined,
      gender: data.gender,
      isNeutered: data.isNeutered,
      bloodType: data.bloodType,
      caregiver: data.caregiver,
      notes: data.notes ?? '',
      isActive: true,
    }),
  ),

  updatePet: async (id: string, data: PetPayload): Promise<Pet> => fallback(
    async () => {
      const response = await fetch(`/api/pets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapPetPayload(data)),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error ?? 'Update pet failed')
      }
      return response.json()
    },
    () => {
      const existing = MOCK_PETS.find(p => p.id === id)
      return {
        ...(existing ?? {
          id,
          memberId: MOCK_MEMBER.id,
          isActive: true,
        }),
        name: data.name,
        species: data.species,
        breed: data.breed ?? '',
        birthDate: data.birthDate ?? '',
        weight: data.weight ?? 0,
        photoUrl: data.photoUrl ?? '',
        allergies: data.allergies ?? [],
        chipId: data.chipId || undefined,
        gender: data.gender,
        isNeutered: data.isNeutered,
        bloodType: data.bloodType,
        caregiver: data.caregiver,
        notes: data.notes ?? '',
      } as Pet
    },
  ),

  archivePet: async (id: string): Promise<{ success: boolean }> => fallback(
    async () => {
      const response = await fetch(`/api/pets/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error ?? 'Archive pet failed')
      }
      return response.json()
    },
    { success: true },
  ),

  getMedical: async (petId: string): Promise<MedicalRecord[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('medical_records')
        .select('*')
        .eq('pet_id', petId)
        .order('visit_date', { ascending: false })
      if (error) throw error
      return data.map(mapMedical)
    },
    [],
  ),

  getGroomingRecords: async (petId: string): Promise<GroomingRecord[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('grooming_records')
        .select('*, stores(name), groomers(name)')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapGrooming)
    },
    [],
  ),

  getHealthData: async (petId: string): Promise<PetHealthData> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('health_data')
        .select('*')
        .eq('pet_id', petId)
        .order('recorded_at', { ascending: true })
      if (error) throw error

      const health = emptyHealthData(petId)
      for (const row of data) {
        const point = {
          timestamp: row.recorded_at,
          value: Number(row.value),
          unit: row.unit,
          deviceId: row.device_id ?? undefined,
          note: row.note ?? undefined,
        }
        if (row.metric === 'weight') health.weight.push(point)
        if (row.metric === 'blood_sugar') health.bloodSugar.push(point)
        if (row.metric === 'bp_systolic') health.bloodPressureSys.push(point)
        if (row.metric === 'bp_diastolic') health.bloodPressureDia.push(point)
        if (row.metric === 'heart_rate') health.heartRate.push(point)
        if (row.metric === 'temperature') health.temperature.push(point)
      }
      return health
    },
    () => emptyHealthData(petId),
  ),

  getDevices: async (petId: string): Promise<AIoTDevice[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('iot_devices')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data.map(mapDevice)
    },
    [],
  ),

  getAppointments: async (): Promise<Appointment[]> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data, error } = await getSupabase()!
        .from('appointments')
        .select('*, stores(name,address)')
        .eq('member_id', memberId)
        .order('scheduled_date', { ascending: false })
      if (error) throw error
      return data.map(mapAppointment)
    },
    [],
  ),

  cancelAppointment: async (id: string) => fallback(
    async () => {
      const { error } = await getSupabase()!
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
      if (error) throw error
      return { success: true }
    },
    { success: true },
  ),

  getProducts: async (params?: { category?: string; search?: string }): Promise<Product[]> => fallback(
    async () => {
      let query = getSupabase()!
        .from('products')
        .select('*, vendors(store_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (params?.category && params.category !== ALL_CATEGORY && params.category !== '?券') {
        query = query.eq('category', params.category)
      }
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data.map(mapProduct)
    },
    () => mockProducts(params),
  ),

  getOrders: async (): Promise<Order[]> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data, error } = await getSupabase()!
        .from('orders')
        .select('*, order_items(*)')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapOrder)
    },
    [],
  ),

  getOrder: async (id: string): Promise<Order> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return mapOrder(data)
    },
    () => {
      const order = MOCK_ORDERS.find(o => o.id === id)
      if (!order) throw new Error('Order not found')
      return order
    },
  ),

  placeOrder: async (data: {
    items: CartItem[]
    vendorId?: string
    vendorName?: string
    recipientName?: string
    phone?: string
    address?: string
    notes?: string
  }) => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const subtotal = data.items.reduce((sum, item) => sum + item.product.price * item.qty, 0)
      const shippingFee = subtotal >= 1000 ? 0 : 60

      const { data: order, error } = await getSupabase()!
        .from('orders')
        .insert({
          member_id: memberId,
          vendor_id: data.vendorId ?? null,
          vendor_name: data.vendorName ?? null,
          recipient_name: data.recipientName ?? '',
          recipient_phone: data.phone ?? '',
          address: data.address ?? '',
          subtotal,
          shipping_fee: shippingFee,
          total_price: subtotal + shippingFee,
          note: data.notes ?? null,
        })
        .select('*')
        .single()
      if (error) throw error

      const orderItems = data.items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        vendor_id: item.product.vendorId,
        product_name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        subtotal: item.product.price * item.qty,
        image_url: item.product.imageUrl,
      }))

      const { error: itemError } = await getSupabase()!.from('order_items').insert(orderItems)
      if (itemError) throw itemError

      // Decrement stock per item (non-blocking — RPC may not exist yet)
      await Promise.all(data.items.map(item =>
        getSupabase()!.rpc('decrement_stock', {
          p_product_id: item.product.id,
          p_qty: item.qty,
        }).then(({ error }) => {
          if (error) console.warn('[stock:decrement]', error)
        })
      ))

      // Notify member
      await getSupabase()!.from('notifications').insert({
        member_id:  memberId,
        type:       'order_update',
        title:      '訂單已成立',
        body:       `訂單 #${order.id.slice(-6).toUpperCase()} 已收到，感謝您的購買！`,
        action_url: `/shop/orders/${order.id}`,
        is_read:    false,
      })

      return { id: order.id, success: true }
    },
    { id: 'ORD_NEW', success: true },
  ),

  getVendor: async (id: string): Promise<Vendor> => fallback(
    async () => {
      const { data, error } = await getSupabase()!.from('vendors').select('*').eq('id', id).single()
      if (error) throw error
      return mapVendor(data)
    },
    () => {
      const vendor = MOCK_VENDORS[id]
      if (!vendor) return { id, storeName: '未知商家', description: '', rating: 5, reviewCount: 0, productCount: 0, isVerified: false, joinedAt: '' }
      return vendor
    },
  ),

  getProduct: async (id: string): Promise<Product> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('products')
        .select('*, vendors(store_name)')
        .eq('id', id)
        .single()
      if (error) throw error
      return mapProduct(data)
    },
    () => {
      const product = MOCK_PRODUCTS.find(p => p.id === id)
      if (!product) throw new Error('Product not found')
      return product
    },
  ),

  getVendorProducts: async (vendorId: string): Promise<Product[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('products')
        .select('*, vendors(store_name)')
        .eq('vendor_id', vendorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapProduct)
    },
    () => MOCK_PRODUCTS.filter(p => p.vendorId === vendorId && p.isActive),
  ),

  getDocuments: async (): Promise<DocItem[]> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data, error } = await getSupabase()!
        .from('documents')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapDocument)
    },
    [],
  ),

  markDocRead: async (id: string) => fallback(
    async () => {
      const { error } = await getSupabase()!.from('documents').update({ is_read: true }).eq('id', id)
      if (error) throw error
      return { success: true }
    },
    { success: true },
  ),

  getNotifications: async (): Promise<Notification[]> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data, error } = await getSupabase()!
        .from('notifications')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(mapNotification)
    },
    [],
  ),

  markAllRead: async () => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { error } = await getSupabase()!
        .from('notifications')
        .update({ is_read: true })
        .eq('member_id', memberId)
      if (error) throw error
      return { success: true }
    },
    { success: true },
  ),

  getMemberEvents: async (): Promise<MemberEvent[]> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data, error } = await getSupabase()!
        .from('member_events')
        .select('*')
        .eq('member_id', memberId)
        .order('date', { ascending: false })
      if (error) throw error
      return data.map(mapMemberEvent)
    },
    [],
  ),

  createMemberEvent: async (
    payload: Omit<MemberEvent, 'id' | 'memberId' | 'createdAt'>,
  ): Promise<MemberEvent> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data, error } = await getSupabase()!
        .from('member_events')
        .insert({
          member_id: memberId,
          pet_id: payload.petId ?? null,
          title: payload.title,
          date: payload.date,
          time: payload.time ?? null,
          notes: payload.notes ?? null,
        })
        .select('*')
        .single()
      if (error) throw error
      return mapMemberEvent(data)
    },
    () => ({
      id: `EVT_${Date.now()}`,
      memberId: MOCK_MEMBER.id,
      petId: payload.petId,
      title: payload.title,
      date: payload.date,
      time: payload.time,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    }),
  ),

  uploadPetPhoto: async (file: File): Promise<string> => {
    const supabase = getSupabase()
    if (!supabase) return URL.createObjectURL(file)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('pet-photos').upload(path, file, { upsert: true })
    if (error) throw error
    return supabase.storage.from('pet-photos').getPublicUrl(path).data.publicUrl
  },

  addHealthData: async (
    petId: string,
    payload: { metric: string; value: number; unit: string; note?: string },
  ): Promise<void> => fallback(
    async () => {
      const { error } = await getSupabase()!.from('health_data').insert({
        pet_id: petId,
        metric: payload.metric,
        value: payload.value,
        unit: payload.unit,
        note: payload.note ?? null,
        recorded_at: new Date().toISOString(),
      })
      if (error) throw error
    },
    () => {},
  ),

  getEmergencyContacts: async (petId: string): Promise<EmergencyContact[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('pet_emergency_contacts')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data.map(r => ({
        id: stringValue(r.id),
        petId: stringValue(r.pet_id),
        name: stringValue(r.name),
        phone: optionalString(r.phone),
        lineId: optionalString(r.line_id),
        email: optionalString(r.email),
        relation: stringValue(r.relation),
        note: optionalString(r.note),
      }))
    },
    () => _mockEmergencyContacts[petId] ?? [],
  ),

  addEmergencyContact: async (
    petId: string,
    data: { name: string; phone?: string; lineId?: string; email?: string; relation: string; note?: string },
  ): Promise<EmergencyContact> => fallback(
    async () => {
      const { data: row, error } = await getSupabase()!
        .from('pet_emergency_contacts')
        .insert({
          pet_id: petId,
          name: data.name,
          phone: data.phone || null,
          line_id: data.lineId || null,
          email: data.email || null,
          relation: data.relation,
          note: data.note || null,
        })
        .select('*')
        .single()
      if (error) throw error
      return {
        id: stringValue(row.id),
        petId,
        name: data.name,
        phone: optionalString(row.phone),
        lineId: optionalString(row.line_id),
        email: optionalString(row.email),
        relation: data.relation,
        note: optionalString(row.note),
      }
    },
    () => {
      const contact: EmergencyContact = { id: `EC_${Date.now()}`, petId, ...data }
      _mockEmergencyContacts[petId] = [...(_mockEmergencyContacts[petId] ?? []), contact]
      return contact
    },
  ),

  removeEmergencyContact: async (id: string): Promise<{ success: boolean }> => fallback(
    async () => {
      const { error } = await getSupabase()!.from('pet_emergency_contacts').delete().eq('id', id)
      if (error) throw error
      return { success: true }
    },
    () => {
      for (const petId of Object.keys(_mockEmergencyContacts)) {
        _mockEmergencyContacts[petId] = _mockEmergencyContacts[petId].filter(c => c.id !== id)
      }
      return { success: true }
    },
  ),

  getCaregivers: async (petId: string): Promise<PetCaregiver[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('pet_caregivers')
        .select('*, members(name, handle, avatar_url)')
        .eq('pet_id', petId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data.map(r => {
        const m = recordValue(r.members)
        return {
          id: stringValue(r.id),
          petId: stringValue(r.pet_id),
          memberId: optionalString(r.member_id),
          memberName: optionalString(m.name),
          memberHandle: optionalString(m.handle),
          memberAvatarUrl: optionalString(m.avatar_url),
          inviteContact: optionalString(r.invited_contact),
          status: stringValue(r.status, 'pending') as PetCaregiver['status'],
          permissions: (r.permissions as CaregiverPermissions) ?? { ...DEFAULT_CAREGIVER_PERMISSIONS },
          inviteExpiresAt: optionalString(r.invite_expires_at),
        }
      })
    },
    () => _mockCaregivers[petId] ?? [],
  ),

  searchMemberForInvite: async (query: string): Promise<{
    found: boolean
    member?: { id: string; name: string; handle?: string; avatarUrl?: string }
  }> => fallback(
    async () => {
      const q = query.trim().toLowerCase()
      const isHandle = q.startsWith('@')
      let dbQuery = getSupabase()!.from('members').select('id, name, handle, avatar_url').limit(1)
      if (isHandle) dbQuery = dbQuery.eq('handle', q.slice(1))
      else if (q.includes('@')) dbQuery = dbQuery.eq('email', q)
      else dbQuery = dbQuery.eq('phone', q)
      const { data } = await dbQuery.maybeSingle()
      if (!data) return { found: false }
      return {
        found: true,
        member: {
          id: stringValue(data.id),
          name: stringValue(data.name),
          handle: optionalString(data.handle),
          avatarUrl: optionalString(data.avatar_url),
        },
      }
    },
    () => {
      const q = query.trim().toLowerCase()
      const mock = MOCK_MEMBER
      const matches =
        mock.phone === q ||
        (mock.email?.toLowerCase() === q) ||
        (q.startsWith('@') ? mock.handle === q.slice(1) : mock.handle === q)
      if (!matches) return { found: false }
      return { found: true, member: { id: mock.id, name: mock.name, handle: mock.handle } }
    },
  ),

  inviteCaregiver: async (
    petId: string,
    data: { memberId?: string; memberName?: string; memberHandle?: string; memberAvatarUrl?: string; inviteContact?: string },
  ): Promise<PetCaregiver> => fallback(
    async () => {
      const token = crypto.randomUUID().slice(0, 8)
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      const { data: row, error } = await getSupabase()!
        .from('pet_caregivers')
        .insert({
          pet_id: petId,
          member_id: data.memberId ?? null,
          invited_contact: data.inviteContact ?? null,
          status: 'pending',
          permissions: { ...DEFAULT_CAREGIVER_PERMISSIONS },
          invite_token: token,
          invite_expires_at: expiresAt,
        })
        .select('*')
        .single()
      if (error) throw error
      return {
        id: stringValue(row.id),
        petId,
        memberId: data.memberId,
        memberName: data.memberName,
        memberHandle: data.memberHandle,
        memberAvatarUrl: data.memberAvatarUrl,
        inviteContact: data.inviteContact,
        status: 'pending',
        permissions: { ...DEFAULT_CAREGIVER_PERMISSIONS },
        inviteExpiresAt: expiresAt,
      }
    },
    () => {
      const caregiver: PetCaregiver = {
        id: `CG_${Date.now()}`,
        petId,
        ...data,
        status: 'pending',
        permissions: { ...DEFAULT_CAREGIVER_PERMISSIONS },
        inviteExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      }
      _mockCaregivers[petId] = [...(_mockCaregivers[petId] ?? []), caregiver]
      return caregiver
    },
  ),

  generateInviteLink: async (petId: string): Promise<string> => fallback(
    async () => {
      const token = crypto.randomUUID().slice(0, 8)
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      const { error } = await getSupabase()!.from('pet_caregivers').insert({
        pet_id: petId,
        status: 'pending',
        permissions: { ...DEFAULT_CAREGIVER_PERMISSIONS },
        invite_token: token,
        invite_expires_at: expiresAt,
      })
      if (error) throw error
      const base = typeof window !== 'undefined' ? window.location.origin : 'https://terrymon.app'
      return `${base}/join?token=${token}`
    },
    () => `https://terrymon.app/join?token=${Math.random().toString(36).slice(2, 10)}`,
  ),

  updateCaregiverPermissions: async (
    caregiverId: string,
    permissions: CaregiverPermissions,
  ): Promise<{ success: boolean }> => fallback(
    async () => {
      const { error } = await getSupabase()!
        .from('pet_caregivers')
        .update({ permissions })
        .eq('id', caregiverId)
      if (error) throw error
      return { success: true }
    },
    () => {
      for (const petId of Object.keys(_mockCaregivers)) {
        const idx = _mockCaregivers[petId].findIndex(c => c.id === caregiverId)
        if (idx !== -1) _mockCaregivers[petId][idx] = { ..._mockCaregivers[petId][idx], permissions }
      }
      return { success: true }
    },
  ),

  removeCaregiver: async (caregiverId: string): Promise<{ success: boolean }> => fallback(
    async () => {
      const { error } = await getSupabase()!.from('pet_caregivers').delete().eq('id', caregiverId)
      if (error) throw error
      return { success: true }
    },
    () => {
      for (const petId of Object.keys(_mockCaregivers)) {
        _mockCaregivers[petId] = _mockCaregivers[petId].filter(c => c.id !== caregiverId)
      }
      return { success: true }
    },
  ),

  // ── 機構 / 中途 ──────────────────────────────────────────────────
  getMyOrganization: async (): Promise<Organization | null> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data } = await getSupabase()!
        .from('organizations')
        .select('*')
        .eq('member_id', memberId)
        .order('applied_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data ? mapOrganization(data) : null
    },
    () => null,
  ),

  applyOrganization: async (payload: {
    name: string
    type: OrgType
    description?: string
    phone?: string
    address?: string
    certUrl?: string
  }): Promise<Organization> => {
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        type: payload.type,
        description: payload.description,
        phone: payload.phone,
        address: payload.address,
        cert_url: payload.certUrl,
      }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => null) as { error?: string } | null
      throw new Error(err?.error ?? '申請失敗')
    }
    return response.json() as Promise<Organization>
  },

  // ── 送養追蹤回報 ─────────────────────────────────────────────────
  getCheckpoint: async (id: string): Promise<CheckpointDetail | null> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('adoption_checkpoints')
        .select(`
          *,
          adoption_tracking_plans (
            report_questions,
            organizations ( name ),
            pets ( id, name, species, breed, photo_url )
          )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return mapCheckpointDetail(data as DbRow)
    },
    () => null,
  ),

  submitCheckpoint: async (
    id: string,
    data: { photoUrls: string[]; responses: { q: string; a: string }[] },
  ): Promise<{ success: boolean }> => fallback(
    async () => {
      const { error } = await getSupabase()!
        .from('adoption_checkpoints')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          photo_urls: data.photoUrls,
          responses: data.responses,
        })
        .eq('id', id)
      if (error) throw error
      return { success: true }
    },
    () => ({ success: true }),
  ),

  // ── 送養追蹤計畫（機構建立）────────────────────────────────────
  getMyAdoptionPlans: async (orgId: string): Promise<AdoptionTrackingPlan[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('adoption_tracking_plans')
        .select('*, pets(name)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(r => {
        const pet = r.pets as { name: string } | null
        return {
          id: stringValue(r.id),
          organizationId: stringValue(r.organization_id),
          petId: stringValue(r.pet_id),
          petName: pet ? stringValue(pet.name) : '',
          adopterMemberId: stringValue(r.adopter_member_id),
          adoptionDate: stringValue(r.adoption_date),
          scheduleMonths: Array.isArray(r.schedule_months) ? r.schedule_months as number[] : [],
          reportQuestions: Array.isArray(r.report_questions) ? r.report_questions as string[] : [],
          status: stringValue(r.status, 'active') as AdoptionTrackingPlan['status'],
          createdAt: stringValue(r.created_at),
        }
      })
    },
    () => [],
  ),

  createAdoptionPlan: async (payload: {
    petId: string
    adopterMemberId: string
    adoptionDate: string
    scheduleMonths: number[]
    reportQuestions: string[]
  }): Promise<{ id: string; success: boolean }> => {
    const response = await fetch('/api/adoption-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petId: payload.petId,
        adopterMemberId: payload.adopterMemberId,
        adoptionDate: payload.adoptionDate,
        scheduleMonths: payload.scheduleMonths,
        reportQuestions: payload.reportQuestions,
      }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => null) as { error?: string } | null
      throw new Error(err?.error ?? '建立送養計畫失敗')
    }
    return response.json() as Promise<{ id: string; success: boolean }>
  },

  // ── 日常紀錄 ─────────────────────────────────────────────────────
  getDailyLogs: async (petId: string, date?: string): Promise<PetDailyLog[]> => fallback(
    async () => {
      let q = getSupabase()!.from('pet_daily_logs').select('*')
        .eq('pet_id', petId).order('created_at', { ascending: false })
      if (date) q = q.eq('log_date', date)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []).map(r => ({
        id: stringValue(r.id), petId: stringValue(r.pet_id),
        logDate: stringValue(r.log_date),
        type: stringValue(r.type) as PetDailyLog['type'],
        data: (r.data ?? {}) as PetDailyLog['data'],
        notes: optionalString(r.notes), createdAt: stringValue(r.created_at),
      }))
    },
    () => [],
  ),

  addDailyLog: async (
    petId: string,
    payload: { type: PetDailyLog['type']; data: object; notes?: string; logDate?: string },
  ): Promise<PetDailyLog> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data, error } = await getSupabase()!.from('pet_daily_logs')
        .insert({
          pet_id: petId, member_id: memberId,
          log_date: payload.logDate ?? new Date().toISOString().slice(0, 10),
          type: payload.type, data: payload.data, notes: payload.notes ?? null,
        })
        .select('*').single()
      if (error) throw error
      return {
        id: stringValue(data.id), petId,
        logDate: stringValue(data.log_date),
        type: payload.type, data: payload.data as PetDailyLog['data'],
        notes: payload.notes, createdAt: stringValue(data.created_at),
      }
    },
    () => ({
      id: `LOG_${Date.now()}`, petId,
      logDate: payload.logDate ?? new Date().toISOString().slice(0, 10),
      type: payload.type, data: payload.data as PetDailyLog['data'],
      notes: payload.notes, createdAt: new Date().toISOString(),
    }),
  ),

  getVaccineReminders: async (petId: string): Promise<VaccineReminder[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!.from('pet_vaccine_reminders')
        .select('*').eq('pet_id', petId).eq('is_active', true)
        .order('next_due_date', { ascending: true })
      if (error) throw error
      return (data ?? []).map(r => ({
        id: stringValue(r.id), petId: stringValue(r.pet_id),
        name: stringValue(r.name),
        lastDoneDate: optionalString(r.last_done_date),
        nextDueDate: optionalString(r.next_due_date),
        notes: optionalString(r.notes), createdAt: stringValue(r.created_at),
      }))
    },
    () => [],
  ),

  addVaccineReminder: async (
    petId: string,
    payload: { name: string; nextDueDate?: string; lastDoneDate?: string; notes?: string },
  ): Promise<VaccineReminder> => fallback(
    async () => {
      const memberId = await getActiveMemberId()
      const { data, error } = await getSupabase()!.from('pet_vaccine_reminders')
        .insert({
          pet_id: petId, member_id: memberId,
          name: payload.name, next_due_date: payload.nextDueDate ?? null,
          last_done_date: payload.lastDoneDate ?? null, notes: payload.notes ?? null,
        })
        .select('*').single()
      if (error) throw error
      return {
        id: stringValue(data.id), petId, name: payload.name,
        nextDueDate: payload.nextDueDate, lastDoneDate: payload.lastDoneDate,
        notes: payload.notes, createdAt: stringValue(data.created_at),
      }
    },
    () => ({
      id: `VAC_${Date.now()}`, petId, name: payload.name,
      nextDueDate: payload.nextDueDate, lastDoneDate: payload.lastDoneDate,
      notes: payload.notes, createdAt: new Date().toISOString(),
    }),
  ),

  deleteVaccineReminder: async (id: string): Promise<{ success: boolean }> => fallback(
    async () => {
      const { error } = await getSupabase()!.from('pet_vaccine_reminders')
        .update({ is_active: false }).eq('id', id)
      if (error) throw error
      return { success: true }
    },
    () => ({ success: true }),
  ),

  // ── 照顧權轉移 ──────────────────────────────────────────────────
  getPetTransfers: async (petId: string): Promise<PetTransfer[]> => fallback(
    async () => {
      const { data, error } = await getSupabase()!
        .from('pet_transfers')
        .select('*, from:from_member_id(name), to:to_member_id(name)')
        .eq('pet_id', petId)
        .order('transferred_at', { ascending: false })
      if (error) throw error
      return data.map(r => ({
        id: stringValue(r.id),
        petId,
        fromMemberId: stringValue(r.from_member_id),
        toMemberId: stringValue(r.to_member_id),
        fromMemberName: optionalString(recordValue(r.from).name),
        toMemberName: optionalString(recordValue(r.to).name),
        transferType: stringValue(r.transfer_type) as TransferType,
        reason: optionalString(r.reason),
        transferredAt: stringValue(r.transferred_at),
      }))
    },
    () => [],
  ),

  transferPet: async (
    petId: string,
    data: { toMemberId: string; transferType: TransferType; reason?: string },
  ): Promise<{ success: boolean }> => fallback(
    async () => {
      const supabase = getSupabase()!
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: member } = await supabase
        .from('members').select('id').eq('supabase_uid', user.id).single()
      if (!member) throw new Error('Member not found')

      const fromMemberId = stringValue(member.id)

      const { error: transferError } = await supabase
        .from('pet_transfers')
        .insert({
          pet_id: petId,
          from_member_id: fromMemberId,
          to_member_id: data.toMemberId,
          transfer_type: data.transferType,
          reason: data.reason || null,
        })
      if (transferError) throw transferError

      const { error: petError } = await supabase
        .from('pets')
        .update({ primary_caregiver_id: data.toMemberId })
        .eq('id', petId)
      if (petError) throw petError

      return { success: true }
    },
    () => ({ success: true }),
  ),
}
