# 00-MASTER.md
# TerryMon 預約怪獸 — 所有 Repo 共用基礎設定
# ⚠️ 每次開新對話必須先貼這份，再貼對應的任務文件

---

## 專案概述

三個獨立 Next.js repo + 一個後端 repo：
- `terrymon-webapp`     → 客戶端 WebApp
- `terrymon-grooming`  → 美容院 POS
- `terrymon-vet`       → 獸醫院 POS
- `terrymon-api`       → 後端 API（後續階段）

---

## 絕對規則

```
1. 元件最多 150 行，超過就拆檔
2. 顏色只用 Tailwind class，不寫 inline style
3. 所有資料從 lib/mock/ 引入，不在元件內 hardcode
4. 每個頁面在 375px 寬度必須正常操作
5. 不可以有 console error
6. 未完成功能一律用 toast 提示，不留死按鈕
7. Server Component 預設，需要互動才加 'use client'
```

---

## 技術棧（所有 repo 統一）

```
Framework:   Next.js 14 App Router + TypeScript
Styling:     Tailwind CSS v3
UI:          shadcn/ui（按需 add，不整包裝）
State:       Zustand（client state only）
Forms:       React Hook Form + Zod
Charts:      Recharts
QR Code:     qrcode.react
Signature:   react-signature-canvas
Toast:       sonner
Icons:       lucide-react
Auth:        Firebase Authentication
Deploy:      Render
```

---

## 初始化指令（每個 repo 執行一次）

```bash
npx create-next-app@latest {repo-name} \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*"

cd {repo-name}

npm install zustand react-hook-form zod @hookform/resolvers \
  sonner recharts lucide-react \
  firebase

npx shadcn@latest init
# 選項：style=default, baseColor=slate, cssVariables=yes

# 按需安裝 shadcn 元件（各 repo 自行選需要的）
npx shadcn@latest add button card badge dialog tabs \
  input textarea sheet dropdown-menu separator skeleton
```

---
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F28C00', // 主品牌橘
          hover: '#FFAA33',   // hover
          active: '#D97706',  // active
          light: '#FFD08A',   // 淺橘
          bg: '#FFF6E8',      // 淡橘背景
        },

        accent: {
          DEFAULT: '#00B8D9', // LINE / 諮詢按鈕
          hover: '#00A2C0',
          light: '#E8FAFD',
        },

        ink: '#111111',       // 主文字
        'slate-t': '#4A4A4A', // 次文字
        'border-t': '#E5E5E5',// 邊框
        surface: '#FFFFFF',   // 卡片
        background: '#FAFAFA',

        success: '#16A34A',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#00B8D9',
      },

      fontFamily: {
        sans: ['Noto Sans TC', 'Inter', 'sans-serif'],
      },

      boxShadow: {
        sm: '0 2px 8px rgba(0,0,0,0.06)',
        md: '0 6px 20px rgba(0,0,0,0.08)',
        lg: '0 12px 30px rgba(0,0,0,0.12)',
      },

      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

## tailwind.config.ts（所有 repo 統一貼上）
<button className="bg-primary hover:bg-primary-hover text-white">
  預約諮詢
</button>

<button className="bg-accent hover:bg-accent-hover text-white">
  LINE 獸醫諮詢
</button>

<div className="bg-surface border border-border-t rounded-lg shadow-sm">
  卡片內容
</div>

<section className="bg-primary-bg">
  Hero 區塊
</section>

<h1 className="text-ink">
  標題
</h1>

<p className="text-slate-t">
  內文
</p>

---

## src/app/layout.tsx（根 layout，所有 repo 統一）

```tsx
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'TerryMon 預約怪獸',
  description: '每一位毛孩的健康燈塔',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-surface text-ink antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
```

---

## 共用型別（src/types/index.ts）

每個 repo 建立相同檔案：

```typescript
export type Species = 'dog' | 'cat' | 'other'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type DocumentType = 'prescription' | 'receipt' | 'contract'
export type QueueStatus = 'waiting' | 'in-progress' | 'done'
export type ServiceType = 'vet' | 'grooming' | 'other'

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
```

---

## 共用 Mock Data（src/lib/mock/index.ts）

每個 repo 建立相同檔案：

```typescript
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

export const CONTRACT_TEMPLATE = `寵物美容定型化契約書

立約當事人：
甲方（飼主）：{{memberName}}　聯絡電話：{{memberPhone}}
乙方（美容業者）：TerryMon 美容院

服務寵物：
寵物名稱：{{petName}}　品種：{{petBreed}}　體重：{{petWeight}} kg

服務項目：
{{serviceList}}

服務費用：新台幣 {{totalPrice}} 元整
服務日期：{{serviceDate}}

注意事項：
一、甲方委託乙方對寵物進行美容服務。
二、甲方應事先告知寵物健康狀況，包含過敏史及特殊狀況。
三、乙方發現寵物異常時，有權暫停服務並通知甲方。
四、服務期間因寵物自身健康因素造成的意外，乙方不負賠償責任。
五、甲方疑義應於服務完成當日提出。

甲方簽名：________________________　日期：{{signDate}}`
```

---

## 資料夾結構（所有 repo 統一）

```
src/
├── app/                  # Next.js App Router pages
├── components/
│   ├── ui/               # shadcn 元件（自動生成）
│   └── shared/           # 自訂共用元件
├── lib/
│   ├── mock/             # index.ts — 所有 mock data
│   └── utils.ts          # cn() 等工具函數
├── stores/               # Zustand stores（client only）
└── types/                # index.ts — 所有 TypeScript interfaces
```

---

## 部署設定（Render）

```
Build Command:    npm run build
Start Command:    npm start
Node Version:     18
Output Directory: .next

Environment Variables:
  NEXT_PUBLIC_APP_URL=https://{repo-name}.onrender.com
```

`public/_redirects` 不需要（Next.js 自己處理路由）。
