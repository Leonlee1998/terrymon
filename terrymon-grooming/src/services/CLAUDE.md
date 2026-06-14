# API 層規範

`posApi.ts`（或現有的 `api.ts`）是唯一的 Supabase 呼叫入口。
Component 不直接 import supabase client，一律透過此檔案。

## 核心函數

### `lookupMember(input)` — 掃碼查會員
- input: QR Code（`TERRYMON-{id}-{ts}`）或手機號碼
- 查 `members` + `pets`
- QR Code 用 `members.id`，手機用 `members.phone`

### `completeGroomingService(payload)` — 服務完成寫入（⭐ 最重要）
**必須按順序：**
1. INSERT `grooming_records`
2. RPC `process_service_payment`（金流 + transactions + points_log）
3. UPDATE `grooming_records.transaction_id`
4. INSERT `documents`（合約 + 收據）
5. INSERT `notifications`
6. UPDATE `appointments.status = 'completed'`（有預約時）

### `topup(memberId, plan, cardLast4)` — 現場儲值
- 呼叫 RPC `process_topup`（不可直接 UPDATE platform_balance）
- 回傳 `txId`

### `getGroomingServices()` — 取服務清單 + 定價矩陣

### `getGroomers(date?)` — 取美容師排班

### `getTodayAppointments()` — 取當日預約列表

## 定價矩陣輔助函數

```typescript
// 根據體重 + 毛長從 price_matrix JSONB 找價格
findPrice(service, weightKg, coatLength, priceType)
// priceType: 'regular_price' | 'member_price' | 'balance_price'
```
