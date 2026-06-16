-- migration: 012_organizations
-- created: 2026-06-16
-- description: 機構審核（中途之家、救援團體、收容所）— terrymon-admin 機構審核模組

create table if not exists organizations (
  id           uuid        primary key default gen_random_uuid(),
  member_id    uuid        not null references members(id) on delete cascade,
  name         text        not null,
  type         text        not null default 'individual'
                 check (type in ('individual', 'shelter', 'rescue')),
  description  text,
  phone        text,
  address      text,
  cert_url     text,
  status       text        not null default 'pending'
                 check (status in ('pending', 'approved', 'suspended')),
  applied_at   timestamptz not null default now_utc(),
  approved_at  timestamptz
);

create index if not exists organizations_member_idx on organizations (member_id);
create index if not exists organizations_status_idx on organizations (status);

alter table organizations enable row level security;

-- 申請人（member）可讀取自己的申請
create policy "organizations_own_select" on organizations
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );

-- 申請人可新增（自助申請）
create policy "organizations_own_insert" on organizations
  for insert with check (
    member_id in (select id from members where supabase_uid = auth.uid())
  );

-- service_role 全權（後台審核）
create policy "organizations_service_all" on organizations
  using (auth.role() = 'service_role');
