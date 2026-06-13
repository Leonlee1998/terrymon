import type {
  Member, Pet, MedicalRecord, GroomingRecord,
  Appointment, GroomingService, QueueItem, DocItem, Product
} from '@/types'

export const MOCK_MEMBER: Member = {
  id: 'M001', name: '林小華', phone: '0912-345-678',
  email: 'demo@terrymon.com', qrCode: 'TERRYMON-M001-1718000000',
  memberSince: '2023-06-01', balance: 3500, points: 280, pets: [],
}

export const MOCK_PETS: Pet[] = [
  {
    id: 'P001', memberId: 'M001', name: '小怪獸',
    species: 'dog', breed: '柯基犬', birthDate: '2020-03-15',
    weight: 9.2, photoUrl: 'https://placedog.net/300/300?id=10',
    allergies: ['雞肉蛋白'], notes: '個性活潑，對陌生人較敏感',
  },
  {
    id: 'P002', memberId: 'M001', name: '咪咪',
    species: 'cat', breed: '英國短毛貓', birthDate: '2021-08-20',
    weight: 4.8, photoUrl: 'https://placekitten.com/300/300',
    allergies: [], notes: '喜歡安靜環境',
  },
]

export const MOCK_MEDICAL: MedicalRecord[] = [
  {
    id: 'MR001', petId: 'P001', date: '2026-05-20',
    clinicName: '布恩動物醫院', doctorName: '陳明哲 醫師',
    diagnosis: '急性腸胃炎',
    prescription: [
      { medicine: '美樂托寧', dosage: '10mg', frequency: '每天2次', days: 5 },
      { medicine: '益生菌', dosage: '1包', frequency: '每天1次', days: 14 },
    ],
    nextVisitDate: '2026-06-15', receiptUrl: '#', prescriptionUrl: '#',
  },
  {
    id: 'MR002', petId: 'P001', date: '2026-03-10',
    clinicName: '布恩動物醫院', doctorName: '陳明哲 醫師',
    diagnosis: '年度健康檢查、三合一疫苗',
    prescription: [], nextVisitDate: '2027-03-10',
    receiptUrl: '#', prescriptionUrl: null,
  },
  {
    id: 'MR003', petId: 'P002', date: '2026-04-15',
    clinicName: '培安動物醫院', doctorName: '王美玲 醫師',
    diagnosis: '左耳外耳炎',
    prescription: [
      { medicine: '耳滴液', dosage: '5滴', frequency: '每天2次', days: 7 },
    ],
    nextVisitDate: null, receiptUrl: '#', prescriptionUrl: '#',
  },
]

export const MOCK_GROOMING_RECORDS: GroomingRecord[] = [
  {
    id: 'GR001', petId: 'P001', date: '2026-06-01',
    shopName: 'Furchic 寵物美容',
    services: ['全套造型', '香氛護毛', '趾甲磨圓'],
    price: 1900, contractUrl: '#', notes: '保留耳毛',
  },
  {
    id: 'GR002', petId: 'P001', date: '2026-04-05',
    shopName: 'Furchic 寵物美容',
    services: ['洗澡＋剪毛', '耳道清潔'],
    price: 1100, contractUrl: '#', notes: '',
  },
]

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT001', memberId: 'M001', petId: 'P001',
    type: 'vet', date: '2026-06-15', time: '10:30',
    location: '布恩動物醫院', status: 'confirmed', notes: '回診追蹤',
  },
  {
    id: 'APT002', memberId: 'M001', petId: 'P001',
    type: 'grooming', date: '2026-06-20', time: '14:00',
    location: 'Furchic 寵物美容', status: 'pending', notes: '',
  },
  {
    id: 'APT003', memberId: 'M001', petId: 'P002',
    type: 'vet', date: '2026-04-15', time: '09:00',
    location: '培安動物醫院', status: 'completed', notes: '',
  },
]

export const MOCK_MAIN_SERVICES: GroomingService[] = [
  { id: 'GS001', name: '基礎洗澡', price: 800, duration: 90,
    description: '沐浴、吹乾、基本梳毛', isAddon: false, enabled: true },
  { id: 'GS002', name: '洗澡＋剪毛', price: 1200, duration: 150,
    description: '沐浴、吹乾、全身剪毛', isAddon: false, enabled: true },
  { id: 'GS003', name: '全套造型', price: 1800, duration: 210,
    description: '沐浴、吹乾、造型剪毛', isAddon: false, enabled: true },
]

