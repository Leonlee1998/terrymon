@AGENTS.md

# terrymon-webapp — 客戶端 WebApp

## 專案定位

TerryMon 預約怪獸的客戶端 App，供寵物飼主使用。
功能：會員登入、寵物管理、美容/看診預約、商城購物、AIoT 健康監控、文件收件匣。

## 技術棧

- Next.js 16 App Router + TypeScript + React 19
- Tailwind CSS v4（主題設定在 `src/app/globals.css` 的 `@theme inline` 區塊）
- shadcn/ui + @base-ui/react（UI 元件）
- Zustand v5 + persist（client state only）
- React Hook Form v7 + Zod v4 + @hookform/resolvers v5（表單）
- **Auth：Supabase Auth（不用 Firebase）**
- DB Client：@supabase/ssr（browser client + server client 分開）
- recharts（圖表）、qrcode.react（QR 碼）
- sonner（toast）、lucide-react（icons）

## Supabase 連線

```
NEXT_PUBLIC_SUPABASE_URL=https://lugakfqhugqciwlskunt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...（見 .env.local）
```

**絕對不可以：**
- 把 `service_role key` 放進任何前端程式碼或 `.env.local`
- 在前端直接呼叫需要 service_role 的 API
- 繞過 RLS（Row Level Security）

## 已存在的 Supabase Tables

```
appointments       — 預約紀錄（美容/看診）
documents          — 文件收件匣（藥單/合約/收據）
groomers           — 美容師資料
grooming_records   — 美容服務紀錄
grooming_services  — 美容服務項目與定價矩陣
health_data        — AIoT 健康數據時序
iot_devices        — AIoT 裝置資料
medical_records    — 醫療紀錄（NxVet 同步）
members            — 會員主表 ⭐ 所有系統的核心
notifications      — 推播通知
order_items        — 訂單明細
orders             — 商城訂單
pets               — 寵物資料（掛在 member 下）
points_log         — 點數異動紀錄
products           — 商城商品
promotions         — 行銷活動
```

## 最重要的串接規則

### 會員識別（整個系統的核心）

```typescript
// ✅ 正確：所有資料查詢都必須帶 member_id
const { data: pets } = await supabase
  .from('pets')
  .select('*')
  .eq('member_id', member.id)  // ← 一定要過濾

// ❌ 錯誤：不帶 member_id 會讀到別人的資料
const { data: pets } = await supabase.from('pets').select('*')
```

### member.id 的來源

```typescript
// 登入後從 Supabase Auth 取得 user，再查 members table 得到 member.id
const { data: { user } } = await supabase.auth.getUser()

const { data: member } = await supabase
  .from('members')
  .select('*, pets(*)')
  .eq('supabase_uid', user.id)   // ← 用 supabase_uid 對應 auth.users.id
  .single()

// member.id 就是整個系統通用的 memberId（UUID）
// 存入 authStore，之後所有查詢都用這個
```

### 跨系統文件推送（美容/獸醫 POS → WebApp 收件匣）

```typescript
// 美容/獸醫 POS 完成服務後寫 documents table，WebApp 透過 Realtime 自動出現
// 欄位：member_id, type, title, url, pet_id, source_type, source_id
```

## Supabase Client

```
src/lib/supabase/
  client.ts   ← Browser Component 用（createBrowserClient）
  server.ts   ← Server Component 用（createServerClient，async）
src/lib/supabase.ts   ← 舊版，api.ts 仍在使用（getSupabase()）
```

**新程式碼優先使用 `src/lib/supabase/client.ts` 或 `server.ts`，不要新增 service_role key 邏輯。**

## Auth 流程

```
用戶輸入 email/password
  → supabase.auth.signInWithPassword()
  → 取得 session（自動存在 cookie）
  → 查 members table（supabase_uid = auth.users.id）
  → 存入 authStore（Zustand + persist）
  → 跳轉首頁

登出：
  → supabase.auth.signOut()
  → authStore.logout()
  → router.push('/login')
```

## API 規則

```typescript
// ✅ 正確：透過 api.ts
import { api } from '@/services/api'
const pets = await api.getPets()

// ❌ 錯誤：不要在 component 直接 import supabase
import { supabase } from '@/lib/supabase/client'
```

## 資料夾結構

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/layout.tsx   # 已登入的主 layout（帶 BottomNav/SideNav）
│   └── login/              # 登入頁
├── components/
│   ├── ui/                 # shadcn 元件（不要手動修改）
│   ├── layout/             # AppLayout, BottomNav, SideNav
│   ├── home/               # 首頁元件
│   ├── pets/               # 寵物頁元件
│   ├── shop/               # 商城元件
│   ├── appointments/       # 預約元件
│   └── member/             # 會員中心元件
├── lib/
│   ├── supabase/           # client.ts + server.ts（@supabase/ssr）
│   ├── mock/               # MVP Mock Data（逐步替換）
│   └── utils.ts            # cn(), formatPrice(), formatDate()
├── services/
│   └── api.ts              # 所有 API 呼叫集中在這裡
├── stores/
│   ├── authStore.ts        # 會員登入狀態（含 member.id）
│   ├── cartStore.ts        # 購物車
│   └── notificationStore.ts
└── types/
    └── index.ts            # 所有 TypeScript 型別
```

## 品牌色系（不可用其他顏色）

```
primary:      #2B7A4B   （主綠）
primary-hover:#1F5C38
primary-light:#4CAF73
primary-bg:   #F0F9F3
accent:       #FF6B35   （橘）
accent-light: #FFF0EB
ink:          #1A1D1A
slate-t:      #5C6B5E
border-t:     #D8E4DC
surface:      #F8FBF8
```

## 點數與儲值的顯示規則

```
member.platform_balance  → 顯示為「儲值餘額」（美容用）
member.points            → 顯示為「回饋點數」（商城折抵用，1點=1元）
member.tier              → basic / silver / gold（影響 UI badge）
```

## Realtime 訂閱（通知用）

```typescript
const channel = supabase
  .channel('member-notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `member_id=eq.${member.id}`,
  }, (payload) => {
    notificationStore.addNotification(payload.new)
  })
  .subscribe()

return () => { supabase.removeChannel(channel) }
```

## 絕對規則

1. 元件最多 150 行，超過就拆檔
2. 顏色只用 Tailwind class，不寫 inline style
3. Server Component 預設，需要互動才加 `'use client'`
4. 每個頁面在 375px 寬度必須正常操作
5. 不可以有 console error
6. 未完成功能用 `toast.info()` 提示，不留死按鈕
7. 表單：`defaultValues` 設預設值，數字欄位用 `valueAsNumber`，不用 `z.coerce` 或 `.default()`
8. 所有 component 透過 `api.ts` 取資料，不直接 import supabase client

## .env.local（不進 git，.env* 已在 .gitignore）

```
NEXT_PUBLIC_SUPABASE_URL=https://lugakfqhugqciwlskunt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（見 .env.local）
# ⚠️ 不可加 SUPABASE_SERVICE_ROLE_KEY，前端不使用 service role
```
