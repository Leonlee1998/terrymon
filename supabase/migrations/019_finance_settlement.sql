-- migration: 019_finance_settlement
-- created: 2026-06-18
-- description: 金流對帳強化：transactions 加入結算時間、退款原始單號；新增 admin_issue_refund RPC

-- ============================================================
-- 欄位擴充
-- ============================================================
alter table transactions
  add column if not exists settled_at    timestamptz,
  add column if not exists original_tx_id uuid references transactions(id) on delete set null;

create index if not exists transactions_settled_idx    on transactions (settled_at);
create index if not exists transactions_original_tx_idx on transactions (original_tx_id);
create index if not exists transactions_gateway_tx_idx  on transactions (gateway_tx_id);

-- ============================================================
-- RPC admin_issue_refund
-- 建立退款交易並退還金額至會員 platform_balance（原子操作）
-- p_amount 為正整數，代表退款金額
-- ============================================================
create or replace function admin_issue_refund(
  p_admin_id      uuid,
  p_original_tx_id uuid,
  p_amount        integer,
  p_reason        text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orig      transactions%rowtype;
  v_member    members%rowtype;
  v_new_bal   integer;
  v_refund_id uuid;
begin
  if p_amount <= 0 then
    raise exception '退款金額必須大於 0';
  end if;

  select * into v_orig from transactions where id = p_original_tx_id for share;
  if not found then
    raise exception '找不到原始交易: %', p_original_tx_id;
  end if;
  if v_orig.type not in ('service_payment', 'order_payment', 'topup') then
    raise exception '只能對消費/儲值類型交易發起退款，目前類型: %', v_orig.type;
  end if;
  if p_amount > v_orig.total_amount then
    raise exception '退款金額 (%) 不可超過原始交易金額 (%)', p_amount, v_orig.total_amount;
  end if;

  -- 確認未曾退款（original_tx_id 已存在退款紀錄）
  if exists (select 1 from transactions where original_tx_id = p_original_tx_id and type = 'refund') then
    raise exception '此交易已存在退款紀錄';
  end if;

  select * into v_member from members where id = v_orig.member_id for update;
  if not found then
    raise exception '找不到會員: %', v_orig.member_id;
  end if;

  v_new_bal := v_member.platform_balance + p_amount;

  update members set platform_balance = v_new_bal where id = v_member.id;

  insert into transactions (
    member_id, store_id, type, total_amount,
    balance_used, points_used, card_amount, cash_amount,
    balance_after, points_after,
    payment_method, payment_gateway,
    original_tx_id, note
  ) values (
    v_orig.member_id, v_orig.store_id, 'refund', p_amount,
    0, 0, 0, 0,
    v_new_bal, v_member.points,
    null, null,
    p_original_tx_id, p_reason
  ) returning id into v_refund_id;

  insert into admin_audit_log (admin_id, action, target_table, target_id, payload)
  values (
    p_admin_id, 'refund', 'transactions', p_original_tx_id,
    jsonb_build_object(
      'refund_id',   v_refund_id,
      'amount',      p_amount,
      'reason',      p_reason,
      'member_id',   v_orig.member_id,
      'new_balance', v_new_bal
    )
  );

  return v_refund_id;
end;
$$;

revoke all on function admin_issue_refund(uuid, uuid, integer, text) from public, anon, authenticated;
grant execute on function admin_issue_refund(uuid, uuid, integer, text) to service_role;
