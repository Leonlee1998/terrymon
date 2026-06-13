-- ============================================================
-- TerryMon POS ?啁垢 SQLite Schema
-- ?券?POS 璈?啣翰???Ｙ???嚗??敺銝?Supabase
-- ?瑁??啣?嚗etter-sqlite3嚗ode.js嚗?-- ============================================================

-- ?Ｙ?????
create table if not exists sync_queue (
  id          integer primary key autoincrement,
  action      text not null,     -- 'INSERT' | 'UPDATE'
  table_name  text not null,     -- 撠? Supabase ??table
  payload     text not null,     -- JSON
  created_at  text not null,
  synced_at   text,
  error       text,
  retry_count integer default 0
);

-- ?Ⅳ敺??∪翰??30 ????嚗?create table if not exists local_members (
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

-- ?祆??敹怠?嚗OS ????甇伐?
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

