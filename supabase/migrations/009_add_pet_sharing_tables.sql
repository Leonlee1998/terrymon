-- migration: 009_add_pet_sharing_tables
-- created: 2026-06-15
-- description: 新增 pet_emergency_contacts（緊急聯絡人）與 pet_caregivers（寵物共同照護者 / 邀請），
--              對齊 webapp src/services/api.ts 已在使用的欄位

-- ============================================================
-- pet_emergency_contacts：寵物緊急聯絡人
-- api.ts: getEmergencyContacts / addEmergencyContact / removeEmergencyContact
-- ============================================================
create table if not exists pet_emergency_contacts (
  id          uuid        primary key default gen_random_uuid(),
  pet_id      uuid        not null references pets(id) on delete cascade,
  name        text        not null,
  phone       text        not null,
  relation    text        not null,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now_utc()
);

create index if not exists pet_emergency_contacts_pet_idx
  on pet_emergency_contacts (pet_id, sort_order);

alter table pet_emergency_contacts enable row level security;

-- 飼主只能存取自己寵物的緊急聯絡人
create policy "pet_emergency_contacts_owner" on pet_emergency_contacts
  for all using (
    pet_id in (
      select p.id from pets p
      join members m on m.id = p.member_id
      where m.supabase_uid = auth.uid()
    )
  );

create policy "pet_emergency_contacts_service_all" on pet_emergency_contacts
  using (auth.role() = 'service_role');

-- ============================================================
-- pet_caregivers：寵物共同照護者 / 邀請
-- api.ts: getCaregivers / inviteCaregiver / generateInviteLink /
--         updateCaregiverPermissions / removeCaregiver
-- 註：getCaregivers 用 .select('*, members(name, handle, avatar_url)')
--     依賴 member_id → members 的外鍵供 PostgREST 做 embed
-- ============================================================
create table if not exists pet_caregivers (
  id                 uuid        primary key default gen_random_uuid(),
  pet_id             uuid        not null references pets(id) on delete cascade,
  member_id          uuid        references members(id) on delete set null,
  invited_contact    text,
  status             text        not null default 'pending'
                       check (status in ('pending', 'active')),
  permissions        jsonb       not null default '{}'::jsonb,
  invite_token       text        unique,
  invite_expires_at  timestamptz,
  created_at         timestamptz not null default now_utc()
);

create index if not exists pet_caregivers_pet_idx on pet_caregivers (pet_id);
create index if not exists pet_caregivers_member_idx on pet_caregivers (member_id);

alter table pet_caregivers enable row level security;

-- 飼主可管理自己寵物的照護者邀請
create policy "pet_caregivers_pet_owner" on pet_caregivers
  for all using (
    pet_id in (
      select p.id from pets p
      join members m on m.id = p.member_id
      where m.supabase_uid = auth.uid()
    )
  );

-- 被邀請的照護者本人可讀取自己的邀請記錄
create policy "pet_caregivers_invitee_select" on pet_caregivers
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );

create policy "pet_caregivers_service_all" on pet_caregivers
  using (auth.role() = 'service_role');
