import {
  MOCK_MEMBER, MOCK_PETS, MOCK_MEDICAL, MOCK_APPOINTMENTS,
  MOCK_HEALTH_DATA, MOCK_DEVICES, MOCK_PRODUCTS, MOCK_ORDERS,
  MOCK_DOCUMENTS, MOCK_NOTIFICATIONS, MOCK_GROOMING_RECORDS,
} from '@/lib/mock'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  Member, Pet, MedicalRecord, Appointment, AppointmentStatus,
  PetHealthData, AIoTDevice, Product, Order, OrderItem,
  DocItem, Notification, GroomingRecord, CartItem, PrescriptionItem,
} from '@/types'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))
const ALL_CATEGORY = '全部'
type DbRow = Record<string, unknown>

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
    name: stringValue(row.name),
    species: stringValue(row.species, 'other') as Pet['species'],
    breed: stringValue(row.breed),
    birthDate: stringValue(row.birth_date),
    weight: numberValue(row.weight),
    photoUrl: stringValue(row.photo_url),
    allergies: stringArray(row.allergies),
    chipId: optionalString(row.chip_id),
    notes: stringValue(row.notes),
    isActive: booleanValue(row.is_active, true),
  }
}

function mapMember(row: DbRow, pets: Pet[] = []): Member {
  return {
    id: stringValue(row.id),
    name: stringValue(row.name),
    phone: stringValue(row.phone),
    email: stringValue(row.email),
    avatarUrl: optionalString(row.avatar_url),
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

  register: async (data: { name: string; phone: string; email: string; password: string }): Promise<Member> => {
    if (!isSupabaseConfigured()) {
      await delay(800)
      return { ...MOCK_MEMBER, name: data.name, phone: data.phone, email: data.email }
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

    return response.json()
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
    MOCK_PETS,
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
    () => MOCK_MEDICAL.filter(r => r.petId === petId),
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
    () => MOCK_GROOMING_RECORDS.filter(r => r.petId === petId),
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
    () => ({ ...MOCK_HEALTH_DATA, petId }),
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
    () => MOCK_DEVICES.filter(d => d.petId === petId),
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
    MOCK_APPOINTMENTS,
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
    MOCK_ORDERS,
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

      return { id: order.id, success: true }
    },
    { id: 'ORD_NEW', success: true },
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
    MOCK_DOCUMENTS,
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
    MOCK_NOTIFICATIONS,
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
}
