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
  memberId: string            // 原始登記飼主（不變）
  primaryCaregiverId?: string // 當前主要照顧者（可轉移；未設定 = 同 memberId）
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

export type TransferType = 'foster' | 'adoption' | 'surrender' | 'return'

export interface PetTransfer {
  id: string
  petId: string
  fromMemberId: string
  toMemberId: string
  fromMemberName?: string
  toMemberName?: string
  transferType: TransferType
  reason?: string
  transferredAt: string
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
export interface Vendor {
  id: string
  storeName: string
  description: string
  storeDescription?: string
  phone?: string
  logoUrl?: string
  rating: number
  reviewCount: number
  productCount: number
  isVerified: boolean
  joinedAt: string
}

export interface Product {
  id: string
  vendorId: string
  vendorName: string
  name: string
  petSpecies?: 'all' | 'dog' | 'cat' | 'small_pet' | 'bird' | 'fish'
  category: string
  subcategory?: string
  storeSection?: string
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
  vendorId?: string
  vendorName?: string
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
  phone?: string
  lineId?: string
  email?: string
  relation: string
  note?: string
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

// ── 機構 / 中途 ───────────────────────────────────────
export type OrgType   = 'individual' | 'shelter' | 'rescue'
export type OrgStatus = 'pending' | 'approved' | 'suspended'

export interface Organization {
  id: string
  memberId: string
  name: string
  type: OrgType
  description: string
  address?: string
  phone?: string
  logoUrl?: string
  certUrl?: string
  socialLinks: Record<string, string>
  status: OrgStatus
  appliedAt: string
  approvedAt?: string
}

// ── 送養追蹤 ──────────────────────────────────────────
export interface AdoptionCheckpointResponse {
  q: string
  a: string
}

export interface AdoptionCheckpoint {
  id: string
  planId: string
  dueMonth: number
  dueDate: string
  status: 'pending' | 'submitted' | 'overdue'
  submittedAt?: string
  photoUrls: string[]
  responses: AdoptionCheckpointResponse[]
}

export interface CheckpointDetail {
  checkpoint: AdoptionCheckpoint
  questions: string[]
  orgName: string
  pet: {
    id: string
    name: string
    species: string
    breed: string
    photoUrl: string
  }
}

// ── 日常紀錄 ──────────────────────────────────────────────
export interface DietLogData {
  mealTime: string        // 'morning' | 'noon' | 'evening' | custom
  mealTimeLabel: string   // '早餐' | '午餐' | '晚餐' | 自訂文字
  foodName: string
  amount?: string
}

export interface PoopLogData {
  consistency: 'normal' | 'soft' | 'loose' | 'constipated'
  color: 'brown' | 'yellow' | 'black' | 'bloody'
}

export interface VomitLogData {
  content: 'food' | 'bile' | 'blood' | 'hair' | 'other'
  contentLabel: string
}

export interface PetDailyLog {
  id: string
  petId: string
  logDate: string
  type: 'diet' | 'poop' | 'vomit'
  data: DietLogData | PoopLogData | VomitLogData
  notes?: string
  photoUrls?: string[]
  createdAt: string
}

export interface VaccineReminder {
  id: string
  petId: string
  name: string
  lastDoneDate?: string
  nextDueDate?: string
  notes?: string
  category?: 'vaccine' | 'dewormer'
  createdAt: string
}

// ── 送養追蹤計畫 ──────────────────────────────────────────
export interface AdoptionTrackingPlan {
  id: string
  organizationId: string
  petId: string
  petName: string
  adopterMemberId: string
  adoptionDate: string
  scheduleMonths: number[]
  reportQuestions: string[]
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
}

