# terrymon-admin — 平台超級後台

## 專案定位

預約怪獸(TerryMon)營運方使用的平台後台。管理**所有**會員、商家、店鋪/實體店進駐、金流收費對帳。
身份對應 `platform_admins` table(與 members / vendors / groomers 完全分離)。

與其他四個前端共用同一個 Supabase。**這是唯一需要跨租戶讀寫的前端**,因此使用 service_role。

## 技術棧

Next.js 16 App Router + TS + React 19、Tailwind v4(`globals.css` `@theme inline`,品牌綠 `#2B7A4B`)、
Zustand v5、RHF v7 + Zod v4、@supabase/ssr、recharts、sonner、lucide-react。dev port **3004**。

## 安全紅線(最重要)

1. **service_role 只在 server 端** —— `createAdminClient()`(`src/lib/supabase/server.ts`)只能在
   Server Component / Server Action / Route Handler 呼叫,**永不進瀏覽器**。
2. **權限判斷一律 server-side** —— `getCurrentAdmin()`(`src/lib/auth.ts`)+ `(admin)/layout.tsx`。
   `adminStore`(client persist)僅供顯示,**不可作為授權依據**。
3. **金流不准裸寫** —— 調整 `members.platform_balance` / `points` 一律走 RPC `admin_adjust_balance`。
4. **所有寫入記稽核** —— `admin_audit_log`(調帳在 RPC 內記,其餘在 `adminActions.ts` 的 `audit()`)。

## 結構

```
src/
├── app/
│   ├── login/              # 後台登入
│   └── (admin)/            # server-side guard(getCurrentAdmin）
│       ├── dashboard/      # 營運總覽
│       ├── members/[id]/   # 會員管理 + 餘額/點數調整
│       ├── vendors/[id]/   # 商家審核 + 抽成
│       ├── stores/         # stores + grooming_stores 並存
│       ├── store-placements/ # 開通實體店鋪(進駐審核)
│       ├── finance/        # 金流對帳
│       └── reports/        # 營收報表
├── services/
│   ├── adminApi.ts         # 讀取(service_role)
│   └── adminActions.ts     # 寫入 server actions(含稽核 + 角色檢查)
├── lib/
│   ├── auth.ts             # getCurrentAdmin()
│   └── supabase/           # client / server / middleware
└── components/admin/       # 各模組互動元件
```

## 資料層

schema 在共用 `supabase/migrations/010_platform_admin.sql`:`platform_admins`、`admin_audit_log`、
`admin_adjust_balance` RPC。店鋪沿用既有 `stores`(001)與 `grooming_stores` + `store_placements`(並存)。

## 角色

`super_admin` / `ops` / `finance` / `support`。`adminActions.ts` 用 `requireAdmin([roles])` 粗分權限。

## 絕對規則(沿用各前端)

1. 元件最多 150 行 2. 顏色只用 Tailwind class 3. Server Component 預設 4. 不可有 console error
5. 未完成功能用 `toast.info()` 提示 6. 透過 `adminApi.ts` / `adminActions.ts` 存取,不在頁面直接 import supabase
