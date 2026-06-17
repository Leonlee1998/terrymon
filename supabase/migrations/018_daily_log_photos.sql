-- migration: 018_daily_log_photos
-- created: 2026-06-17
-- description: 為 pet_daily_logs 加入 photo_urls 欄位，支援日常紀錄上傳照片

ALTER TABLE pet_daily_logs
  ADD COLUMN IF NOT EXISTS photo_urls text[] NOT NULL DEFAULT '{}';
