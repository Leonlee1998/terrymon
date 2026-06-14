# Supabase 規範（webapp 視角）

## 此目錄用途

存放 webapp 相關的 Supabase migration 參考文件。
實際的 migration 在 `terrymon-supabase/` repo 集中管理。

## WebApp 使用的 Tables

```
members            → 會員主表（supabase_uid 對應 auth.users.id）
pets               → 寵物資料（member_id FK）
appointments       → 預約紀錄（member_id FK）
medical_records    → 醫療紀錄（pet_id FK）
grooming_records   → 美容紀錄（pet_id FK）
health_data        → AIoT 時序資料（pet_id FK）
iot_devices        → AIoT 裝置（pet_id FK）
orders             → 訂單（member_id FK）
order_items        → 訂單明細（order_id FK）
products           → 商品（vendor_id FK）
documents          → 文件收件匣（member_id FK）
notifications      → 通知（member_id FK）
points_log         → 點數異動（member_id FK）
```

## RLS 規則（重要）

所有 table 都有 RLS，anon key 只能查到：
- 自己的資料（`member_id = auth.uid()` 對應 members.supabase_uid）
- 公開資料（products、promotions）

永遠不繞過 RLS，也不使用 service_role key。

## 跨系統文件推送

美容/獸醫 POS 完成服務後，會寫入 `documents` table：
- `member_id`：目標會員
- `type`：`contract` / `receipt` / `prescription`
- `source_type`：`grooming` / `vet`
- `source_id`：對應的 grooming_records.id 或 medical_records.id

WebApp 透過 Supabase Realtime 監聽 `documents` 的 INSERT 事件自動顯示。
