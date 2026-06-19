import type { Appointment } from '@/types'

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT001', memberId: 'M001', petId: 'P001',
    storeId: '22222222-2222-2222-2222-222222222222', storeName: '布恩動物醫院',
    type: 'vet', source: 'webapp', status: 'confirmed',
    scheduledDate: '2026-06-15', scheduledTime: '10:30:00', endTime: '11:00:00',
    addonServiceIds: [], notes: '回診，追蹤腸胃狀況',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'APT002', memberId: 'M001', petId: 'P001',
    storeId: '11111111-1111-1111-1111-111111111111', storeName: 'TerryMon 寵物美容旗艦店',
    type: 'grooming', source: 'webapp', status: 'pending',
    scheduledDate: '2026-06-20', scheduledTime: '14:00:00',
    mainServiceName: '全身美容', addonServiceIds: [],
    estimatedPrice: 1200, depositAmount: 360,
    notes: '', createdAt: '2026-06-05T10:00:00Z',
  },
  {
    id: 'APT003', memberId: 'M001', petId: 'P002',
    storeId: '22222222-2222-2222-2222-222222222222', storeName: '培安動物醫院',
    type: 'vet', source: 'webapp', status: 'completed',
    scheduledDate: '2026-04-15', scheduledTime: '09:00:00',
    addonServiceIds: [], notes: '外耳炎複診',
    createdAt: '2026-04-10T08:00:00Z',
  },
  {
    id: 'APT004', memberId: 'M001', petId: 'P002',
    storeId: '11111111-1111-1111-1111-111111111111', storeName: 'TerryMon 寵物美容旗艦店',
    type: 'grooming', source: 'webapp', status: 'cancelled',
    scheduledDate: '2026-03-10', scheduledTime: '13:00:00',
    addonServiceIds: [], notes: '',
    createdAt: '2026-03-05T09:00:00Z',
  },
]
