-- ============================================================
-- TerryMon POS 地端 SQLite Schema
-- 用途：POS 機本地快取與離線排隊，連線後推上 Supabase
-- 執行環境：better-sqlite3（Node.js）
-- ============================================================

-- 離線操作排隊
create table if not exists sync_queue (
  id          integer primary key autoincrement,
  action      text not null,     -- 'INSERT' | 'UPDATE'
  table_name  text not null,     -- 對應 Supabase 的 table
  payload     text not null,     -- JSON
  created_at  text not null,
  synced_at   text,
  error       text,
  retry_count integer default 0
);

-- 掃碼後會員快取（30 分鐘過期）
create table if not exists local_members (
  id               text primary key,
  name             text,
  phone            text,
  platform_balance integer,
  points           integer,
  tier             text,
  pets_json        text,         -- JSON
  cached_at        text,
  expires_at       text
);

-- 本日預約快取（POS 開機時同步）
create table if not exists local_appointments (
  id             text primary key,
  member_id      text,
  pet_id         text,
  scheduled_date text,
  scheduled_time text,
  status         text,
  groomer_id     text,
  synced         integer default 0
);
