@AGENTS.md

# terrymon-shop-admin — 商城商家入駐後台

## 專案定位

讓第三方商家管理商城的後台系統。
商家在這裡上架商品，消費者在 WebApp 商城購買（可用點數折抵）。
與 WebApp 共用同一個 Supabase，存取 vendors、products、orders 相關資料。

**帳號身份：** 商家登入用 Supabase Auth，身份對應 `vendors` table（不是 `members` table）。

## 技術棧

- Next.js 16 App Router + TypeScript + React 19
- Tailwind CSS v4（主題設定在 `src/app/globals.css` 的 `@theme inline` 區塊）
- shadcn/ui + @base-ui/react（UI 元件）
- Zustand v5 + persist（vendorStore）
- React Hook Form v7 + Zod v4 + @hookform/resolvers v5（表單）
- Supabase（資料庫 + Realtime 庫存監聽）
- recharts（銷售圖表）
- sonner（toast）、lucide-react（icons）

## Supabase 連線

```
NEXT_PUBLIC_SUPABASE_URL=https://lugakfqhugqciwlskunt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...（見 .env.local）
SUPABASE_SERVICE_ROLE_KEY=...（向負責人取得，⚠️ 絕不進 git）
```

## Supabase Client 分工

```
src/lib/supabase/
  client.ts         ← Browser Component 用（createBrowserClient，anon key）
  server.ts         ← Server 用：
                       createSupabaseClient()  → anon key + 商家 session
                       createAdminClient()     → service_role（推送通知用）
src/lib/supabase.ts ← 舊版（getSupabase()），vendorApi.ts fallback 用
```

## 已存在的 Supabase Tables

```
vendors        — 商家帳號（supabase_uid FK → auth.users）⭐
products       — 商品（vendor_id FK）
orders         — 訂單（member_id FK）
order_items    — 訂單明細（vendor_id FK）
promotions     — 行銷活動（vendor_id FK）
notifications  — 寫入（出貨後推送給買家）
```

⚠️ `vendors` table 若不存在，執行以下 migration：

```sql
create table vendors (
  id               uuid primary key default uuid_generate_v4(),
  supabase_uid     uuid unique references auth.users(id),
  store_name       text not null,
  owner_name       text not null,
  email            text unique not null,
  phone            text,
  logo_url         text,
  description      text,
  tax_id           text,
  bank_account     text,
  status           text not null default 'pending'
                   check (status in ('pending','approved','suspended')),
  commission_rate  numeric(4,2) not null default 5.0,
  created_at       timestamptz not null default now()
);
alter table vendors enable row level security;
create policy "vendors_own" on vendors
  for all using (auth.uid() = supabase_uid);
```

## 最重要的串接規則

### 1. 商家身份確認（所有操作的前提）

```typescript
const { data: { user } } = await supabase.auth.getUser()
const { data: vendor } = await supabase
  .from('vendors')
  .select('*')
  .eq('supabase_uid', user.id)
  .single()

if (!vendor) → redirect '/login?error=unauthorized'
if (vendor.status !== 'approved') → redirect '/pending'

// vendor.id 就是這個商家的 UUID，存入 vendorStore
```

### 2. 商品 CRUD（必須帶 vendor_id）

```typescript
// 查詢：.eq('vendor_id', vendor.id)
// 新增：{ vendor_id: vendor.id, ...formData }
// 更新：.eq('id', productId).eq('vendor_id', vendor.id)  ← 雙重保障
```

### 3. 訂單查詢（透過 order_items 關聯）

```typescript
await supabase.from('orders')
  .select('*, order_items!inner(*, product:products(name, image_url))')
  .eq('order_items.vendor_id', vendor.id)
```

### 4. 出貨更新 + 推送通知

```typescript
// 更新 orders.status = 'shipped' + tracking_number
// 再 INSERT notifications（給買家的 member_id）
// ⚠️ 推送通知需用 createAdminClient() 或 Server Action
```

### 5. 庫存 Realtime 監聽

```typescript
// 買家下單後 WebApp 會扣庫存，商家後台即時更新
supabase.channel('stock-updates')
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public',
    table: 'products',
    filter: `vendor_id=eq.${vendor.id}`,
  }, (payload) => {
    vendorStore.updateProductStock(payload.new.id, payload.new.stock)
    if (payload.new.stock <= 5) toast.warning(`庫存剩 ${payload.new.stock} 件`)
  })
  .subscribe()
```

### 6. 報表計算

```typescript
// 從 order_items 計算，不要用預存 summary 欄位
await supabase.from('order_items')
  .select('price, qty, orders(status, created_at)')
  .eq('vendor_id', vendorId)
  .in('orders.status', ['shipped', 'delivered'])
// 在前端加總
```

## Auth Guard（layout.tsx）

`(vendor)/layout.tsx` 必須確認三件事：
1. `isLoggedIn`（vendorStore）
2. `vendor` 存在（vendors table 有記錄）
3. `vendor.status === 'approved'`（不是 pending 或 suspended）

未通過 → 分別 redirect `/login` 或 `/pending`

## 資料夾結構

```
src/
├── app/
│   ├── login/          # 商家登入
│   ├── register/       # 申請入駐
│   ├── pending/        # 審核中頁面
│   └── (vendor)/       # 需要登入 + approved 的頁面
│       ├── layout.tsx  # auth guard（三重確認）
│       ├── dashboard/
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/
│       │   └── [id]/
│       ├── orders/
│       ├── promotions/
│       ├── reports/
│       └── settings/
├── components/
│   └── vendor/         # VendorSidebar 等後台元件
├── lib/
│   ├── supabase/       # client.ts + server.ts
│   └── utils.ts
├── services/
│   └── vendorApi.ts    # 所有商家 API 呼叫
├── stores/
│   └── vendorStore.ts  # vendor + products + isLoggedIn
└── types/
    └── index.ts
```

## 絕對不可以做的事

- 查詢 `members` table（無權存取飼主個資；訂單顯示用 orders 內快照欄位）
- 修改 products 不帶 `vendor_id` 過濾（RLS 會擋，但程式碼也要保障）
- `status !== 'approved'` 的商家進入後台
- promotions 新增/更新不帶 `vendor_id`
- 在 Client Component 使用 `createAdminClient()`

## 絕對規則

1. 元件最多 150 行，超過就拆檔
2. 顏色只用 Tailwind class，不寫 inline style
3. Server Component 預設，需要互動才加 `'use client'`
4. 每個頁面在 375px 寬度必須正常操作
5. 不可以有 console error
6. 未完成功能用 `toast.info()` 提示，不留死按鈕
7. 表單：`defaultValues` 設預設值，數字欄位用 `valueAsNumber`
