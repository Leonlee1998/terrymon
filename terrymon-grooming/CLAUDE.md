@AGENTS.md

# terrymon-grooming — 美容院 POS + 商家後台

## 專案定位

TerryMon 美容院的雙介面系統，是資料的「寫入端」：
- `/kiosk` — 前台 Kiosk（飼主自助報到、儲值、購物）
- `/admin` — 商家管理後台（服務管理、排班、紀錄、設定）

服務完成後寫入 Supabase，資料會即時同步到飼主的 WebApp。

## 技術棧

- Next.js 16 App Router + TypeScript + React 19
- Tailwind CSS v4（主題設定在 `src/app/globals.css` 的 `@theme inline` 區塊）
- shadcn/ui + @base-ui/react（UI 元件）
- Zustand v5（kioskStore 流程狀態）
- React Hook Form v7 + Zod v4 + @hookform/resolvers v5（表單）
- Supabase（資料庫 + Realtime）
- react-signature-canvas（電子簽名）
- html2canvas + jspdf（合約 PDF）
- sonner（toast）、lucide-react（icons）

## Supabase 連線

```
NEXT_PUBLIC_SUPABASE_URL=https://lugakfqhugqciwlskunt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...（見 .env.local）
SUPABASE_SERVICE_ROLE_KEY=...（向負責人取得，⚠️ 絕不進 git）
NEXT_PUBLIC_STORE_ID=...
```

## Supabase Client 分工

```
src/lib/supabase/
  client.ts         ← Browser Component 用（createBrowserClient，anon key）
  server.ts         ← Server 用：
                       createSupabaseClient()  → anon key，遵守 RLS
                       createAdminClient()     → service_role，POS 寫入用
src/lib/supabase.ts ← 舊版（getSupabase()），posApi.ts fallback 用
```

**`createAdminClient()` 只能在 Server Action 或 Route Handler 中使用，絕不在 Client Component。**

## 已存在的 Supabase Tables（此系統使用）

```
members            — 查詢（POS 掃碼找會員）
pets               — 查詢（顯示飼主的寵物）
appointments       — 讀寫（確認預約 / walk-in 新增）
grooming_records   — 寫入（服務完成後新增）⭐
grooming_services  — 讀取（服務項目與定價矩陣）
groomers           — 讀寫（排班管理）
documents          — 寫入（合約/收據推送給飼主 App）⭐
notifications      — 寫入（服務完成推播）⭐
transactions       — 寫入（所有金流紀錄，由 RPC 處理）⭐
points_log         — 寫入（點數累積/扣除，由 RPC 處理）
```

## 最重要的串接規則

### 1. 掃碼查詢會員

```typescript
async function lookupMember(input: string) {
  // QR Code: "TERRYMON-{memberId}-{timestamp}"
  if (input.startsWith('TERRYMON-')) {
    const memberId = input.split('-')[1]
    const { data } = await supabase
      .from('members')
      .select('*, pets(*)')
      .eq('id', memberId)        // ⚠️ 用 members.id，不是 supabase_uid
      .single()
    return data
  }
  // 手機號碼
  const { data } = await supabase
    .from('members')
    .select('*, pets(*)')
    .eq('phone', input.replace(/[-\s]/g, ''))
    .single()
  return data
}
```

### 2. 服務完成寫入順序（不能亂）

```typescript
// Step 1: 寫 grooming_records
// Step 2: 呼叫 process_service_payment RPC（處理金流 + transactions + points_log）
// Step 3: 更新 grooming_records.transaction_id
// Step 4: 寫 documents（合約 + 收據）
// Step 5: 寫 notifications
// Step 6: 若有預約，更新 appointments.status = 'completed'
```

見 `src/services/posApi.ts` 的 `completeGroomingService()` 函數。

### 3. 儲值必須呼叫 RPC

```typescript
// ❌ 不可以直接 UPDATE members SET platform_balance = ...
// ✅ 必須呼叫 SQL function
const { data: txId } = await supabase.rpc('process_topup', {
  p_member_id:      memberId,
  p_store_id:       storeId,
  p_amount:         selectedPlan.amount,
  p_payment_method: 'card',
  p_card_last4:     '1234',
})
```

### 4. 定價矩陣查詢

```typescript
// grooming_services.price_matrix 是 JSONB 欄位
// 格式：[{ weight_range_id, coat_length, regular_price, member_price, balance_price, duration_min }]
const range = WEIGHT_RANGES.find(r => weightKg >= r.minKg && weightKg < r.maxKg)
const price = service.price_matrix.find(
  m => m.weight_range_id === range?.id && m.coat_length === coatLength
)?.[priceType] ?? null
```

## Admin Auth

```typescript
// 美容師帳號在 groomers table，不是 members table
const { data: { user } } = await supabase.auth.getUser()
const { data: groomer } = await supabase
  .from('groomers')
  .select('*')
  .eq('supabase_uid', user.id)  // groomers 需有 supabase_uid 欄位
  .single()
// groomer 不存在 → 拒絕進入後台
```

## 離線支援規範

POS 機在網路不穩環境下，所有寫入操作都要 try/catch + toast 提示：

```typescript
try {
  return await operation()
} catch (error) {
  toast.warning('網路不穩，請稍後重試或聯絡店員')
  throw error
}
```

## 資料夾結構

```
src/
├── app/
│   ├── kiosk/          # 前台 Kiosk
│   └── admin/          # 商家後台
├── components/
│   ├── kiosk/          # Kiosk 專用元件
│   └── admin/          # 後台專用元件
├── lib/
│   ├── supabase/       # client.ts + server.ts
│   ├── mock/           # MVP Mock（逐步替換）
│   └── utils.ts
├── services/
│   └── posApi.ts       # 所有 POS API（lookupMember, completeService, topup）
├── stores/
│   └── kioskStore.ts   # Kiosk 流程狀態
└── types/
    └── index.ts
```

## 絕對不可以做的事

- `UPDATE members SET platform_balance = ...` → 必須呼叫 `process_topup` RPC
- `UPDATE members SET points = ...` → 必須呼叫 `process_service_payment` RPC
- 把 signatureData（Base64 PNG）直接存 DB → 先上傳 Supabase Storage，存 URL
- 服務完成後只寫 grooming_records → 還要寫 documents 和 notifications
- 在 Client Component 使用 `createAdminClient()` → 只能在 Server Action / Route Handler

## 絕對規則

1. 元件最多 150 行，超過就拆檔
2. 顏色只用 Tailwind class，不寫 inline style
3. Server Component 預設，需要互動才加 `'use client'`
4. 每個頁面在 375px 寬度必須正常操作
5. 不可以有 console error
6. 未完成功能用 `toast.info()` 提示，不留死按鈕
7. 離線時 graceful fallback（toast 提示，不卡死）
8. 表單：`defaultValues` 設預設值，數字欄位用 `valueAsNumber`
