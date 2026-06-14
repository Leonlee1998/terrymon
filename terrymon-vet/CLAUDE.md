@AGENTS.md

# terrymon-vet — 獸醫院 POS + 醫師介面

## 專案定位

TerryMon 獸醫院的雙介面系統，是醫療資料的「寫入端」：
- `/kiosk` — 前台 Kiosk（飼主掛號、體重量測、候診等待、取件結帳）
- `/doctor` — 醫師介面（候診看板 Kanban、看診表單、用藥開立）

MVP 階段用 Supabase 自建 `medical_records`。
NxVet API 橋接留到後期：欄位 `nxvet_record_id`、`nxvet_synced_at` 先設為 null。

## 技術棧

- Next.js 16 App Router + TypeScript + React 19
- Tailwind CSS v4（主題設定在 `src/app/globals.css` 的 `@theme inline` 區塊）
- shadcn/ui + @base-ui/react（UI 元件）
- Zustand v5（kioskStore + queueStore）
- React Hook Form v7 + Zod v4 + @hookform/resolvers v5（表單）
- Supabase（資料庫 + Realtime 候診監聽）
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
members            — 查詢（掛號後查找會員）
pets               — 查詢（寵物資料 + 過敏史）
appointments       — 讀寫（掛號新增 / 看診完成後更新）
medical_records    — 寫入（看診完成後新增）⭐
health_data        — 寫入（體重量測後新增）⭐
iot_devices        — 讀取（飼主 AIoT 裝置狀態）
documents          — 寫入（藥單/收據推送給飼主 App）⭐
notifications      — 寫入（看診完成推播）⭐
transactions       — 寫入（診療費用，由 RPC 處理）
points_log         — 寫入（點數累積，由 RPC 處理）
```

## 候診隊列架構（重要）

**候診隊列不存 Supabase，存在 queueStore（Zustand 記憶體）。**

原因：
- 隊列狀態變化頻繁（叫號/看診/完成），不需持久化
- POS 重開機後從 `appointments` table 重建

來源：飼主 Kiosk 掛號 → INSERT `appointments`（`status: 'checked_in'`）
→ 醫師介面 Realtime 訂閱收到 → 加入 queueStore

```typescript
// /doctor/page.tsx 的 Realtime 訂閱
const channel = supabase
  .channel('queue-updates')
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'appointments',
    filter: `store_id=eq.${STORE_ID}&status=eq.checked_in`,
  }, (payload) => {
    if (payload.eventType === 'INSERT') queueStore.addToWaiting(payload.new)
    if (payload.eventType === 'UPDATE') queueStore.updateStatus(payload.new.id, payload.new.status)
  })
  .subscribe()
```

## 最重要的串接規則

### 1. 掛號流程（三步必須都寫）

```
Step 1: INSERT appointments（status: 'checked_in'，source: 'kiosk'）
Step 2: INSERT health_data（metric: 'weight'，今日體重）
Step 3: UPDATE pets.weight（最新體重）
```

### 2. 看診完成寫入順序（不能亂）

```
Step 1: INSERT medical_records（nxvet_record_id: null）
Step 2: RPC process_service_payment（金流 + transactions + points_log）
Step 3: UPDATE appointments.status = 'completed'
Step 4: INSERT documents（藥單 + 收據）
Step 5: INSERT notifications（看診完成）
Step 6: INSERT notifications（回診提醒，若有 follow_up_date）
```

### 3. 過敏史顯示規則

⚠️ 過敏史是最重要的安全資訊，**以下位置都必須顯示，不可省略**：
- Kiosk `/kiosk/pet`（大紅色 alert bar）
- 候診看板 `WaitingColumn`（紅色 badge）
- `InProgressColumn`（大紅框 + ⚠️）
- `ConsultationForm` 的 `PatientPanel`（醒目顯示）

## NxVet 橋接（未來）

```typescript
// 只需修改這一個函數，其他 component 不動
async function syncFromNxVet(nxvetRecordId: string) {
  await supabase.from('medical_records').upsert({
    nxvet_record_id: nxvetRecordId,
    nxvet_synced_at: new Date().toISOString(),
    // ... 從 NxVet API 取得的欄位
  }, { onConflict: 'nxvet_record_id' })
}
```

## UI 規範

**Doctor Header（左上角）：**
```
[PawPrint icon] 預約怪獸  |  [Stethoscope icon] {CLINIC_INFO.name}・{CLINIC_INFO.doctor}
```

## 資料夾結構

```
src/
├── app/
│   ├── kiosk/          # 待機/掃碼/選寵物/體重/候診/取件
│   └── doctor/         # 登入/候診看板/看診作業
├── components/
│   ├── kiosk/
│   └── doctor/         # DoctorHeader, WaitingColumn, InProgressColumn,
│                         DoneColumn, ConsultationForm, PatientPanel
├── lib/
│   ├── supabase/       # client.ts + server.ts
│   ├── mock/           # MVP Mock（逐步替換）
│   └── utils.ts
├── services/
│   └── posApi.ts       # lookupMember, checkin, completeConsultation
├── stores/
│   ├── kioskStore.ts   # Kiosk 流程狀態（member, pet, weight, queueNum）
│   └── queueStore.ts   # 候診隊列（waiting[], inProgress, done[]）← 記憶體，不存 DB
└── types/
    └── index.ts
```

## 絕對不可以做的事

- 把候診隊列存入 Supabase
- 看診完成只寫 medical_records，不寫 documents + notifications
- 更新 pets.weight 但不同時寫 health_data（失去歷史體重）
- 看診完成後不更新 appointments.status
- 直接修改 platform_balance，必須呼叫 process_service_payment RPC
- 在 Client Component 使用 createAdminClient()

## 絕對規則

1. 元件最多 150 行，超過就拆檔
2. 顏色只用 Tailwind class，不寫 inline style
3. Server Component 預設，需要互動才加 `'use client'`
4. 每個頁面在 375px 寬度必須正常操作
5. 不可以有 console error
6. 未完成功能用 `toast.info()` 提示，不留死按鈕
7. Store 不可直接呼叫 supabase，API 呼叫一律在 posApi.ts
8. 表單：`defaultValues` 設預設值，數字欄位用 `valueAsNumber`
