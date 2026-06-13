export type Species = 'dog' | 'cat' | 'other'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type DocumentType = 'prescription' | 'receipt' | 'contract'
export type QueueStatus = 'waiting' | 'in-progress' | 'done'
export type ServiceType = 'vet' | 'grooming' | 'other'
export type ScheduleStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'

export interface Member {
  id: string
  name: string
  phone: string
  email: string
  qrCode: string
  memberSince: string
  balance: number
  points: number
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
  notes: string
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

export interface GroomingRecord {
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

export interface GroomingService {
  id: string
  name: string
  price: number
  duration: number
  description: string
  isAddon: boolean
  enabled: boolean
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
  petName: string
  memberName: string
  service: string
  groomer: string
  status: ScheduleStatus
}
