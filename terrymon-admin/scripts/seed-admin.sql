-- 建立第一個平台後台帳號（super_admin）
--
-- 步驟：
-- 1. 先在 Supabase Dashboard → Authentication → Users → Add user
--    建一組 email + password（這就是後台登入帳密）。複製該 user 的 UUID。
-- 2. 把下面的 :uid 換成那個 UUID、email 換成同一個 email，於 SQL Editor 執行。
--
-- 之後就能用該 email/password 登入 terrymon-admin（port 3004）。

insert into platform_admins (supabase_uid, name, email, role, is_active)
values (
  '00000000-0000-0000-0000-000000000000',  -- ← 換成 auth.users 的 UUID
  '平台管理員',                              -- ← 顯示名稱
  'admin@furzzle-pet.com',                  -- ← 與 auth user 相同的 email
  'super_admin',
  true
)
on conflict (supabase_uid) do update
  set role = excluded.role, is_active = true;
