import {
  MOCK_MEMBER, MOCK_PETS, MOCK_MEDICAL, MOCK_APPOINTMENTS,
  MOCK_HEALTH_DATA, MOCK_DEVICES, MOCK_PRODUCTS, MOCK_ORDERS,
  MOCK_DOCUMENTS, MOCK_NOTIFICATIONS,
} from '@/lib/mock'
import type {
  Member, Pet, MedicalRecord, Appointment,
  PetHealthData, AIoTDevice, Product, Order,
  DocItem, Notification,
} from '@/types'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const api = {
  // Auth
  login:  async (_email: string, _password: string): Promise<Member> => {
    await delay(600)
    return { ...MOCK_MEMBER }
  },
  logout: async (): Promise<void> => { await delay(200) },

  // Member
  getMe:          async (): Promise<Member>         => { await delay(); return { ...MOCK_MEMBER } },
  updateProfile:  async (_data: Partial<Member>)    => { await delay(400); return { success: true } },

  // Pets
  getPets:        async (): Promise<Pet[]>          => { await delay(); return MOCK_PETS },
  getPet:         async (id: string): Promise<Pet>  => {
    await delay()
    const pet = MOCK_PETS.find(p => p.id === id)
    if (!pet) throw new Error('Pet not found')
    return pet
  },

  // Medical
  getMedical: async (petId: string): Promise<MedicalRecord[]> => {
    await delay()
    return MOCK_MEDICAL.filter(r => r.petId === petId)
  },

  // Health / AIoT
  getHealthData: async (petId: string): Promise<PetHealthData> => {
    await delay()
    return { ...MOCK_HEALTH_DATA, petId }
  },
  getDevices: async (petId: string): Promise<AIoTDevice[]> => {
    await delay()
    return MOCK_DEVICES.filter(d => d.petId === petId)
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => { await delay(); return MOCK_APPOINTMENTS },
  cancelAppointment: async (_id: string)            => { await delay(400); return { success: true } },

  // Shop
  getProducts: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
    await delay()
    let result = MOCK_PRODUCTS
    if (params?.category && params.category !== '全部') {
      result = result.filter(p => p.category === params.category)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }
    return result
  },
  getOrders: async (): Promise<Order[]> => { await delay(); return MOCK_ORDERS },
  placeOrder: async (_data: unknown)   => { await delay(800); return { id: 'ORD_NEW', success: true } },

  // Documents
  getDocuments: async (): Promise<DocItem[]>           => { await delay(); return MOCK_DOCUMENTS },
  markDocRead:  async (_id: string)                    => { await delay(200); return { success: true } },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => { await delay(); return MOCK_NOTIFICATIONS },
  markAllRead:      async ()                           => { await delay(200); return { success: true } },
}