export const MOCK_ADDON_SERVICES: GroomingService[] = [
  { id: 'GA001', name: '香氛護毛', price: 200, duration: 20,
    description: '深層護毛精華', isAddon: true, enabled: true },
  { id: 'GA002', name: '牙齒潔淨', price: 150, duration: 15,
    description: '超音波潔牙', isAddon: true, enabled: true },
  { id: 'GA003', name: '耳道清潔', price: 100, duration: 10,
    description: '清除耳垢', isAddon: true, enabled: true },
  { id: 'GA004', name: '趾甲磨圓', price: 100, duration: 10,
    description: '剪甲磨圓', isAddon: true, enabled: true },
  { id: 'GA005', name: '肛門腺清潔', price: 150, duration: 10,
    description: '定期清潔', isAddon: true, enabled: true },
]

export const MOCK_QUEUE: QueueItem[] = [
  { queueNum: 'A002', petId: 'P001', memberId: 'M001',
    memberName: '林小華', status: 'in-progress', weight: 9.4,
    checkinTime: '09:15', petName: '小怪獸', petBreed: '柯基犬',
    allergies: ['雞肉蛋白'] },
  { queueNum: 'A003', petId: 'P002', memberId: 'M001',
    memberName: '林小華', status: 'waiting', weight: 4.8,
    checkinTime: '09:30', petName: '咪咪', petBreed: '英國短毛貓',
    allergies: [] },
  { queueNum: 'A004', petId: 'P003', memberId: 'M002',
    memberName: '張大明', status: 'waiting', weight: 12.5,
    checkinTime: '09:45', petName: '胖虎', petBreed: '拉不拉多',
    allergies: [] },
  { queueNum: 'A005', petId: 'P004', memberId: 'M003',
    memberName: '陳美玲', status: 'waiting', weight: 3.1,
    checkinTime: '10:00', petName: '雪球', petBreed: '波斯貓',
    allergies: ['牛肉'] },
]

export const MOCK_DOCUMENTS: DocItem[] = [
  { id: 'D001', memberId: 'M001', type: 'prescription', petId: 'P001',
    title: '小怪獸｜藥單 2026-05-20', url: '#', createdAt: '2026-05-20T10:30:00' },
  { id: 'D002', memberId: 'M001', type: 'receipt', petId: 'P001',
    title: '小怪獸｜診療收據 2026-05-20', url: '#', createdAt: '2026-05-20T10:32:00' },
  { id: 'D003', memberId: 'M001', type: 'contract', petId: 'P001',
    title: '小怪獸｜美容合約 2026-06-01', url: '#', createdAt: '2026-06-01T14:00:00' },
]

export const MOCK_PRODUCTS: Product[] = [
  { id: 'PR001', name: '主食鮮食罐－雞肉', category: '食品',
    price: 89, stock: 120,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Food',
    description: '天然食材，無防腐劑' },
  { id: 'PR002', name: '關節保健膠囊 60顆', category: '保健',
    price: 680, stock: 45,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Health',
    description: '葡萄糖胺配方' },
  { id: 'PR003', name: '寵物除臭沐浴乳 500ml', category: '清潔',
    price: 320, stock: 80,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Bath',
    description: '天然植物萃取' },
]

export const MOCK_WEIGHT_HISTORY = [
  { month: '1月', value: 8.8 }, { month: '2月', value: 8.9 },
  { month: '3月', value: 9.0 }, { month: '4月', value: 9.1 },
  { month: '5月', value: 9.3 }, { month: '6月', value: 9.2 },
]

export const COMMON_MEDICINES = [
  { name: '美樂托寧', defaultDose: '10mg', defaultFreq: '每天2次' },
  { name: '阿莫西林', defaultDose: '10mg/kg', defaultFreq: '每天2次' },
  { name: '益生菌', defaultDose: '1包', defaultFreq: '每天1次' },
  { name: '耳滴液', defaultDose: '5滴', defaultFreq: '每天2次' },
  { name: '消炎止痛藥', defaultDose: '5mg/kg', defaultFreq: '每天1次' },
  { name: '胃藥', defaultDose: '1顆', defaultFreq: '飯前30分鐘' },
]

export const COMMON_DIAGNOSES = [
  '急性腸胃炎', '外耳炎', '皮膚炎', '上呼吸道感染',
  '年度健康檢查', '疫苗接種', '關節炎', '牙結石',
  '過敏反應', '泌尿道感染',
]

export const MOCK_DONE_TODAY: QueueItem[] = [
  {
    queueNum: 'A001', petId: 'P010', memberId: 'M010',
    memberName: '高志明', status: 'done', weight: 5.2,
    checkinTime: '08:30', petName: '橘子', petBreed: '橘貓', allergies: [],
  },
]

export const CLINIC_INFO = {
  name: '布恩動物醫院',
  doctor: '陳明哲 醫師',
  phone: '04-2234-5678',
}
