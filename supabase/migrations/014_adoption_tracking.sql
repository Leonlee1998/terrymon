-- migration: 014_adoption_tracking
-- created: 2026-06-15
-- description: 建立送養追蹤計畫（adoption_tracking_plans）與回報節點（adoption_checkpoints）
--              機構設定追蹤時間表 → 系統建立節點 → 飼主定期填回報頁

-- ============================================================
-- adoption_tracking_plans：送養追蹤計畫
-- 由機構/中途在送養時建立，指定追蹤月份與回報問題
-- ============================================================
CREATE TABLE IF NOT EXISTS adoption_tracking_plans (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id              uuid        NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  organization_id     uuid        NOT NULL REFERENCES organizations(id),
  adopter_member_id   uuid        NOT NULL REFERENCES members(id),
  adoption_date       date        NOT NULL,
  schedule_months     integer[]   NOT NULL DEFAULT '{1,3,6}',
  report_questions    jsonb       NOT NULL DEFAULT
    '[
      "請描述寵物目前的健康狀況",
      "本月有就醫或接種疫苗嗎？若有請簡述",
      "其他想補充的事項"
    ]'::jsonb,
  status              text        NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'completed', 'cancelled')),
  notes               text        NOT NULL DEFAULT '',
  created_at          timestamptz NOT NULL DEFAULT now_utc()
);

CREATE INDEX IF NOT EXISTS atp_pet_idx ON adoption_tracking_plans(pet_id);
CREATE INDEX IF NOT EXISTS atp_org_idx ON adoption_tracking_plans(organization_id);
CREATE INDEX IF NOT EXISTS atp_adopter_idx ON adoption_tracking_plans(adopter_member_id);

ALTER TABLE adoption_tracking_plans ENABLE ROW LEVEL SECURITY;

-- 機構負責人可查看/建立自己機構的追蹤計畫
CREATE POLICY "atp_org_owner_all" ON adoption_tracking_plans
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM organizations
      WHERE member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
    )
  );

-- 新飼主可查看自己的追蹤計畫
CREATE POLICY "atp_adopter_select" ON adoption_tracking_plans
  FOR SELECT USING (
    adopter_member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
  );

CREATE POLICY "atp_service_all" ON adoption_tracking_plans
  USING (auth.role() = 'service_role');

-- ============================================================
-- adoption_checkpoints：每個追蹤節點（回報頁）
-- 系統依 schedule_months 自動建立；飼主填寫後 status → submitted
-- ============================================================
CREATE TABLE IF NOT EXISTS adoption_checkpoints (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       uuid        NOT NULL REFERENCES adoption_tracking_plans(id) ON DELETE CASCADE,
  due_month     integer     NOT NULL,   -- 第幾個月（對應 schedule_months 的值）
  due_date      date        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'submitted', 'overdue')),
  submitted_at  timestamptz,
  photo_urls    text[]      NOT NULL DEFAULT '{}',
  -- [{"q": "問題文字", "a": "飼主回答"}, ...]
  responses     jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now_utc()
);

CREATE INDEX IF NOT EXISTS ac_plan_idx   ON adoption_checkpoints(plan_id);
CREATE INDEX IF NOT EXISTS ac_status_idx ON adoption_checkpoints(status, due_date);

ALTER TABLE adoption_checkpoints ENABLE ROW LEVEL SECURITY;

-- 機構負責人可查看自己機構計畫下的所有回報
CREATE POLICY "ac_org_owner_select" ON adoption_checkpoints
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM adoption_tracking_plans
      WHERE organization_id IN (
        SELECT id FROM organizations
        WHERE member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
      )
    )
  );

-- 新飼主可查看 + 提交自己的回報節點
CREATE POLICY "ac_adopter_select" ON adoption_checkpoints
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM adoption_tracking_plans
      WHERE adopter_member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
    )
  );

CREATE POLICY "ac_adopter_update" ON adoption_checkpoints
  FOR UPDATE USING (
    plan_id IN (
      SELECT id FROM adoption_tracking_plans
      WHERE adopter_member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
    )
  );

CREATE POLICY "ac_service_all" ON adoption_checkpoints
  USING (auth.role() = 'service_role');

-- ============================================================
-- Helper function：建立追蹤計畫時自動產生 checkpoints
-- 呼叫：SELECT create_adoption_checkpoints(plan_id);
-- ============================================================
CREATE OR REPLACE FUNCTION create_adoption_checkpoints(p_plan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_plan  adoption_tracking_plans%rowtype;
  v_month integer;
BEGIN
  SELECT * INTO v_plan FROM adoption_tracking_plans WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found: %', p_plan_id;
  END IF;

  FOREACH v_month IN ARRAY v_plan.schedule_months LOOP
    INSERT INTO adoption_checkpoints (plan_id, due_month, due_date)
    VALUES (
      p_plan_id,
      v_month,
      v_plan.adoption_date + (v_month || ' months')::interval
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;
