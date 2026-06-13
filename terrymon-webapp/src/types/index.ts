// ── 基本列舉 ──────────────────────────────────────────
export type Species           = 'dog' | 'cat' | 'other'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type DocumentType      = 'prescription' | 'receipt' | 'contract' | 'report'
export type ServiceType       = 'vet' | 'grooming' | 'other'
export type OrderStatus       = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
export type QueueStatus       = 'waiting' | 'in-progress' | 'done'

// ── 會員 ─────────────────────────────────────────────
export interface Member {
  id: string
  name: string
  phone: string
  email: string
  avatarUrl?: string
  qrCode: string
  memberSince: string
  balance: number          // 美容儲值
  points: number
  tier: 'basic' | 'silver' | 'gold'
  pets: Pet[]
}

// ── 寵物 ─────────────────────────────────────────────
export interface Pet {
  id: string
  memberId: string
  name: string
  species: Species
  breed: string
  birthDate: string
  weight: number           // kg，最新紀錄
  photoUrl: string
  allergies: string[]
  chipId?: string
  notes: string
  isActive: boolean
}

// ── 醫療 ─────────────────────────────────────────────
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

// ── 美容 ─────────────────────────────────────────────
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
  photos: string[]          // 美容前後照片
  notes: string
}

// ── 健康數據（AIoT）─────────────────────────────────
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
  streamUrl?: string        // 攝影機 stream（MVP 用假 URL）
}

// ── 預約 ─────────────────────────────────────────────
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

// ── 商城 ─────────────────────────────────────────────
export interface Product {
  id: string
  vendorId: string
  vendorName: string
  name: string
  category: string
  subcategory?: string
  price: number
  originalPrice?: number   // 原價（促銷用）
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

// ── 文件 ─────────────────────────────────────────────
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

// ── 通知 ─────────────────────────────────────────────
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

// ── 美容服務（診所管理端）────────────────────────────
export interface GroomingService {
  id: string
  name: string
  price: number
  duration: number
  description: string
  isAddon: boolean
  enabled: boolean
}

// ── 候診隊列 ─────────────────────────────────────────
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
