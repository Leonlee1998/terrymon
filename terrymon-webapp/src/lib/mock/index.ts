import type {
  Member,
  Pet,
  MedicalRecord,
  GroomingRecord,
  Appointment,
  GroomingService,
  QueueItem,
  DocItem,
  Product,
} from '@/types'

export const MOCK_MEMBER: Member = {
  id: 'M001',
  name: '王小明',
  phone: '0912-345-678',
  email: 'demo@terrymon.com',
  qrCode: 'TERRYMON-M001-1718000000',
  memberSince: '2023-06-01',
  balance: 3500,
  points: 280,
  pets: [],
}

export const MOCK_PETS: Pet[] = [
  {
    id: 'P001',
    memberId: 'M001',
    name: '球球',
    species: 'dog',
    breed: '柴犬',
    birthDate: '2020-03-15',
    weight: 9.2,
    photoUrl: 'https://placedog.net/300/300?id=10',
    allergies: ['雞肉'],
    notes: '容易緊張，美容時需要安撫。',
  },
  {
    id: 'P002',
    memberId: 'M001',
    name: '咪咪',
    species: 'cat',
    breed: '米克斯',
    birthDate: '2021-08-20',
    weight: 4.8,
    photoUrl: 'https://placekitten.com/300/300',
    allergies: [],
    notes: '不喜歡吹風機。',
  },
]

export const MOCK_MEDICAL: MedicalRecord[] = [
  {
    id: 'MR001',
    petId: 'P001',
    date: '2026-05-20',
    clinicName: 'TerryMon 動物醫院',
    doctorName: '陳醫師',
    diagnosis: '皮膚過敏',
    prescription: [
      { medicine: '抗組織胺', dosage: '10mg', frequency: '每日2次', days: 5 },
      { medicine: '益生菌', dosage: '1包', frequency: '每日1次', days: 14 },
    ],
    nextVisitDate: '2026-06-15',
    receiptUrl: '#',
    prescriptionUrl: '#',
  },
  {
    id: 'MR002',
    petId: 'P001',
    date: '2026-03-10',
    clinicName: 'TerryMon 動物醫院',
    doctorName: '陳醫師',
    diagnosis: '年度健康檢查與疫苗',
    prescription: [],
    nextVisitDate: '2027-03-10',
    receiptUrl: '#',
    prescriptionUrl: null,
  },
  {
    id: 'MR003',
    petId: 'P002',
    date: '2026-04-15',
    clinicName: '貓咪動物醫院',
    doctorName: '林醫師',
    diagnosis: '腸胃不適',
    prescription: [
      { medicine: '胃藥', dosage: '5mg', frequency: '每日2次', days: 7 },
    ],
    nextVisitDate: null,
    receiptUrl: '#',
    prescriptionUrl: '#',
  },
]

export const MOCK_GROOMING_RECORDS: GroomingRecord[] = [
  {
    id: 'GR001',
    petId: 'P001',
    date: '2026-06-01',
    shopName: 'Furchic 寵物美容',
    services: ['全套美容', '耳朵清潔', '指甲修剪'],
    price: 1900,
    contractUrl: '#',
    notes: '表現穩定。',
  },
  {
    id: 'GR002',
    petId: 'P001',
    date: '2026-04-05',
    shopName: 'Furchic 寵物美容',
    services: ['洗澡', '除蚤'],
    price: 1100,
    contractUrl: '#',
    notes: '',
  },
]

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT001',
    memberId: 'M001',
    petId: 'P001',
    type: 'vet',
    date: '2026-06-15',
    time: '10:30',
    location: 'TerryMon 動物醫院',
    status: 'confirmed',
    notes: '皮膚回診',
  },
  {
    id: 'APT002',
    memberId: 'M001',
    petId: 'P001',
    type: 'grooming',
    date: '2026-06-20',
    time: '14:00',
    location: 'Furchic 寵物美容',
    status: 'pending',
    notes: '',
  },
  {
    id: 'APT003',
    memberId: 'M001',
    petId: 'P002',
    type: 'vet',
    date: '2026-04-15',
    time: '09:00',
    location: '貓咪動物醫院',
    status: 'completed',
    notes: '',
  },
]

export const MOCK_MAIN_SERVICES: GroomingService[] = [
  {
    id: 'GS001',
    name: '基礎洗澡',
    price: 800,
    duration: 90,
    description: '洗澡、吹乾、基礎清潔。',
    isAddon: false,
    enabled: true,
  },
  {
    id: 'GS002',
    name: '洗澡加修剪',
    price: 1200,
    duration: 150,
    description: '洗澡、吹乾、局部修剪。',
    isAddon: false,
    enabled: true,
  },
  {
    id: 'GS003',
    name: '全套美容',
    price: 1800,
    duration: 210,
    description: '完整美容與造型修剪。',
    isAddon: false,
    enabled: true,
  },
]

export const MOCK_ADDON_SERVICES: GroomingService[] = [
  {
    id: 'GA001',
    name: '耳朵清潔',
    price: 200,
    duration: 20,
    description: '清潔耳道與外耳。',
    isAddon: true,
    enabled: true,
  },
  {
    id: 'GA002',
    name: '牙齒清潔',
    price: 150,
    duration: 15,
    description: '基礎口腔清潔。',
    isAddon: true,
    enabled: true,
  },
  {
    id: 'GA003',
    name: '除蚤',
    price: 100,
    duration: 10,
    description: '除蚤清潔處理。',
    isAddon: true,
    enabled: true,
  },
  {
    id: 'GA004',
    name: '指甲修剪',
    price: 100,
    duration: 10,
    description: '修剪指甲。',
    isAddon: true,
    enabled: true,
  },
  {
    id: 'GA005',
    name: '腳底毛修剪',
    price: 150,
    duration: 10,
    description: '腳底毛整理。',
    isAddon: true,
    enabled: true,
  },
]

