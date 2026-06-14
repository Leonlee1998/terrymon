-- migration: 005_add_groomer_auth
-- created: 2026-06-14
-- description: Add Supabase Auth mapping for groomers.

alter table groomers
  add column if not exists supabase_uid uuid unique references auth.users(id) on delete set null;

alter table groomers enable row level security;

drop policy if exists "groomers_service_all" on groomers;
create policy "groomers_service_all" on groomers
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "groomers_select_own" on groomers;
create policy "groomers_select_own" on groomers
  for select
  using (auth.uid() = supabase_uid);

drop policy if exists "groomers_update_own" on groomers;
create policy "groomers_update_own" on groomers
  for update
  using (auth.uid() = supabase_uid)
  with check (auth.uid() = supabase_uid);
