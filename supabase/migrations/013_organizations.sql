-- migration: 013_organizations
-- created: 2026-06-15
-- description: 建立 organizations 表（機構/個人中途統一），並在 pets 加入 organization_id / adoption_status

-- ============================================================
-- organizations：機構/中途帳號（member 申請 → Admin 審核）
-- type: individual=個人中途, shelter=收容所, rescue=救援團體
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  type          text        NOT NULL
                  CHECK (type IN ('individual', 'shelter', 'rescue')),
  description   text        NOT NULL DEFAULT '',
  address       text,
  phone         text,
  logo_url      text,
  cert_url      text,       -- 立案文件（shelter/rescue 必填，individual 可選）
  social_links  jsonb       NOT NULL DEFAULT '{}'::jsonb,
  status        text        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'suspended')),
  applied_at    timestamptz NOT NULL DEFAULT now_utc(),
  approved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now_utc()
);

CREATE INDEX IF NOT EXISTS organizations_member_idx ON organizations(member_id);
CREATE INDEX IF NOT EXISTS organizations_status_idx ON organizations(status);

-- 補齊 012 建表時少掉的欄位（012 schema 較簡化）
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS logo_url     text,
  ADD COLUMN IF NOT EXISTS social_links jsonb        NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at   timestamptz  NOT NULL DEFAULT now_utc();

-- 讓 description 有預設值（012 建的可能是 nullable）
ALTER TABLE organizations ALTER COLUMN description SET DEFAULT '';

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 清除 012 建的同名 policy，避免衝突
DROP POLICY IF EXISTS "organizations_own_select"  ON organizations;
DROP POLICY IF EXISTS "organizations_own_insert"  ON organizations;
DROP POLICY IF EXISTS "organizations_service_all" ON organizations;

-- 機構負責人可查看/更新自己的申請
CREATE POLICY "organizations_owner_select" ON organizations
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
  );

CREATE POLICY "organizations_owner_insert" ON organizations
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
  );

CREATE POLICY "organizations_owner_update" ON organizations
  FOR UPDATE USING (
    member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
  );

-- 公開查詢：已審核機構對外可見（供瀏覽用）
CREATE POLICY "organizations_approved_public" ON organizations
  FOR SELECT USING (status = 'approved');

CREATE POLICY "organizations_service_all" ON organizations
  USING (auth.role() = 'service_role');

-- ============================================================
-- pets 加欄位：organization_id / adoption_status
-- ============================================================
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS organization_id  uuid REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS adoption_status  text
    CHECK (adoption_status IN ('available', 'fostered', 'adopted'));

CREATE INDEX IF NOT EXISTS pets_organization_idx ON pets(organization_id);