export const MOCK_QUEUE: QueueItem[] = [
  {
    queueNum: 'A001',
    petId: 'P001',
    memberId: 'M001',
    memberName: '王小明',
    status: 'in-progress',
    weight: 9.4,
    checkinTime: '09:15',
    petName: '球球',
    petBreed: '柴犬',
    allergies: ['雞肉'],
  },
  {
    queueNum: 'A002',
    petId: 'P002',
    memberId: 'M001',
    memberName: '王小明',
    status: 'waiting',
    weight: 4.8,
    checkinTime: '09:30',
    petName: '咪咪',
    petBreed: '米克斯',
    allergies: [],
  },
  {
    queueNum: 'A003',
    petId: 'P003',
    memberId: 'M002',
    memberName: '張小姐',
    status: 'waiting',
    weight: 12.5,
    checkinTime: '09:45',
    petName: 'Lucky',
    petBreed: '黃金獵犬',
    allergies: [],
  },
  {
    queueNum: 'A004',
    petId: 'P004',
    memberId: 'M003',
    memberName: '李先生',
    status: 'waiting',
    weight: 3.1,
    checkinTime: '10:00',
    petName: '豆豆',
    petBreed: '英短',
    allergies: ['海鮮'],
  },
]

export const MOCK_DOCUMENTS: DocItem[] = [
  {
    id: 'D001',
    memberId: 'M001',
    type: 'prescription',
    petId: 'P001',
    title: '球球處方箋 2026-05-20',
    url: '#',
    createdAt: '2026-05-20T10:30:00',
  },
  {
    id: 'D002',
    memberId: 'M001',
    type: 'receipt',
    petId: 'P001',
    title: '球球醫療收據 2026-05-20',
    url: '#',
    createdAt: '2026-05-20T10:32:00',
  },
  {
    id: 'D003',
    memberId: 'M001',
    type: 'contract',
    petId: 'P001',
    title: '球球美容合約 2026-06-01',
    url: '#',
    createdAt: '2026-06-01T14:00:00',
  },
]

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'PR001',
    name: '寵物鮮食主餐',
    category: '食品',
    price: 89,
    stock: 120,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Food',
    description: '營養均衡的日常主食。',
  },
  {
    id: 'PR002',
    name: '保健膠囊 60顆',
    category: '保健品',
    price: 680,
    stock: 45,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Health',
    description: '日常健康維持。',
  },
  {
    id: 'PR003',
    name: '寵物溫和洗毛精 500ml',
    category: '清潔',
    price: 320,
    stock: 80,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Bath',
    description: '溫和清潔毛髮。',
  },
  {
    id: 'PR004',
    name: '互動益智玩具',
    category: '玩具',
    price: 450,
    stock: 35,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Toy',
    description: '消耗精力與訓練專注。',
  },
  {
    id: 'PR005',
    name: '外出胸背帶',
    category: '配件',
    price: 890,
    stock: 25,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Acc',
    description: '穩固舒適的外出配件。',
  },
  {
    id: 'PR006',
    name: '凍乾雞肉零食 100g',
    category: '食品',
    price: 260,
    stock: 200,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Snack',
    description: '高蛋白訓練點心。',
  },
]

export const MOCK_WEIGHT_HISTORY = [
  { month: '1月', value: 8.8 },
  { month: '2月', value: 8.9 },
  { month: '3月', value: 9.0 },
  { month: '4月', value: 9.1 },
  { month: '5月', value: 9.3 },
  { month: '6月', value: 9.2 },
]

export const COMMON_MEDICINES = [
  { name: '抗組織胺', defaultDose: '10mg', defaultFreq: '每日2次' },
  { name: '抗生素', defaultDose: '10mg/kg', defaultFreq: '每日2次' },
  { name: '益生菌', defaultDose: '1包', defaultFreq: '每日1次' },
  { name: '胃藥', defaultDose: '5mg', defaultFreq: '每日2次' },
  { name: '止痛藥', defaultDose: '5mg/kg', defaultFreq: '每日1次' },
  { name: '外用藥膏', defaultDose: '1次', defaultFreq: '飯後30分鐘' },
]

export const COMMON_DIAGNOSES = [
  '皮膚過敏',
  '腸胃不適',
  '耳朵感染',
  '牙結石',
  '年度健康檢查',
  '疫苗施打',
  '眼睛發炎',
  '關節保健',
  '體重控制',
  '寄生蟲預防',
]

export const CONTRACT_TEMPLATE = `寵物美容服務合約

會員資料
飼主姓名：{{memberName}}
聯絡電話：{{memberPhone}}
寵物姓名：{{petName}}
寵物品種：{{petBreed}}
寵物體重：{{petWeight}} kg

服務項目：
{{serviceList}}

總金額：{{totalPrice}} 元
服務日期：{{serviceDate}}

飼主簽名：_______________________
簽署日期：{{signDate}}`
