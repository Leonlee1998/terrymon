export type Species = 'dog' | 'cat' | 'other'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type DocumentType = 'prescription' | 'receipt' | 'contract'
export type QueueStatus = 'waiting' | 'in-progress' | 'done'
export type ServiceType = 'vet' | 'grooming' | 'other'
export type ScheduleStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'

export type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Member {
  id: string
  name: string
  phone: string
  email: string
  qrCode: string
  memberSince: string
  balance: number
  points: number
  tier?: MemberTier
  pets: Pet[]
}

export interface Pet {
  id: string
  memberId: string
  name: string
  species: Species
  breed: string
  birthDate: string
  weight: number
  photoUrl: string
  allergies: string[]
  chipId?: string
  notes: string
  isActive?: boolean
}

export interface MedicalRecord {
  id: string
  petId: string
  date: string
  clinicName: string
  doctorName: string
  diagnosis: string
  prescription: PrescriptionItem[]
  nextVisitDate: string | null
  receiptUrl: string | null
  prescriptionUrl: string | null
}

export interface PrescriptionItem {
  medicine: string
  dosage: string
  frequency: string
  days: number
}

export interface PetGroomingRecord {
  id: string
  petId: string
  date: string
  shopName: string
  services: string[]
  price: number
  contractUrl: string | null
  notes: string
}

export interface Appointment {
  id: string
  memberId: string
  petId: string
  type: ServiceType
  date: string
  time: string
  location: string
  status: AppointmentStatus
  notes: string
}

export interface KioskService {
  id: string
  name: string
  price: number
  duration: number
  description: string
  isAddon: boolean
  enabled: boolean
}

// ── 美容師階級 ────────────────────────────────────────
export type GroomerRank = 'director' | 'senior' | 'stylist'

export interface Groomer {
  id: string
  storeId: string
  name: string
  rank: GroomerRank
  avatarUrl?: string
  specialties: string[]
  maxDailySlots: number
  isActive: boolean
  joinedAt: string
}

// ── 品種資料庫 ────────────────────────────────────────
export type CoatLength = 'short' | 'medium' | 'long' | 'double' | 'wire'
export type SpeciesType = 'dog' | 'cat'

export interface Breed {
  id: string
  name: string
  nameEn: string
  species: SpeciesType
  defaultCoatLength: CoatLength
  defaultWeightRangeId: string
  tags: string[]
  isCustom: boolean
}

export interface WeightRange {
  id: string
  label: string
  minKg: number
  maxKg: number
}

// ── 服務定價矩陣 ─────────────────────────────────────
export type ServiceCategory = 'main' | 'addon' | 'package'

export interface ServicePriceMatrix {
  weightRangeId: string
  coatLength: CoatLength
  regularPrice: number
  memberPrice: number
  balancePrice: number
  durationMin: number
}

export interface GroomingService {
  id: string
  storeId: string
  name: string
  description: string
  category: ServiceCategory
  isEnabled: boolean
  priceMatrix: ServicePriceMatrix[]
  applicableSpecies: SpeciesType[]
  sortOrder: number
  packageMainServiceId?: string
  packageAddonIds?: string[]
  packageDiscountPct?: number
  createdAt: string
}

// ── 現場商品 ─────────────────────────────────────────
export interface ShopProduct {
  id: string
  storeId: string
  name: string
  category: string
  price: number
  memberPrice: number
  stock: number
  imageUrl?: string
  barcode?: string
  isActive: boolean
}

// ── 排班 ─────────────────────────────────────────────
export type ShiftType = 'full' | 'morning' | 'afternoon' | 'off'

export interface GroomerShift {
  id: string
  groomerId: string
  date: string
  shiftType: ShiftType
  startTime?: string
  endTime?: string
  maxSlots?: number
  note?: string
}

export interface StoreHours {
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
  lastBookingTime: string
}

// ── 服務紀錄 ─────────────────────────────────────────
export interface GroomingRecord {
  id: string
  appointmentId?: string
  memberId: string
  memberName: string
  petId: string
  petName: string
  petBreed: string
  petWeight: number
  groomerId: string
  groomerName: string
  storeId: string
  date: string
  startTime: string
  endTime?: string
  services: string[]
  totalPrice: number
  paymentMethod: 'card' | 'balance' | 'mixed' | 'cash'
  balanceUsed: number
  cardAmount: number
  status: 'in-progress' | 'completed' | 'cancelled'
  contractUrl?: string
  receiptUrl?: string
  cctv: CCTVSession[]
  notes: string
  createdAt: string
}

export interface CCTVSession {
  id: string
  recordId: string
  cameraName: string
  startTime: string
  endTime?: string
  status: 'recording' | 'completed' | 'archived'
  streamUrl?: string
  vodUrl?: string
  thumbnailUrl?: string
  durationMin?: number
  shareToken?: string
  shareExpiry?: string
}

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
  consultation?: { diagnosis: string }
}

export interface DocItem {
  id: string
  memberId: string
  type: DocumentType
  title: string
  url: string
  petId?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  imageUrl: string
  description: string
}

export interface CartItem {
  product: Product
  qty: number
}

export interface ScheduleItem {
  id: string
  time: string
  endTime?: string
  petName: string
  memberName: string
  service: string
  groomer: string
  status: ScheduleStatus
}

export interface KioskStep {
  step: 'standby' | 'scan' | 'pet' | 'services' | 'contract' | 'signature' | 'complete'
}

export interface CompleteServicePayload {
  memberId: string
  petId: string
  mainServiceId: string
  addonServiceIds: string[]
  totalPrice: number
  signatureData: string
  contractHtml: string
}
