# terrymon-supabase — 重定向說明

## ⚠️ 實際的 Supabase 後端不在這個目錄

Supabase 後端的實際位置是根目錄的 `supabase/`：

```
C:\Users\ASUS\Desktop\Terrymons\supabase\
  CLAUDE.md               ← 主要文件在這裡
  migrations\
    CLAUDE.md
    001_initial_schema.sql
    003_webapp_rls_policies.sql
    004_seed_demo_data.sql
  functions\
    CLAUDE.md
    line-notify\
    ecpay-webhook\
    nxvet-sync\
    generate-pdf\
```

請閱讀 `C:\Users\ASUS\Desktop\Terrymons\supabase\CLAUDE.md` 取得完整規範。

## 快速重點

- Project URL：`https://lugakfqhugqciwlskunt.supabase.co`
- 所有 tables 都已在 `001_initial_schema.sql`（不需要額外建立）
- 三個 RPC：`process_topup`、`process_service_payment`、`process_order_payment`（已在 001）
- Store IDs：`1111...1`（美容）、`2222...2`（獸醫）
