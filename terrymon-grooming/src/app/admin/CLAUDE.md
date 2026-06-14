# Admin 後台路由

```
/admin/login          員工登入（Supabase Auth → 查 groomers table）
/admin                儀表板
/admin/services       服務管理（grooming_services 定價矩陣）
/admin/shop-products  現場商品管理
/admin/schedule       排班系統（groomers + groomer_shifts）
/admin/members        會員查詢（唯讀，查 members + pets）
/admin/records        服務紀錄（grooming_records）
/admin/settings       系統設定（儲值方案 + 合約範本）
```

## Auth Guard

`/admin/layout.tsx` 必須確認：
1. Supabase session 存在（`supabase.auth.getUser()`）
2. `groomers` table 有 `supabase_uid = user.id` 的記錄
3. 不存在 → redirect `/admin/login`

## Supabase Table 對應

```
grooming_services   → /admin/services（CRUD 定價矩陣 JSONB）
groomers            → /admin/schedule（排班）
grooming_records    → /admin/records（唯讀紀錄）
members + pets      → /admin/members（唯讀查詢）
```

## 注意

- 排班資料存在 `groomers` 和 `groomer_shifts` table
- 定價矩陣是 JSONB 欄位（`grooming_services.price_matrix`），更新時整欄覆寫
- 服務紀錄唯讀，不可在後台修改已完成的 grooming_records
