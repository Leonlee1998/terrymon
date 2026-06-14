# Migration 規範

## 命名規則

```
NNN_描述.sql（NNN 三位數遞增）
```

## 必須的 Header Comment

每個 migration 第一行必須有：

```sql
-- migration: NNN_描述
-- created: YYYY-MM-DD
-- description: 一行說明這個 migration 做什麼
```

## 現有 Migrations

| 檔案 | 說明 |
|------|------|
| `001_initial_schema.sql` | 完整 schema：全部 tables、functions、triggers、storage buckets、Realtime |
| `002` | 未使用（tables 已併入 001） |
| `003_webapp_rls_policies.sql` | WebApp 的額外 RLS（members insert/update + 其他 table） |
| `004_seed_demo_data.sql` | Demo 初始資料（store、store_settings、groomers、grooming_services） |

## 下一個 migration 從 005 開始

```bash
supabase migration new 描述
# 生成：20240101120000_描述.sql（用時間戳）
# 手動改名為：005_描述.sql
```

## 禁止事項

```
❌ 在 Supabase Dashboard SQL Editor 直接改 schema
❌ DROP TABLE 不加 IF EXISTS
❌ Migration 裡放 secret、key、密碼
❌ 重複建立 001 已有的 table（vendors、stores 等都已在 001）
```

## 新增 migration 範例

```sql
-- migration: 005_add_groomer_supabase_uid
-- created: 2025-01-15
-- description: 為 groomers table 加入 supabase_uid 欄位，支援美容師後台登入

alter table groomers
  add column if not exists supabase_uid uuid unique references auth.users(id);

create policy "groomers_select_own" on groomers
  for select using (auth.uid() = supabase_uid);
```
