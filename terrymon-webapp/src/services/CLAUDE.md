# API 層規範

`api.ts` 是唯一的 Supabase 呼叫入口。
所有 component 透過 `api.ts` 取資料，不直接 import supabase client。

## 換 API 步驟（Mock → 真實）

1. 只改 `api.ts` 裡對應的函數
2. 把 `return MOCK_XXX` 換成 supabase query
3. Component 完全不需要改任何東西

## 查詢規則

- 所有查詢必須帶 `member_id` 過濾（從 `authStore` 取 `member.id`）
- 只用 `anon key`，不使用 service_role
- 遵守 RLS：不可跨用戶讀取資料

## api.ts 中的函數對應 Supabase Table

```
api.getMe()              → members（.eq('supabase_uid', user.id)）
api.getPets()            → pets（.eq('member_id', ...)）
api.getMedical()         → medical_records（.eq('pet_id', ...)）
api.getGroomingRecords() → grooming_records（.eq('pet_id', ...)）
api.getHealthData()      → health_data（.eq('pet_id', ...)）
api.getDevices()         → iot_devices（.eq('pet_id', ...)）
api.getAppointments()    → appointments（.eq('member_id', ...)）
api.getProducts()        → products（.eq('status', 'active')）
api.getOrders()          → orders + order_items（.eq('member_id', ...)）
api.getDocuments()       → documents（.eq('member_id', ...)）
api.getNotifications()   → notifications（.eq('member_id', ...)）
```
