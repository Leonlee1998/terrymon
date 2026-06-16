-- migration: 011_platform_admin
-- created: 2026-06-15
-- description: 平台超級後台（terrymon-admin）資料層：platform_admins、admin_audit_log
--              + admin_adjust_balance RPC。不動 stores / grooming_stores（並存決策）。

-- ============================================================
-- platform_admins：平台營運方後台帳號（與 members / vendors / groomers 完全分離）
-- ============================================================
create table if not exists platform_admins (
  id            uuid        primary key default gen_random_uuid(),
  supabase_uid  uuid        unique references auth.users(id) on delete cascade,
  name          text        not null,
  email         text        unique not null,
  role          text        not null default 'ops'
                  check (role in ('super_admin', 'ops', 'finance', 'support')),
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now_utc()
);

alter table platform_admins enable row level security;

-- 後台帳號只能讀自己（用 anon session 判斷身份）；service_role 全權
create policy "platform_admins_self_select" on platform_admins
  for select using (auth.uid() = supabase_uid);

create policy "platform_admins_service_all" on platform_admins
  using (auth.role() = 'service_role');

-- ============================================================
-- admin_audit_log：所有後台寫入動作的稽核軌跡（動到錢/狀態的操作必記）
-- ============================================================
create table if not exists admin_audit_log (
  id            uuid        primary key default gen_random_uuid(),
  admin_id      uuid        references platform_admins(id) on delete set null,
  action        text        not null,
  target_table  text,
  target_id     uuid,
  payload       jsonb       not null default '{}'::jsonb,
  created_at    timestamptz not null default now_utc()
);

create index if not exists admin_audit_log_created_idx on admin_audit_log (created_at desc);
create index if not exists admin_audit_log_admin_idx on admin_audit_log (admin_id);

alter table admin_audit_log enable row level security;

-- 稽核軌跡只有 service_role 可存取（後台一律 server 端 service_role 讀寫）
create policy "admin_audit_log_service_all" on admin_audit_log
  using (auth.role() = 'service_role');

-- ============================================================
-- RPC admin_adjust_balance：唯一受審計的調帳入口
-- 遵守鐵律「不准裸 UPDATE members.platform_balance / points」
-- p_target: 'balance'（儲值餘額）| 'points'（回饋點數）；p_amount 可正可負
-- ============================================================
create or replace function admin_adjust_balance(
  p_admin_id  uuid,
  p_member_id uuid,
  p_target    text,
  p_amount    integer,
  p_reason    text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member      members%rowtype;
  v_new_balance integer;
  v_new_points  integer;
  v_tx_id       uuid;
begin
  if p_target not in ('balance', 'points') then
    raise exception 'invalid target: %（必須是 balance 或 points）', p_target;
  end if;

  select * into v_member from members where id = p_member_id for update;
  if not found then
    raise exception 'member not found: %', p_member_id;
  end if;

  v_new_balance := v_member.platform_balance;
  v_new_points  := v_member.points;

  if p_target = 'balance' then
    v_new_balance := v_member.platform_balance + p_amount;
    if v_new_balance < 0 then
      raise exception '調整後儲值餘額不可為負（現值 %, 調整 %）', v_member.platform_balance, p_amount;
    end if;
    update members set platform_balance = v_new_balance where id = p_member_id;
  else
    v_new_points := v_member.points + p_amount;
    if v_new_points < 0 then
      raise exception '調整後回饋點數不可為負（現值 %, 調整 %）', v_member.points, p_amount;
    end if;
    update members set points = v_new_points where id = p_member_id;
  end if;

  insert into transactions (
    member_id, type, total_amount,
    balance_used, points_used, card_amount, cash_amount,
    balance_after, points_after, note
  ) values (
    p_member_id, 'balance_adjustment', p_amount,
    0, 0, 0, 0,
    v_new_balance, v_new_points, p_reason
  ) returning id into v_tx_id;

  insert into admin_audit_log (admin_id, action, target_table, target_id, payload)
  values (
    p_admin_id, 'adjust_' || p_target, 'members', p_member_id,
    jsonb_build_object(
      'amount', p_amount,
      'reason', p_reason,
      'tx_id', v_tx_id,
      'new_balance', v_new_balance,
      'new_points', v_new_points
    )
  );

  return v_tx_id;
end;
$$;

-- 只允許 service_role 呼叫（後台 server 端 createAdminClient）
revoke all on function admin_adjust_balance(uuid, uuid, text, integer, text) from public, anon, authenticated;
grant execute on function admin_adjust_balance(uuid, uuid, text, integer, text) to service_role;
