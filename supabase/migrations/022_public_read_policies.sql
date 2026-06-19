-- migration: 022_public_read_policies
-- created: 2026-06-18
-- description: 開放 authenticated/anon 讀取店家、服務項目、美容師（公開資訊，供 WebApp 預約流程使用）

CREATE POLICY "stores_select_public" ON stores
  FOR SELECT TO authenticated, anon USING (is_active = true);

CREATE POLICY "grooming_services_select_public" ON grooming_services
  FOR SELECT TO authenticated, anon USING (is_enabled = true);

CREATE POLICY "groomers_select_public" ON groomers
  FOR SELECT TO authenticated, anon USING (is_active = true);
