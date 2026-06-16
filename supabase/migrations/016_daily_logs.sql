-- migration: 016_daily_logs
-- created: 2026-06-16
-- description: 寵物日常紀錄（飲食/糞便/嘔吐）+ 疫苗驅蟲提醒

-- ============================================================
-- pet_daily_logs：每日紀錄（飲食 / 糞便 / 嘔吐）
-- data jsonb 依 type 儲存不同欄位
-- ============================================================
CREATE TABLE IF NOT EXISTS pet_daily_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      uuid        NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  member_id   uuid        NOT NULL REFERENCES members(id),
  log_date    date        NOT NULL DEFAULT CURRENT_DATE,
  type        text        NOT NULL CHECK (type IN ('diet', 'poop', 'vomit')),
  data        jsonb       NOT NULL DEFAULT '{}',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now_utc()
);

CREATE INDEX IF NOT EXISTS pet_daily_logs_pet_date
  ON pet_daily_logs(pet_id, log_date DESC);

ALTER TABLE pet_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_logs_owner_all" ON pet_daily_logs
  USING (member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid()));

CREATE POLICY "daily_logs_service" ON pet_daily_logs
  USING (auth.role() = 'service_role');

-- ============================================================
-- pet_vaccine_reminders：疫苗 / 驅蟲提醒
-- ============================================================
CREATE TABLE IF NOT EXISTS pet_vaccine_reminders (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          uuid        NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  member_id       uuid        NOT NULL REFERENCES members(id),
  name            text        NOT NULL,
  last_done_date  date,
  next_due_date   date,
  notes           text,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now_utc()
);

CREATE INDEX IF NOT EXISTS vaccine_reminders_pet_due
  ON pet_vaccine_reminders(pet_id, next_due_date ASC NULLS LAST)
  WHERE is_active = true;

ALTER TABLE pet_vaccine_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vaccine_owner_all" ON pet_vaccine_reminders
  USING (member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid()));

CREATE POLICY "vaccine_service" ON pet_vaccine_reminders
  USING (auth.role() = 'service_role');
