import type {
  Member, Pet, MedicalRecord, PetGroomingRecord,
  Appointment, KioskService, QueueItem, DocItem, Product,
  Groomer, Breed, WeightRange, CoatLength, GroomingService, ServicePriceMatrix,
  ShopProduct, GroomerShift, StoreHours, GroomingRecord,
  Brand, BrandProduct, Store,
} from '@/types'

export const MOCK_MEMBER: Member = {
  id: 'M001', name: '林小華', phone: '0912-345-678',
  email: 'demo@terrymon.com', qrCode: 'TERRYMON-M001-1718000000',
  memberSince: '2023-06-01', balance: 3500, points: 280,
  tier: 'silver', pets: [],
}

export const MOCK_PETS: Pet[] = [
  {
    id: 'P001', memberId: 'M001', name: '小怪獸',
    species: 'dog', breed: '柯基犬', birthDate: '2020-03-15',
    weight: 9.2, photoUrl: 'https://placedog.net/200/200?id=10',
    allergies: ['雞肉蛋白'], chipId: 'TWN123456789',
    notes: '個性活潑，對陌生人較敏感', isActive: true,
  },
  {
    id: 'P002', memberId: 'M001', name: '咪咪',
    species: 'cat', breed: '英國短毛貓', birthDate: '2021-08-20',
    weight: 4.8, photoUrl: 'https://placekitten.com/200/200',
    allergies: [], notes: '喜歡安靜環境', isActive: true,
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

export const MOCK_PET_GROOMING_RECORDS: PetGroomingRecord[] = [
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

export const MOCK_MAIN_SERVICES: KioskService[] = [
  {
    id: 'GS001', name: '基礎洗澡', price: 800, duration: 90,
    description: '沐浴、吹乾、基本梳毛整理',
    isAddon: false, enabled: true,
  },
  {
    id: 'GS002', name: '洗澡＋剪毛', price: 1200, duration: 150,
    description: '沐浴、吹乾、全身造型剪毛',
    isAddon: false, enabled: true,
  },
  {
    id: 'GS003', name: '全套精緻造型', price: 1800, duration: 210,
    description: '沐浴、吹乾、精緻造型剪毛、飾品',
    isAddon: false, enabled: true,
  },
]

export const MOCK_ADDON_SERVICES: KioskService[] = [
  { id: 'GA001', name: '香氛深層護毛', price: 200, duration: 20,
    description: '頂級護毛精華，持久留香', isAddon: true, enabled: true },
  { id: 'GA002', name: '牙齒潔淨護理', price: 150, duration: 15,
    description: '超音波輔助潔牙', isAddon: true, enabled: true },
  { id: 'GA003', name: '耳道深層清潔', price: 100, duration: 10,
    description: '清除耳垢，預防外耳炎', isAddon: true, enabled: true },
  { id: 'GA004', name: '趾甲修剪磨圓', price: 100, duration: 10,
    description: '剪短並磨圓，防止刮傷', isAddon: true, enabled: true },
  { id: 'GA005', name: '肛門腺清潔', price: 150, duration: 10,
    description: '定期清潔維持健康', isAddon: true, enabled: true },
]

export const MOCK_QUEUE: QueueItem[] = [
  { queueNum: 'A001', petId: 'P001', memberId: 'M001',
    memberName: '林小華', status: 'in-progress', weight: 9.4,
    checkinTime: '09:15', petName: '小怪獸', petBreed: '柯基犬',
    allergies: ['雞肉蛋白'] },
  { queueNum: 'A002', petId: 'P002', memberId: 'M001',
    memberName: '林小華', status: 'waiting', weight: 4.8,
    checkinTime: '09:30', petName: '咪咪', petBreed: '英國短毛貓',
    allergies: [] },
  { queueNum: 'A003', petId: 'P003', memberId: 'M002',
    memberName: '張大明', status: 'waiting', weight: 12.5,
    checkinTime: '09:45', petName: '胖虎', petBreed: '拉不拉多',
    allergies: [] },
  { queueNum: 'A004', petId: 'P004', memberId: 'M003',
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
  { id: 'PR004', name: '益智互動玩具球', category: '玩具',
    price: 450, stock: 35,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Toy',
    description: '訓練智力，消耗精力' },
  { id: 'PR005', name: '貓抓板窩兩用', category: '配件',
    price: 890, stock: 25,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Acc',
    description: '瓦楞紙材質可更換' },
  { id: 'PR006', name: '凍乾生骨肉零食 100g', category: '食品',
    price: 260, stock: 200,
    imageUrl: 'https://placehold.co/300x300/F0F9F3/2B7A4B?text=Snack',
    description: '低溫凍乾鎖住營養' },
]

export const MOCK_WEIGHT_HISTORY = [
  { month: '1月', value: 8.8 }, { month: '2月', value: 8.9 },
  { month: '3月', value: 9.0 }, { month: '4月', value: 9.1 },
  { month: '5月', value: 9.3 }, { month: '6月', value: 9.2 },
]

export const CONTRACT_TEMPLATE = `寵物美容定型化契約書

立約當事人：
甲方（飼主）：{{memberName}}　聯絡電話：{{memberPhone}}
乙方（美容業者）：TerryMon 寵物美容

服務寵物：
寵物名稱：{{petName}}　品種：{{petBreed}}　體重：{{petWeight}} kg

服務項目：
{{serviceList}}

服務費用：新台幣 {{totalPrice}} 元整
服務日期：{{serviceDate}}

特別注意事項：
{{allergyNote}}

服務條款：
一、甲方委託乙方對寵物進行美容服務，乙方應依甲方指示及本契約規定提供服務。
二、甲方應事先告知寵物的健康狀況，包含過敏史、慢性疾病及特殊狀況。
三、乙方發現寵物有異常狀況時，有權暫停服務並立即通知甲方。
四、服務期間因寵物自身健康因素造成的意外，乙方不負賠償責任，但應立即通知甲方。
五、甲方對服務有任何疑義，應於服務完成當日提出。
六、本契約一式二份，甲乙雙方各執一份為憑。

甲方簽名：_______________　　日期：{{signDate}}`

export function lookupMember(input: string): Member | null {
  if (!input.trim()) return null
  return { ...MOCK_MEMBER, pets: MOCK_PETS }
}

export function fillContract(params: {
  memberName: string
  memberPhone: string
  petName: string
  petBreed: string
  petWeight: number
  petAllergies: string[]
  services: string[]
  totalPrice: number
}): string {
  const serviceList = params.services.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const allergyNote = params.petAllergies.length > 0
    ? `⚠️ 重要提醒：${params.petName} 對「${params.petAllergies.join('、')}」有過敏史，請使用相容產品。`
    : '無特殊過敏史紀錄。'
  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  return CONTRACT_TEMPLATE
    .replace('{{memberName}}', params.memberName)
    .replace('{{memberPhone}}', params.memberPhone)
    .replace('{{petName}}', params.petName)
    .replace('{{petBreed}}', params.petBreed)
    .replace('{{petWeight}}', String(params.petWeight))
    .replace('{{serviceList}}', serviceList)
    .replace('{{totalPrice}}', params.totalPrice.toLocaleString())
    .replace('{{serviceDate}}', today)
    .replace('{{allergyNote}}', allergyNote)
    .replace('{{signDate}}', today)
}

export const MOCK_TODAY_SCHEDULE = [
  { id: 'SCH001', time: '10:00', endTime: '11:30', petName: '小怪獸',
    memberName: '林小華', service: '全套精緻造型',
    groomer: '小美', status: 'completed' as const },
  { id: 'SCH002', time: '11:30', endTime: '13:00', petName: '咪咪',
    memberName: '林小華', service: '洗澡＋剪毛',
    groomer: '小芳', status: 'in-progress' as const },
  { id: 'SCH003', time: '14:00', endTime: '15:30', petName: '胖虎',
    memberName: '張大明', service: '基礎洗澡',
    groomer: '小美', status: 'pending' as const },
  { id: 'SCH004', time: '15:30', endTime: '17:30', petName: '雪球',
    memberName: '陳美玲', service: '全套精緻造型',
    groomer: '小芳', status: 'pending' as const },
  { id: 'SCH005', time: '17:00', endTime: '18:30', petName: '黑糖',
    memberName: '王志豪', service: '洗澡＋剪毛',
    groomer: '小美', status: 'pending' as const },
]

export const MOCK_GROOMER_NAMES = ['小美', '小芳', '阿志']

// ─────────────────────────────────────────────────────
// 以下為美容後台完整版新增 Mock 資料
// ─────────────────────────────────────────────────────

export const WEIGHT_RANGES: WeightRange[] = [
  { id: 'xs', label: 'XS（1-3 kg）',   minKg: 1,  maxKg: 3  },
  { id: 's',  label: 'S（3-6 kg）',    minKg: 3,  maxKg: 6  },
  { id: 'm',  label: 'M（6-12 kg）',   minKg: 6,  maxKg: 12 },
  { id: 'l',  label: 'L（12-25 kg）',  minKg: 12, maxKg: 25 },
  { id: 'xl', label: 'XL（25 kg+）',   minKg: 25, maxKg: 99 },
]

export const BREED_DATABASE: Breed[] = [
  { id: 'B001', name: '馬爾濟斯',       nameEn: 'Maltese',           species: 'dog', defaultCoatLength: 'long',   defaultWeightRangeId: 'xs', tags: ['容易打結'],              isCustom: false },
  { id: 'B002', name: '貴賓犬（玩具）', nameEn: 'Toy Poodle',        species: 'dog', defaultCoatLength: 'medium', defaultWeightRangeId: 'xs', tags: ['需定期修剪'],             isCustom: false },
  { id: 'B003', name: '約克夏',         nameEn: 'Yorkshire Terrier', species: 'dog', defaultCoatLength: 'long',   defaultWeightRangeId: 'xs', tags: ['長毛需護理'],             isCustom: false },
  { id: 'B004', name: '吉娃娃',         nameEn: 'Chihuahua',         species: 'dog', defaultCoatLength: 'short',  defaultWeightRangeId: 'xs', tags: [],                        isCustom: false },
  { id: 'B005', name: '博美',           nameEn: 'Pomeranian',        species: 'dog', defaultCoatLength: 'long',   defaultWeightRangeId: 'xs', tags: ['雙層毛'],                 isCustom: false },
  { id: 'B006', name: '西施',           nameEn: 'Shih Tzu',          species: 'dog', defaultCoatLength: 'long',   defaultWeightRangeId: 's',  tags: ['容易打結'],               isCustom: false },
  { id: 'B007', name: '貴賓犬（迷你）', nameEn: 'Miniature Poodle',  species: 'dog', defaultCoatLength: 'medium', defaultWeightRangeId: 's',  tags: ['需定期修剪'],             isCustom: false },
  { id: 'B008', name: '蝴蝶犬',         nameEn: 'Papillon',          species: 'dog', defaultCoatLength: 'long',   defaultWeightRangeId: 'xs', tags: [],                        isCustom: false },
  { id: 'B009', name: '比熊犬',         nameEn: 'Bichon Frise',      species: 'dog', defaultCoatLength: 'medium', defaultWeightRangeId: 's',  tags: ['毛質蓬鬆'],              isCustom: false },
  { id: 'B010', name: '臘腸犬',         nameEn: 'Dachshund',         species: 'dog', defaultCoatLength: 'short',  defaultWeightRangeId: 's',  tags: [],                        isCustom: false },
  { id: 'B011', name: '柯基犬',         nameEn: 'Corgi',             species: 'dog', defaultCoatLength: 'medium', defaultWeightRangeId: 'm',  tags: ['雙層毛'],                 isCustom: false },
  { id: 'B012', name: '雪納瑞',         nameEn: 'Schnauzer',         species: 'dog', defaultCoatLength: 'wire',   defaultWeightRangeId: 'm',  tags: ['鋼毛需手拔'],             isCustom: false },
  { id: 'B013', name: '柴犬',           nameEn: 'Shiba Inu',         species: 'dog', defaultCoatLength: 'double', defaultWeightRangeId: 'm',  tags: ['雙層毛', '換毛期大量掉毛'], isCustom: false },
  { id: 'B014', name: '法國鬥牛',       nameEn: 'French Bulldog',    species: 'dog', defaultCoatLength: 'short',  defaultWeightRangeId: 'm',  tags: ['皮膚皺摺需清潔'],         isCustom: false },
  { id: 'B015', name: '米格魯',         nameEn: 'Beagle',            species: 'dog', defaultCoatLength: 'short',  defaultWeightRangeId: 'm',  tags: [],                        isCustom: false },
  { id: 'B016', name: '標準貴賓',       nameEn: 'Standard Poodle',   species: 'dog', defaultCoatLength: 'medium', defaultWeightRangeId: 'l',  tags: ['需定期修剪'],             isCustom: false },
  { id: 'B017', name: '黃金獵犬',       nameEn: 'Golden Retriever',  species: 'dog', defaultCoatLength: 'long',   defaultWeightRangeId: 'l',  tags: ['掉毛多', '需除毛'],       isCustom: false },
  { id: 'B018', name: '拉布拉多',       nameEn: 'Labrador',          species: 'dog', defaultCoatLength: 'short',  defaultWeightRangeId: 'l',  tags: [],                        isCustom: false },
  { id: 'B019', name: '薩摩耶',         nameEn: 'Samoyed',           species: 'dog', defaultCoatLength: 'double', defaultWeightRangeId: 'xl', tags: ['雙層毛', '梳毛耗時'],     isCustom: false },
  { id: 'B020', name: '哈士奇',         nameEn: 'Siberian Husky',    species: 'dog', defaultCoatLength: 'double', defaultWeightRangeId: 'l',  tags: ['雙層毛'],                 isCustom: false },
  { id: 'B021', name: '邊境牧羊犬',     nameEn: 'Border Collie',     species: 'dog', defaultCoatLength: 'medium', defaultWeightRangeId: 'l',  tags: [],                        isCustom: false },
  { id: 'B022', name: '英國短毛貓',     nameEn: 'British Shorthair', species: 'cat', defaultCoatLength: 'short',  defaultWeightRangeId: 's',  tags: [],                        isCustom: false },
  { id: 'B023', name: '美國短毛貓',     nameEn: 'American Shorthair',species: 'cat', defaultCoatLength: 'short',  defaultWeightRangeId: 's',  tags: [],                        isCustom: false },
  { id: 'B024', name: '波斯貓',         nameEn: 'Persian',           species: 'cat', defaultCoatLength: 'long',   defaultWeightRangeId: 's',  tags: ['長毛需日常梳理'],         isCustom: false },
  { id: 'B025', name: '緬因貓',         nameEn: 'Maine Coon',        species: 'cat', defaultCoatLength: 'long',   defaultWeightRangeId: 'm',  tags: ['大型貓', '長毛'],         isCustom: false },
  { id: 'B026', name: '暹羅貓',         nameEn: 'Siamese',           species: 'cat', defaultCoatLength: 'short',  defaultWeightRangeId: 'xs', tags: [],                        isCustom: false },
  { id: 'B027', name: '布偶貓',         nameEn: 'Ragdoll',           species: 'cat', defaultCoatLength: 'long',   defaultWeightRangeId: 'm',  tags: ['溫馴', '長毛'],           isCustom: false },
  { id: 'B028', name: '蘇格蘭折耳',     nameEn: 'Scottish Fold',     species: 'cat', defaultCoatLength: 'short',  defaultWeightRangeId: 's',  tags: ['耳道需注意'],             isCustom: false },
  { id: 'B029', name: '混種犬',         nameEn: 'Mixed Dog',         species: 'dog', defaultCoatLength: 'medium', defaultWeightRangeId: 'm',  tags: [],                        isCustom: false },
  { id: 'B030', name: '混種貓',         nameEn: 'Mixed Cat',         species: 'cat', defaultCoatLength: 'short',  defaultWeightRangeId: 'xs', tags: [],                        isCustom: false },
]

export const MOCK_GROOMERS: Groomer[] = [
  { id: '11111111-1111-1111-1111-111111111101', storeId: '11111111-1111-1111-1111-111111111111', name: 'Mika', rank: 'director',
    specialties: ['貴賓', '比熊', '長毛犬'], maxDailySlots: 5, isActive: true, joinedAt: '2020-01-01' },
  { id: '11111111-1111-1111-1111-111111111102', storeId: '11111111-1111-1111-1111-111111111111', name: 'Leo', rank: 'senior',
    specialties: ['大型犬', '雙層毛'], maxDailySlots: 5, isActive: true, joinedAt: '2021-06-01' },
  { id: '3c9a303c-966d-4e0c-bd33-a28502d61c89', storeId: '11111111-1111-1111-1111-111111111111', name: '測試美容師', rank: 'stylist',
    specialties: ['洗澡', '基礎護理'], maxDailySlots: 6, isActive: true, joinedAt: '2023-03-01' },
]

export const MOCK_SERVICES: GroomingService[] = [
  {
    id: 'SV001', storeId: '11111111-1111-1111-1111-111111111111', name: '基礎洗澡', category: 'main',
    description: '沐浴、吹乾、基本梳毛整理',
    applicableSpecies: ['dog', 'cat'], isEnabled: true, sortOrder: 1,
    priceMatrix: [
      { weightRangeId: 'xs', coatLength: 'short',  regularPrice: 600,  memberPrice: 560,  balancePrice: 520,  durationMin: 60  },
      { weightRangeId: 'xs', coatLength: 'long',   regularPrice: 750,  memberPrice: 700,  balancePrice: 660,  durationMin: 90  },
      { weightRangeId: 's',  coatLength: 'short',  regularPrice: 750,  memberPrice: 700,  balancePrice: 650,  durationMin: 75  },
      { weightRangeId: 's',  coatLength: 'long',   regularPrice: 900,  memberPrice: 850,  balancePrice: 800,  durationMin: 100 },
      { weightRangeId: 'm',  coatLength: 'short',  regularPrice: 950,  memberPrice: 900,  balancePrice: 850,  durationMin: 90  },
      { weightRangeId: 'm',  coatLength: 'medium', regularPrice: 1100, memberPrice: 1050, balancePrice: 990,  durationMin: 120 },
      { weightRangeId: 'm',  coatLength: 'double', regularPrice: 1300, memberPrice: 1200, balancePrice: 1150, durationMin: 150 },
      { weightRangeId: 'l',  coatLength: 'short',  regularPrice: 1400, memberPrice: 1300, balancePrice: 1250, durationMin: 120 },
      { weightRangeId: 'l',  coatLength: 'long',   regularPrice: 1800, memberPrice: 1700, balancePrice: 1600, durationMin: 180 },
      { weightRangeId: 'xl', coatLength: 'short',  regularPrice: 2000, memberPrice: 1850, balancePrice: 1750, durationMin: 150 },
      { weightRangeId: 'xl', coatLength: 'double', regularPrice: 2800, memberPrice: 2600, balancePrice: 2400, durationMin: 240 },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: 'SV002', storeId: '11111111-1111-1111-1111-111111111111', name: '洗澡＋剪毛', category: 'main',
    description: '沐浴、吹乾、全身造型修剪',
    applicableSpecies: ['dog', 'cat'], isEnabled: true, sortOrder: 2,
    priceMatrix: [
      { weightRangeId: 'xs', coatLength: 'short',  regularPrice: 900,  memberPrice: 850,  balancePrice: 800,  durationMin: 90  },
      { weightRangeId: 'xs', coatLength: 'long',   regularPrice: 1100, memberPrice: 1000, balancePrice: 950,  durationMin: 120 },
      { weightRangeId: 's',  coatLength: 'short',  regularPrice: 1100, memberPrice: 1050, balancePrice: 980,  durationMin: 100 },
      { weightRangeId: 's',  coatLength: 'long',   regularPrice: 1400, memberPrice: 1300, balancePrice: 1200, durationMin: 150 },
      { weightRangeId: 'm',  coatLength: 'short',  regularPrice: 1500, memberPrice: 1400, balancePrice: 1300, durationMin: 130 },
      { weightRangeId: 'm',  coatLength: 'medium', regularPrice: 1800, memberPrice: 1700, balancePrice: 1600, durationMin: 180 },
      { weightRangeId: 'm',  coatLength: 'double', regularPrice: 2200, memberPrice: 2000, balancePrice: 1900, durationMin: 210 },
      { weightRangeId: 'l',  coatLength: 'short',  regularPrice: 2200, memberPrice: 2000, balancePrice: 1900, durationMin: 180 },
      { weightRangeId: 'l',  coatLength: 'long',   regularPrice: 2800, memberPrice: 2600, balancePrice: 2400, durationMin: 240 },
      { weightRangeId: 'xl', coatLength: 'short',  regularPrice: 3200, memberPrice: 2900, balancePrice: 2700, durationMin: 240 },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: 'SV003', storeId: '11111111-1111-1111-1111-111111111111', name: '全套精緻造型', category: 'main',
    description: '沐浴、吹乾、精緻造型修剪、造型飾品',
    applicableSpecies: ['dog'], isEnabled: true, sortOrder: 3,
    priceMatrix: [
      { weightRangeId: 'xs', coatLength: 'long',   regularPrice: 1500, memberPrice: 1400, balancePrice: 1300, durationMin: 180 },
      { weightRangeId: 's',  coatLength: 'long',   regularPrice: 1800, memberPrice: 1700, balancePrice: 1600, durationMin: 210 },
      { weightRangeId: 'm',  coatLength: 'medium', regularPrice: 2200, memberPrice: 2000, balancePrice: 1900, durationMin: 240 },
      { weightRangeId: 'l',  coatLength: 'long',   regularPrice: 3200, memberPrice: 3000, balancePrice: 2800, durationMin: 300 },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: 'SV101', storeId: '11111111-1111-1111-1111-111111111111', name: '香氛護毛', category: 'addon',
    description: '深層護毛精華，持久留香',
    applicableSpecies: ['dog', 'cat'], isEnabled: true, sortOrder: 1,
    priceMatrix: [
      { weightRangeId: 'xs', coatLength: 'short', regularPrice: 200, memberPrice: 180, balancePrice: 170, durationMin: 20 },
      { weightRangeId: 's',  coatLength: 'short', regularPrice: 200, memberPrice: 180, balancePrice: 170, durationMin: 20 },
      { weightRangeId: 'm',  coatLength: 'short', regularPrice: 250, memberPrice: 230, balancePrice: 210, durationMin: 25 },
      { weightRangeId: 'l',  coatLength: 'short', regularPrice: 300, memberPrice: 280, balancePrice: 260, durationMin: 30 },
      { weightRangeId: 'xl', coatLength: 'short', regularPrice: 350, memberPrice: 320, balancePrice: 300, durationMin: 35 },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: 'SV102', storeId: '11111111-1111-1111-1111-111111111111', name: '耳道深層清潔', category: 'addon',
    description: '清除耳垢，預防外耳炎',
    applicableSpecies: ['dog', 'cat'], isEnabled: true, sortOrder: 2,
    priceMatrix: [
      { weightRangeId: 'xs', coatLength: 'short', regularPrice: 100, memberPrice: 90,  balancePrice: 85,  durationMin: 10 },
      { weightRangeId: 's',  coatLength: 'short', regularPrice: 100, memberPrice: 90,  balancePrice: 85,  durationMin: 10 },
      { weightRangeId: 'm',  coatLength: 'short', regularPrice: 120, memberPrice: 110, balancePrice: 100, durationMin: 12 },
      { weightRangeId: 'l',  coatLength: 'short', regularPrice: 150, memberPrice: 130, balancePrice: 120, durationMin: 15 },
      { weightRangeId: 'xl', coatLength: 'short', regularPrice: 150, memberPrice: 130, balancePrice: 120, durationMin: 15 },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: 'SV201', storeId: '11111111-1111-1111-1111-111111111111', name: '精緻全護套組', category: 'package',
    description: '洗澡剪毛 + 香氛護毛 + 耳道清潔，套組九折',
    applicableSpecies: ['dog', 'cat'], isEnabled: true, sortOrder: 1,
    packageMainServiceId: 'SV002',
    packageAddonIds: ['SV101', 'SV102'],
    packageDiscountPct: 10,
    priceMatrix: [],
    createdAt: '2024-01-01',
  },
]

export const MOCK_SHOP_PRODUCTS: ShopProduct[] = [
  { id: 'SP001', storeId: '11111111-1111-1111-1111-111111111111', name: '香氛沐浴乳 250ml', category: '清潔', price: 280, memberPrice: 250, stock: 30, isActive: true },
  { id: 'SP002', storeId: '11111111-1111-1111-1111-111111111111', name: '護毛精華素 100ml', category: '護理', price: 380, memberPrice: 350, stock: 15, isActive: true },
  { id: 'SP003', storeId: '11111111-1111-1111-1111-111111111111', name: '藍莓潔耳液 120ml', category: '清潔', price: 180, memberPrice: 160, stock: 20, isActive: true },
  { id: 'SP004', storeId: '11111111-1111-1111-1111-111111111111', name: '造型噴霧 200ml',   category: '造型', price: 240, memberPrice: 220, stock: 12, isActive: true },
  { id: 'SP005', storeId: '11111111-1111-1111-1111-111111111111', name: '天然除蚤噴劑 300ml', category: '保健', price: 320, memberPrice: 290, stock: 8,  isActive: true },
]

const _todayDate = new Date().toISOString().split('T')[0]

export const MOCK_SHIFTS: GroomerShift[] = [
  { id: 'SH001', groomerId: 'G001', date: _todayDate, shiftType: 'full',    startTime: '10:00', endTime: '18:00', maxSlots: 4 },
  { id: 'SH002', groomerId: 'G002', date: _todayDate, shiftType: 'full',    startTime: '09:00', endTime: '18:00', maxSlots: 5 },
  { id: 'SH003', groomerId: 'G003', date: _todayDate, shiftType: 'morning', startTime: '09:00', endTime: '13:00', maxSlots: 3 },
  { id: 'SH004', groomerId: 'G004', date: _todayDate, shiftType: 'off' },
]

export const MOCK_STORE_HOURS: StoreHours[] = [
  { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '18:00', lastBookingTime: '17:00' },
  { dayOfWeek: 1, isOpen: true,  openTime: '10:00', closeTime: '19:00', lastBookingTime: '18:00' },
  { dayOfWeek: 2, isOpen: true,  openTime: '10:00', closeTime: '19:00', lastBookingTime: '18:00' },
  { dayOfWeek: 3, isOpen: true,  openTime: '10:00', closeTime: '19:00', lastBookingTime: '18:00' },
  { dayOfWeek: 4, isOpen: true,  openTime: '10:00', closeTime: '19:00', lastBookingTime: '18:00' },
  { dayOfWeek: 5, isOpen: true,  openTime: '10:00', closeTime: '19:00', lastBookingTime: '18:00' },
  { dayOfWeek: 6, isOpen: true,  openTime: '10:00', closeTime: '18:00', lastBookingTime: '17:00' },
]

export const MOCK_GROOMING_RECORDS: GroomingRecord[] = [
  {
    id: 'GR001', memberId: 'M001', memberName: '林小華',
    petId: 'P001', petName: '小怪獸', petBreed: '柯基犬', petWeight: 9.2,
    groomerId: 'G001', groomerName: '王美玲', storeId: '11111111-1111-1111-1111-111111111111',
    date: _todayDate, startTime: '10:00', endTime: '12:30',
    services: ['洗澡＋剪毛', '香氛護毛'],
    totalPrice: 1980, paymentMethod: 'balance', balanceUsed: 1980, cardAmount: 0,
    status: 'completed', contractUrl: '#', receiptUrl: '#',
    cctv: [
      {
        id: 'CCTV001', recordId: 'GR001', cameraName: '美容台 A',
        startTime: '10:05', endTime: '12:25', status: 'completed',
        vodUrl: '#', thumbnailUrl: 'https://placehold.co/320x180/1a1d1a/ffffff?text=美容台A',
        durationMin: 140, shareToken: 'tok_abc123', shareExpiry: '2026-06-20T23:59:00',
      },
    ],
    notes: '客人要求留耳毛',
    createdAt: `${_todayDate}T10:00:00`,
  },
  {
    id: 'GR002', memberId: 'M002', memberName: '張大明',
    petId: 'P003', petName: '胖虎', petBreed: '拉布拉多', petWeight: 32.5,
    groomerId: 'G002', groomerName: '陳小芳', storeId: '11111111-1111-1111-1111-111111111111',
    date: _todayDate, startTime: '11:30',
    services: ['基礎洗澡'],
    totalPrice: 2000, paymentMethod: 'card', balanceUsed: 0, cardAmount: 2000,
    status: 'in-progress', cctv: [
      {
        id: 'CCTV002', recordId: 'GR002', cameraName: '美容台 B',
        startTime: '11:35', status: 'recording',
        streamUrl: 'https://placehold.co/640x360/1a1d1a/ffffff?text=LIVE',
      },
    ],
    notes: '',
    createdAt: `${_todayDate}T11:30:00`,
  },
]

export const GROOMER_RANK_CONFIG = {
  director: { label: '領域長',    color: '#F59E0B', bg: '#FEF3C7', icon: '👑' },
  senior:   { label: '首席美容師', color: '#6B7280', bg: '#F3F4F6', icon: '⭐' },
  stylist:  { label: '美容師',    color: '#2B7A4B', bg: '#F0F9F3', icon: '✂️' },
}

export const SHIFT_CONFIG = {
  full:      { label: '全天', color: 'bg-primary-bg text-primary' },
  morning:   { label: '上午', color: 'bg-blue-50 text-blue-700' },
  afternoon: { label: '下午', color: 'bg-purple-50 text-purple-700' },
  off:       { label: '休假', color: 'bg-gray-100 text-gray-500' },
}

export function lookupServicePrice(
  service: GroomingService,
  weightKg: number,
  coatLength: CoatLength,
): ServicePriceMatrix | undefined {
  const range = WEIGHT_RANGES.find(r => weightKg >= r.minKg && weightKg < r.maxKg)
    ?? WEIGHT_RANGES[WEIGHT_RANGES.length - 1]
  return (
    service.priceMatrix.find(m => m.weightRangeId === range.id && m.coatLength === coatLength)
    ?? service.priceMatrix.find(m => m.weightRangeId === range.id)
  )
}

export const SCANNABLE_MEMBER = {
  id: 'M001',
  name: '林小華',
  phone: '0912-345-678',
  qrPrefix: 'TERRYMON-M001',
}

// ── Stage 4：品牌商品 & POS 庫存 Mock ─────────────────
export const MOCK_BRANDS: Brand[] = [
  { id: 'BR001', name: '毛孩自然坊', status: 'active', contactName: '王品樺', contactPhone: '04-2211-3344', contactEmail: 'brand1@example.com', createdAt: '2025-01-10' },
  { id: 'BR002', name: 'PetFresh 鮮食工坊', status: 'active', contactName: '李育成', contactPhone: '02-8765-4321', contactEmail: 'brand2@example.com', createdAt: '2025-03-01' },
  { id: 'BR003', name: '犬貓醫研社', status: 'suspended', contactName: '張惠玲', contactPhone: '03-9988-7766', createdAt: '2025-06-01' },
]

export const MOCK_BRAND_PRODUCTS: BrandProduct[] = [
  { id: 'BP001', brandId: 'BR001', name: '植物酵素沐浴乳 500ml', category: '清潔', suggestedPrice: 320, costPrice: 150, isActive: true, createdAt: '2025-01-15' },
  { id: 'BP002', brandId: 'BR001', name: '護毛精華噴霧 200ml',   category: '護理', suggestedPrice: 280, costPrice: 120, isActive: true, createdAt: '2025-01-15' },
  { id: 'BP003', brandId: 'BR001', name: '益生菌保健粉 30包',   category: '保健', suggestedPrice: 580, costPrice: 260, isActive: true, createdAt: '2025-02-01' },
  { id: 'BP004', brandId: 'BR002', name: '鮮食主食罐 雞肉 180g', category: '食品', suggestedPrice: 95,  costPrice: 45,  isActive: true, createdAt: '2025-03-10' },
  { id: 'BP005', brandId: 'BR002', name: '凍乾零食 鮭魚 50g',   category: '食品', suggestedPrice: 260, costPrice: 110, isActive: true, createdAt: '2025-03-10' },
  { id: 'BP006', brandId: 'BR002', name: '關節保健膠囊 60顆',   category: '保健', suggestedPrice: 680, costPrice: 300, isActive: true, createdAt: '2025-04-01' },
]

export const MOCK_STORES: Store[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'TerryMon 寵物美容旗艦店',   type: 'grooming', address: '台北市信義區松仁路 88 號',       isActive: true },
  { id: '33333333-3333-3333-3333-333333333333', name: 'TerryMon 寵物美容中山加盟店', type: 'grooming', address: '台北市中山區林森北路 200 號',     isActive: true },
  { id: '44444444-4444-4444-4444-444444444444', name: 'TerryMon 寵物美容新竹直營店', type: 'grooming', address: '新竹市東區光復路二段 101 號', isActive: true },
]

export const SHOP_INFO = {
  name: 'TerryMon 寵物美容',
  groomer: '美容師管理後台',
}
