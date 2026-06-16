-- member_events: 飼主自訂個人事件（提醒、備忘等）
-- 與 appointments 分開：appointments 由 POS / 預約系統寫入，此表由飼主自行管理

create table if not exists member_events (
  id          uuid        primary key default gen_random_uuid(),
  member_id   uuid        not null references members(id) on delete cascade,
  pet_id      uuid        references pets(id) on delete set null,
  title       text        not null,
  date        date        not null,
  time        time,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table member_events enable row level security;

create policy "member_events_own" on member_events
  for all using (
    auth.uid() = (select supabase_uid from members where id = member_id)
  );

create index member_events_member_date on member_events (member_id, date);
