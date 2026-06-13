import type { MedicalRecord } from '@/types'

export const MOCK_MEDICAL: MedicalRecord[] = [
  {
    id: 'MR001', petId: 'P001', date: '2026-05-20',
    clinicName: '布恩動物醫院', doctorName: '陳明哲 醫師',
    chiefComplaint: '嘔吐、食慾不振 2 天',
    diagnosis: '急性腸胃炎',
    treatment: '補充水分，清淡飲食，給予腸胃藥',
    prescription: [
      { medicine: '美樂托寧', dosage: '10mg', frequency: '每天2次', days: 5 },
      { medicine: '益生菌', dosage: '1包', frequency: '每天1次', days: 14 },
    ],
    nextVisitDate: '2026-06-15',
    receiptUrl: '#', prescriptionUrl: '#', reportUrl: null,
  },
  {
    id: 'MR002', petId: 'P001', date: '2026-03-10',
    clinicName: '布恩動物醫院', doctorName: '陳明哲 醫師',
    chiefComplaint: '年度健康檢查',
    diagnosis: '健康，建議維持現有飲食',
    treatment: '三合一疫苗接種、心絲蟲預防藥',
    prescription: [
      { medicine: '心絲蟲預防藥', dosage: '1顆', frequency: '每月1次', days: 30 },
    ],
    nextVisitDate: '2027-03-10',
    receiptUrl: '#', prescriptionUrl: '#', reportUrl: '#',
  },
  {
    id: 'MR003', petId: 'P002', date: '2026-04-15',
    clinicName: '培安動物醫院', doctorName: '王美玲 醫師',
    chiefComplaint: '左耳搔癢、紅腫',
    diagnosis: '左耳外耳炎',
    treatment: '耳道清潔，局部用藥',
    prescription: [
      { medicine: '耳滴液', dosage: '5滴', frequency: '每天2次', days: 7 },
    ],
    nextVisitDate: null,
    receiptUrl: '#', prescriptionUrl: '#', reportUrl: null,
  },
]
