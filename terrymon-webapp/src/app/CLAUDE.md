# 路由結構

```
(main)/               → 需要登入（AuthGuard in layout.tsx）
  page.tsx            → 首頁
  shop/               → 商城
  pets/               → 我的寵物
  appointments/       → 預約紀錄（美容/看診）
  member/             → 會員中心（儲值餘額、點數、tier badge）

login/                → 登入頁（不需要 AuthGuard）
```

規則：
- 所有 `(main)/` 底下的頁面都要 AuthGuard（檢查 authStore.isLoggedIn）
- Server Component 預設，互動才 `'use client'`
- 路由對應的資料查詢在同層的 `page.tsx` 做，不在 `layout.tsx`
- Server Component 用 `src/lib/supabase/server.ts`；Client Component 用 `src/lib/supabase/client.ts`
