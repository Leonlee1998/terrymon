-- migration: 017_vaccine_reminder_category
-- created: 2026-06-16
-- description: 為 pet_vaccine_reminders 加入 category 欄位，區分疫苗(vaccine)與驅蟲(dewormer)

ALTER TABLE pet_vaccine_reminders
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'vaccine'
    CHECK (category IN ('vaccine', 'dewormer'));
