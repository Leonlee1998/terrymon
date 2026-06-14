# TerryMon Supabase — 共用後端

## 專案定位

四個前端 repo（webapp、grooming、vet、shop-admin）共用的 Supabase 後端。
唯一的 schema 來源：所有 table 定義、RLS、函數、trigger 都在 `migrations/` 裡。

```
Project URL:  https://lugakfqhugqciwlskunt.supabase.co
Project Ref:  lugakfqhugqciwlskunt
```

## 目錄結構

```
supabase/
  migrations/         → 資料庫 Schema（按序執行）
  functions/          → Edge Functions（Deno，部署到 Supabase）
  local-sqlite/       → 本地開發資料（.gitignore）
```

## ⚠️ 所有 Tables 都已存在於 001（不要重複建立）

`001_initial_schema.sql` 已包含全部 table + functions + triggers + storage：

```
members            groomers           grooming_services
pets               appointments       transactions
stores             grooming_records   medical_records
store_settings     vendors            products
                   orders             order_items
                   promotions         points_log
                   documents          notifications
                   iot_devices        health_data
```

**⚠️ 不需要建立「尚缺的 table」——stores、store_settings、vendors、transactions 全在 001。**

## SQL Functions（已在 001 存在）

```sql
process_topup(p_member_id, p_store_id, p_amount, p_payment_method, p_card_last4)
  → 儲值 + 贈送邏輯 + 寫 transactions，回傳 transaction_id

process_service_payment(p_member_id, p_store_id, p_total_amount, p_balance_to_use, p_card_amount, p_ref_type, p_ref_id)
  → 服務結帳 + 扣餘額 + 累積點數 + 寫 transactions，回傳 transaction_id

process_order_payment(p_member_id, p_order_id, p_total_amount, p_points_to_use, p_card_amount)
  → 商城付款 + 點數折抵 + 寫 transactions，回傳 transaction_id
```

確認函數存在：
```sql
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_name like 'process_%';
```

## Migration 現況

```
001_initial_schema.sql       ← 完整 schema（全部 tables + functions + triggers + storage）
002                          ← 未使用（tables 已併入 001）
003_webapp_rls_policies.sql  ← WebApp 的額外 RLS（insert/update）
004_seed_demo_data.sql       ← Demo 店家資料（store IDs 固定）
005+                         ← 未來新 migration
```

## Store IDs（固定，與各前端 .env.local 對應）

```
11111111-1111-1111-1111-111111111111  → TerryMon 寵物美容旗艦店（grooming）
22222222-2222-2222-2222-222222222222  → TerryMon 聯盟動物醫院（vet）
```

## Storage Buckets（已在 001 建立）

```
contracts/      ← 美容合約 PDF（私有）
receipts/       ← 收據（私有）
prescriptions/  ← 藥單（私有）
reports/        ← 報告（私有）
pet-photos/     ← 寵物照片（公開）
product-images/ ← 商品圖片（公開）
```

上傳路徑規則：
```
contracts/{member_id}/{record_id}.pdf
pet-photos/{pet_id}/avatar.jpg
product-images/{vendor_id}/{product_id}.jpg
```

## Realtime（已在 001 啟用）

```sql
-- appointments、notifications 已加入 Realtime
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table notifications;
```

## Triggers（已在 001 建立）

```
auto_upgrade_tier_on_transaction
  → 每次 service_payment / order_payment 後，自動計算 tier（basic/silver/gold）
  → silver：累積消費 ≥ 10,000；gold：≥ 30,000
```

## RLS 總覽

| Table | anon（飼主） | service_role（POS） |
|-------|-------------|-------------------|
| members | 只能讀/寫自己 | 全部 |
| pets | 只能讀自己的 | 全部 |
| appointments | 只能讀/更新自己的 | 全部 |
| grooming_records | 只能讀自己的 | 全部 |
| medical_records | 只能讀自己的 | 全部 |
| documents | 只能讀自己的 | 全部（寫入由 POS 用 service_role） |
| products | public 可讀 active，vendor 可寫自己的 | 全部 |
| vendors | 只能讀/寫自己 | 全部 |

## 開發流程

```bash
supabase link --project-ref lugakfqhugqciwlskunt
supabase db push                        # 推 migration 到雲端
supabase migration new add_something    # 建新 migration
supabase migration list                 # 確認狀態
supabase functions deploy line-notify   # 部署 function
```

## 絕對規則

- 所有 schema 變更必須走 migration，不可直接在 Dashboard SQL Editor 改
- Migration 第一行必須有 `-- migration: NNN_描述` comment
- `DROP TABLE` 必須加 `IF EXISTS`
- Migration 裡不放任何 secret/key
- 不允許直接 UPDATE members.platform_balance — 必須呼叫 `process_topup` RPC
- 不允許直接 UPDATE members.points — 必須呼叫 `process_service_payment` 或 `process_order_payment` RPC
