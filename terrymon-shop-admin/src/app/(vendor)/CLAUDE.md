# 商家後台路由（需要登入 + vendor.status === 'approved'）

```
/dashboard      數據總覽（銷售趨勢圖、最近訂單）
/products       商品管理（CRUD，只能操作 vendor_id = 自己的）
/products/new   新增商品
/products/[id]  編輯商品
/orders         訂單管理（透過 order_items 關聯查自己的訂單）
/promotions     行銷活動（vendor_id = 自己的）
/reports        銷售報表（從 order_items 即時計算，不用 summary 欄位）
/settings       商家設定（基本資料、logo、金融資訊）
```

## Auth Guard（layout.tsx 三重確認）

```typescript
// 1. isLoggedIn（vendorStore persist）
// 2. vendor 不為 null
// 3. vendor.status === 'approved'
if (!isLoggedIn) → router.replace('/login')
if (vendor?.status === 'pending') → router.replace('/pending')
if (vendor?.status === 'suspended') → router.replace('/login?error=suspended')
```

## 所有查詢必須帶 vendor_id

```typescript
// 正確
.eq('vendor_id', vendor.id)

// 錯誤（即使 RLS 會擋，程式碼也要明確過濾）
.from('products').select('*')
```

## 庫存 Realtime（在 /products/page.tsx 訂閱）

買家下單後 WebApp 自動扣庫存 → Realtime 推送到這裡 → `vendorStore.updateProductStock()` → 低庫存 toast.warning()

## 報表數據來源

從 `order_items` join `orders` 計算，不依賴任何 summary 欄位：
- 篩選條件：`vendor_id = 自己` + `orders.status in ('shipped','delivered')` + 日期範圍
- 在前端加總 revenue = Σ(price × qty)
