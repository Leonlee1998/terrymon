import type { Appointment } from '@/types'

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT001', memberId: 'M001', petId: 'P001',
    type: 'vet', date: '2026-06-15', time: '10:30', endTime: '11:00',
    location: '布恩動物醫院', address: '台中市北區崇德路一段 10 號',
    status: 'confirmed', notes: '回診，追蹤腸胃狀況', reminderSent: false,
  },
  {
    id: 'APT002', memberId: 'M001', petId: 'P001',
    type: 'grooming', date: '2026-06-20', time: '14:00', endTime: '16:30',
    location: 'Furchic 寵物美容', address: '台中市西區精誠路 88 號',
    status: 'pending', notes: '', reminderSent: false,
  },
  {
    id: 'APT003', memberId: 'M001', petId: 'P002',
    type: 'vet', date: '2026-04-15', time: '09:00',
    location: '培安動物醫院', address: '台中市南區復興路三段 1 號',
    status: 'completed', notes: '外耳炎複診', reminderSent: true,
  },
  {
    id: 'APT004', memberId: 'M001', petId: 'P002',
    type: 'grooming', date: '2026-03-10', time: '13:00',
    location: 'Furchic 寵物美容', address: '台中市西區精誠路 88 號',
    status: 'cancelled', notes: '', reminderSent: false,
  },
]
