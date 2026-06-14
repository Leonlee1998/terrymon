// ?? ?箸?? ??????????????????????????????????????????
export type Species           = 'dog' | 'cat' | 'other'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type DocumentType      = 'prescription' | 'receipt' | 'contract' | 'report'
export type ServiceType       = 'vet' | 'grooming' | 'other'
export type OrderStatus       = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
export type QueueStatus       = 'waiting' | 'in-progress' | 'done'

// ?? ? ?????????????????????????????????????????????
export interface ShippingAddress {
  recipientName: string
  phone: string
  zipCode: string
  city: string
  district: string
  address: string
}

export interface Member {
  id: string
  name: string
  phone: string
  email: string
  avatarUrl?: string
  handle?: string
  isPhoneVerified?: boolean
  isEmailVerified?: boolean
  shippingAddress?: ShippingAddress
  qrCode: string
  memberSince: string
  balance: number
  points: number
  tier: 'basic' | 'silver' | 'gold'
  pets: Pet[]
}

// ?? 撖萇 ?????????????????????????????????????????????
export interface Pet {
  id: string
  memberId: string
  name: string
  species: Species
  breedId?: string
  breed: string
  birthDate: string
  weight: number
  photoUrl: string
  allergies: string[]
  chipId?: string
  gender?: 'male' | 'female'
  isNeutered?: boolean
  bloodType?: string
  caregiver?: string
  notes: string
  isActive: boolean
}

export type BreedLegalStatusTw = 'allowed' | 'restricted' | 'prohibited' | 'legacy_only' | 'unknown'

export interface BreedOption {
  id: string
  species: 'dog' | 'cat'
  nameZh: string
  nameEn: string
  aliases: string[]
  registrySources: string[]
  group: string
  size: 'toy' | 'small' | 'medium' | 'large' | 'giant' | 'unknown'
  coatType: string[]
  groomingTags: string[]
  vetRiskTags: string[]
  legalStatusTw: BreedLegalStatusTw
  legalNote: string | null
  sortOrder: number
}

// ?? ?怎? ?????????????????????????????????????????????
export interface MedicalRecord {
  id: string
  petId: string
  date: string
  clinicName: string
  doctorName: string
  chiefComplaint: string
  diagnosis: string
  treatment: string
  prescription: PrescriptionItem[]
  nextVisitDate: string | null
  receiptUrl: string | null
  prescriptionUrl: string | null
  reportUrl: string | null
}

export interface PrescriptionItem {
  medicine: string
  dosage: string
  frequency: string
  days: number
  notes?: string
}

// ?? 蝢捆 ?????????????????????????????????????????????
export interface GroomingRecord {
  id: string
  petId: string
  date: string
  shopName: string
  groomerName: string
  services: string[]
  price: number
  contractUrl: string | null
  receiptUrl: string | null
  photos: string[]          // 蝢捆???抒?
  notes: string
}

// ?? ?亙熒?豢?嚗IoT嚗?????????????????????????????????
export interface HealthDataPoint {
  timestamp: string         // ISO
  value: number
  unit: string
  deviceId?: string
  note?: string
}

export interface PetHealthData {
  petId: string
  weight: HealthDataPoint[]
  bloodSugar: HealthDataPoint[]
  bloodPressureSys: HealthDataPoint[]
  bloodPressureDia: HealthDataPoint[]
  heartRate: HealthDataPoint[]
  temperature: HealthDataPoint[]
}

export interface AIoTDevice {
  id: string
  petId: string
  name: string
  type: 'camera' | 'glucose' | 'bp_monitor' | 'thermometer' | 'scale'
  status: 'online' | 'offline' | 'error'
  lastSeen: string
  batteryLevel?: number
  streamUrl?: string
}

// ?? ?? ?????????????????????????????????????????????
export interface Appointment {
  id: string
  memberId: string
  petId: string
  type: ServiceType
  date: string
  time: string
  endTime?: string
  location: string
  address?: string
  status: AppointmentStatus
  notes: string
  reminderSent: boolean
}

// ?? ?? ?????????????????????????????????????????????
export interface Product {
  id: string
  vendorId: string
  vendorName: string
  name: string
  petSpecies?: 'all' | 'dog' | 'cat' | 'small_pet' | 'bird' | 'fish'
  category: string
  subcategory?: string
  price: number
  originalPrice?: number
  stock: number
  imageUrl: string
  images: string[]
  description: string
  specs: Record<string, string>
  tags: string[]
  rating: number
  reviewCount: number
  isActive: boolean
}

export interface CartItem {
  product: Product
  qty: number
}

export interface Order {
  id: string
  memberId: string
  items: OrderItem[]
  status: OrderStatus
  totalPrice: number
  shippingFee: number
  address: string
  createdAt: string
  paidAt?: string
  shippedAt?: string
  trackingNumber?: string
}

export interface OrderItem {
  productId: string
  productName: string
  price: number
  qty: number
  imageUrl: string
}

// ?? ?辣 ?????????????????????????????????????????????
export interface DocItem {
  id: string
  memberId: string
  petId?: string
  type: DocumentType
  title: string
  url: string
  size?: string
  createdAt: string
  isRead: boolean
}

// ?? ? ?????????????????????????????????????????????
export interface Notification {
  id: string
  memberId: string
  type: 'appointment_reminder' | 'doc_received' | 'order_update' | 'health_alert' | 'promo'
  title: string
  body: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

// ?? 蝢捆??嚗那?蝞∠?蝡荔?????????????????????????????
export interface GroomingService {
  id: string
  name: string
  price: number
  duration: number
  description: string
  isAddon: boolean
  enabled: boolean
}

// ?? ?那?? ?????????????????????????????????????????
export interface QueueItem {
  queueNum: string
  petId: string
  memberId: string
  memberName: string
  status: QueueStatus
  weight: number
  checkinTime: string
  petName: string
  petBreed: string
  allergies: string[]
}

// ── 飼主自訂事件 ──────────────────────────────────────
export interface MemberEvent {
  id: string
  memberId: string
  petId?: string
  title: string
  date: string      // YYYY-MM-DD
  time?: string     // HH:MM
  notes?: string
  createdAt: string
}

// ── 緊急聯絡人 ────────────────────────────────────────
export interface EmergencyContact {
  id: string
  petId: string
  name: string
  phone: string
  relation: string
}

// ── 共同照護者 ────────────────────────────────────────
export interface CaregiverPermissions {
  viewHealth: boolean
  viewAiot: boolean
  addHealth: boolean
  bookAppointment: boolean
  receiveNotifications: boolean
}

export const DEFAULT_CAREGIVER_PERMISSIONS: CaregiverPermissions = {
  viewHealth: false,
  viewAiot: false,
  addHealth: false,
  bookAppointment: false,
  receiveNotifications: false,
}

export interface PetCaregiver {
  id: string
  petId: string
  memberId?: string
  memberName?: string
  memberHandle?: string
  memberAvatarUrl?: string
  inviteContact?: string
  status: 'pending' | 'active'
  permissions: CaregiverPermissions
  inviteExpiresAt?: string
}

