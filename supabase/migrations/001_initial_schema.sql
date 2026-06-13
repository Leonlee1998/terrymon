-- ============================================================
-- TerryMon 初始 Schema
-- Migration: 001_initial_schema
-- ============================================================

-- ── 1. 基礎擴充 ─────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create or replace function now_utc()
returns timestamptz language sql stable as
$$ select now() at time zone 'utc' $$;

-- ── 2. 會員主表 ─────────────────────────────────────────────

create table members (
  id                uuid primary key default uuid_generate_v4(),
  supabase_uid      uuid unique references auth.users(id) on delete cascade,
  name              text not null,
  phone             text unique not null,
  email             text unique not null,
  avatar_url        text,

  platform_balance  integer not null default 0 check (platform_balance >= 0),
  points            integer not null default 0 check (points >= 0),
  tier              text not null default 'basic'
                    check (tier in ('basic', 'silver', 'gold')),

  home_store_id     uuid,   -- 預留加盟模式，目前 null

  created_at        timestamptz not null default now_utc(),
  updated_at        timestamptz not null default now_utc()
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now_utc(); return new; end; $$;

create trigger members_updated_at
  before update on members
  for each row execute function update_updated_at();

alter table members enable row level security;

create policy "members_select_own" on members
  for select using (auth.uid() = supabase_uid);

create policy "members_service_all" on members
  using (auth.role() = 'service_role');

-- ── 3. 寵物 ─────────────────────────────────────────────────

create table pets (
  id           uuid primary key default uuid_generate_v4(),
  member_id    uuid not null references members(id) on delete cascade,
  name         text not null,
  species      text not null check (species in ('dog', 'cat', 'other')),
  breed        text not null default '',
  birth_date   date,
  weight       numeric(5,2),
  photo_url    text,
  allergies    text[] not null default '{}',
  chip_id      text,
  notes        text not null default '',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now_utc(),
  updated_at   timestamptz not null default now_utc()
);

create index pets_member_id_idx on pets(member_id);

alter table pets enable row level security;

create policy "pets_select_owner" on pets
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );

create policy "pets_service_all" on pets
  using (auth.role() = 'service_role');

-- ── 4. 店家 ─────────────────────────────────────────────────

create table stores (
  id            uuid primary key default uuid_generate_v4(),
  type          text not null check (type in ('grooming', 'vet', 'shop')),
  owner_type    text not null default 'platform'
                check (owner_type in ('platform', 'franchise')),
  name          text not null,
  address       text,
  phone         text,
  line_id       text,
  logo_url      text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now_utc()
);

create table store_settings (
  store_id              uuid primary key references stores(id) on delete cascade,

  -- [{"topup": 3000, "bonus": 300}, {"topup": 5000, "bonus": 600}]
  topup_tiers           jsonb not null default '[]',

  balance_offset_max_pct integer not null default 100
                          check (balance_offset_max_pct between 0 and 100),

  payment_methods       text[] not null default '{balance, card}',

  points_rate           numeric(4,2) not null default 1.0,

  updated_at            timestamptz not null default now_utc()
);

create table groomers (
  id         uuid primary key default uuid_generate_v4(),
  store_id   uuid not null references stores(id) on delete cascade,
  name       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now_utc()
);

create table grooming_services (
  id          uuid primary key default uuid_generate_v4(),
  store_id    uuid not null references stores(id) on delete cascade,
  name        text not null,
  description text not null default '',
  price       integer not null check (price >= 0),
  duration    integer not null check (duration > 0),
  is_addon    boolean not null default false,
  is_enabled  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now_utc()
);

-- ── 5. 預約 ─────────────────────────────────────────────────

create table appointments (
  id             uuid primary key default uuid_generate_v4(),
  member_id      uuid not null references members(id),
  pet_id         uuid not null references pets(id),
  store_id       uuid not null references stores(id),
  type           text not null check (type in ('grooming', 'vet')),

  scheduled_date date not null,
  scheduled_time time not null,
  end_time       time,
  duration_min   integer,

  source         text not null default 'kiosk'
                 check (source in ('kiosk', 'webapp', 'line', 'phone')),

  status         text not null default 'pending'
                 check (status in ('pending','confirmed','checked_in','completed','cancelled','no_show')),

  groomer_id     uuid references groomers(id),

  notes          text not null default '',
  reminder_sent  boolean not null default false,
  created_at     timestamptz not null default now_utc(),
  updated_at     timestamptz not null default now_utc()
);

create index appointments_member_idx on appointments(member_id);
create index appointments_store_date_idx on appointments(store_id, scheduled_date);
create index appointments_status_idx on appointments(status);

-- ── 6. 金流 ─────────────────────────────────────────────────

create table transactions (
  id                uuid primary key default uuid_generate_v4(),
  member_id         uuid not null references members(id),
  store_id          uuid references stores(id),

  type              text not null check (type in (
    'topup',
    'topup_bonus',
    'service_payment',
    'order_payment',
    'refund',
    'points_redemption',
    'points_earn',
    'balance_adjustment'
  )),

  total_amount      integer not null,
  balance_used      integer not null default 0,
  points_used       integer not null default 0,
  card_amount       integer not null default 0,
  cash_amount       integer not null default 0,

  balance_after     integer not null,
  points_after      integer not null,

  ref_type          text check (ref_type in ('appointment','grooming_record','medical_record','order')),
  ref_id            uuid,

  payment_method    text check (payment_method in ('balance','card','cash','mixed','points')),
  card_last4        text,
  card_brand        text,
  payment_gateway   text,
  gateway_tx_id     text,

  note              text,
  created_at        timestamptz not null default now_utc()
);

create index transactions_member_idx on transactions(member_id);
create index transactions_store_idx on transactions(store_id);
create index transactions_type_idx on transactions(type);
create index transactions_created_idx on transactions(created_at desc);

-- ── 7. 美容紀錄 ─────────────────────────────────────────────

create table grooming_records (
  id               uuid primary key default uuid_generate_v4(),
  member_id        uuid not null references members(id),
  pet_id           uuid not null references pets(id),
  store_id         uuid not null references stores(id),
  appointment_id   uuid references appointments(id),
  transaction_id   uuid references transactions(id),
  groomer_id       uuid references groomers(id),

  main_service_id  uuid references grooming_services(id),
  addon_service_ids uuid[] not null default '{}',
  service_names    text[] not null default '{}',
  total_price      integer not null,

  contract_text    text,
  contract_url     text,
  signature_data   text,
  signed_at        timestamptz,

  receipt_url      text,

  notes            text not null default '',
  created_at       timestamptz not null default now_utc()
);

create index grooming_records_member_idx on grooming_records(member_id);
create index grooming_records_pet_idx on grooming_records(pet_id);

-- ── 8. 醫療紀錄 ─────────────────────────────────────────────

create table medical_records (
  id               uuid primary key default uuid_generate_v4(),
  member_id        uuid not null references members(id),
  pet_id           uuid not null references pets(id),
  store_id         uuid references stores(id),
  transaction_id   uuid references transactions(id),

  nxvet_record_id  text,
  nxvet_synced_at  timestamptz,

  clinic_name      text not null,
  doctor_name      text not null,
  visit_date       date not null,
  chief_complaint  text not null default '',
  diagnosis        text not null,
  clinical_findings text,
  treatment        text,

  -- [{"medicine":"美樂托寧","dosage":"10mg","frequency":"每天2次","days":5}]
  prescriptions    jsonb not null default '[]',

  follow_up_date   date,
  fee              integer,

  prescription_url text,
  receipt_url      text,
  report_url       text,

  notes            text not null default '',
  created_at       timestamptz not null default now_utc()
);

create index medical_records_member_idx on medical_records(member_id);
create index medical_records_pet_idx on medical_records(pet_id);
create index medical_records_nxvet_idx on medical_records(nxvet_record_id);

-- ── 9. 商城 ─────────────────────────────────────────────────

create table vendors (
  id                  uuid primary key default uuid_generate_v4(),
  supabase_uid        uuid unique references auth.users(id),
  store_name          text not null,
  owner_name          text not null,
  email               text unique not null,
  phone               text,
  logo_url            text,
  description         text,
  tax_id              text,
  bank_account        text,
  status              text not null default 'pending'
                      check (status in ('pending','approved','suspended')),
  commission_rate     numeric(4,2) not null default 5.0,
  created_at          timestamptz not null default now_utc()
);

create table products (
  id              uuid primary key default uuid_generate_v4(),
  vendor_id       uuid not null references vendors(id) on delete cascade,
  name            text not null,
  category        text not null,
  subcategory     text,
  price           integer not null check (price >= 0),
  original_price  integer,
  cost            integer,
  stock           integer not null default 0 check (stock >= 0),
  image_url       text,
  images          text[] not null default '{}',
  description     text not null default '',
  specs           jsonb not null default '{}',
  tags            text[] not null default '{}',
  status          text not null default 'active'
                  check (status in ('active','inactive','sold_out','review')),
  total_sold      integer not null default 0,
  rating          numeric(3,2),
  review_count    integer not null default 0,
  created_at      timestamptz not null default now_utc(),
  updated_at      timestamptz not null default now_utc()
);

create index products_vendor_idx on products(vendor_id);
create index products_category_idx on products(category);
create index products_status_idx on products(status);

create table orders (
  id               uuid primary key default uuid_generate_v4(),
  member_id        uuid not null references members(id),
  transaction_id   uuid references transactions(id),

  recipient_name   text not null,
  recipient_phone  text not null,
  address          text not null,

  subtotal         integer not null,
  shipping_fee     integer not null default 0,
  discount_amount  integer not null default 0,
  total_price      integer not null,
  points_used      integer not null default 0,

  status           text not null default 'pending'
                   check (status in ('pending','paid','shipped','delivered','cancelled','refunding')),

  tracking_number  text,
  shipped_at       timestamptz,
  delivered_at     timestamptz,
  note             text,
  created_at       timestamptz not null default now_utc(),
  updated_at       timestamptz not null default now_utc()
);

create table order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id),
  vendor_id    uuid not null references vendors(id),
  product_name text not null,
  price        integer not null,
  qty          integer not null check (qty > 0),
  subtotal     integer not null,
  image_url    text
);

create index order_items_order_idx on order_items(order_id);
create index order_items_vendor_idx on order_items(vendor_id);

create table promotions (
  id                    uuid primary key default uuid_generate_v4(),
  vendor_id             uuid not null references vendors(id) on delete cascade,
  name                  text not null,
  type                  text not null check (type in ('discount','coupon','bundle')),
  discount_value        integer not null,
  discount_type         text not null check (discount_type in ('percent','fixed')),
  min_order_amount      integer,
  max_discount          integer,
  start_date            date not null,
  end_date              date not null,
  usage_limit           integer,
  used_count            integer not null default 0,
  is_active             boolean not null default true,
  applicable_product_ids uuid[] not null default '{}',
  created_at            timestamptz not null default now_utc()
);

-- ── 10. 點數紀錄 ────────────────────────────────────────────

create table points_log (
  id            uuid primary key default uuid_generate_v4(),
  member_id     uuid not null references members(id),
  delta         integer not null,
  balance_after integer not null,
  source        text not null check (source in (
    'grooming', 'vet', 'order', 'redemption', 'admin_adjust', 'expiry'
  )),
  ref_id        uuid,
  note          text,
  created_at    timestamptz not null default now_utc()
);

create index points_log_member_idx on points_log(member_id);
create index points_log_created_idx on points_log(created_at desc);

-- ── 11. 文件收件匣 ──────────────────────────────────────────

create table documents (
  id          uuid primary key default uuid_generate_v4(),
  member_id   uuid not null references members(id),
  pet_id      uuid references pets(id),
  type        text not null check (type in (
    'prescription', 'receipt', 'contract', 'report', 'other'
  )),
  title       text not null,
  url         text not null,
  file_size   integer,
  is_read     boolean not null default false,
  source_type text check (source_type in ('grooming','vet','order')),
  source_id   uuid,
  created_at  timestamptz not null default now_utc()
);

create index documents_member_idx on documents(member_id);
create index documents_unread_idx on documents(member_id, is_read) where not is_read;

-- ── 12. 通知 ────────────────────────────────────────────────

create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  member_id   uuid not null references members(id),
  type        text not null check (type in (
    'appointment_reminder', 'doc_received', 'order_update',
    'health_alert', 'promo', 'topup_confirm', 'service_complete'
  )),
  title       text not null,
  body        text not null,
  is_read     boolean not null default false,
  action_url  text,
  sent_via    text[] not null default '{}',
  created_at  timestamptz not null default now_utc()
);

create index notifications_member_idx on notifications(member_id);
create index notifications_unread_idx on notifications(member_id, is_read) where not is_read;

-- ── 13. AIoT 裝置與健康數據 ────────────────────────────────

create table iot_devices (
  id            uuid primary key default uuid_generate_v4(),
  pet_id        uuid not null references pets(id) on delete cascade,
  member_id     uuid not null references members(id),
  name          text not null,
  type          text not null check (type in (
    'camera', 'glucose', 'bp_monitor', 'thermometer', 'scale'
  )),
  device_serial text unique,
  status        text not null default 'offline'
                check (status in ('online','offline','error')),
  battery_level integer check (battery_level between 0 and 100),
  firmware_ver  text,
  last_seen_at  timestamptz,
  stream_url    text,
  created_at    timestamptz not null default now_utc()
);

create table health_data (
  id          uuid primary key default uuid_generate_v4(),
  pet_id      uuid not null references pets(id) on delete cascade,
  device_id   uuid references iot_devices(id),
  metric      text not null check (metric in (
    'weight', 'blood_sugar', 'bp_systolic', 'bp_diastolic',
    'heart_rate', 'temperature', 'activity'
  )),
  value       numeric not null,
  unit        text not null,
  recorded_at timestamptz not null default now_utc(),
  note        text
);

create index health_data_pet_metric_idx on health_data(pet_id, metric, recorded_at desc);

-- ── 14. Storage Buckets ──────────────────────────────────────

insert into storage.buckets (id, name, public) values
  ('contracts',     'contracts',      false),
  ('receipts',      'receipts',       false),
  ('prescriptions', 'prescriptions',  false),
  ('reports',       'reports',        false),
  ('pet-photos',    'pet-photos',     true),
  ('product-images','product-images', true);

create policy "documents_owner_only" on storage.objects
  for select using (
    bucket_id in ('contracts','receipts','prescriptions','reports') and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 15. Realtime ────────────────────────────────────────────

alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table notifications;

create view queue_status as
select
  a.id,
  a.member_id,
  m.name   as member_name,
  a.pet_id,
  p.name   as pet_name,
  p.breed  as pet_breed,
  p.allergies,
  a.status,
  a.groomer_id,
  a.scheduled_time,
  a.store_id
from appointments a
join members m on m.id = a.member_id
join pets    p on p.id = a.pet_id
where a.status in ('pending','confirmed','checked_in');

-- ── 16. 業務邏輯 Functions ──────────────────────────────────

-- 儲值（含贈送）
create or replace function process_topup(
  p_member_id      uuid,
  p_store_id       uuid,
  p_amount         integer,
  p_payment_method text,
  p_card_last4     text default null
) returns uuid language plpgsql security definer as $$
declare
  v_bonus       integer := 0;
  v_tier        jsonb;
  v_new_balance integer;
  v_tx_id       uuid;
begin
  select topup_tiers into v_tier
  from store_settings where store_id = p_store_id;

  select coalesce(max((t->>'bonus')::integer), 0) into v_bonus
  from jsonb_array_elements(v_tier) t
  where (t->>'topup')::integer <= p_amount;

  update members
  set platform_balance = platform_balance + p_amount + v_bonus
  where id = p_member_id
  returning platform_balance into v_new_balance;

  insert into transactions (
    member_id, store_id, type, total_amount, card_amount,
    balance_after, points_after, payment_method, card_last4, ref_type
  )
  select
    p_member_id, p_store_id, 'topup', p_amount, p_amount,
    v_new_balance, points, p_payment_method, p_card_last4, null
  from members where id = p_member_id
  returning id into v_tx_id;

  if v_bonus > 0 then
    insert into transactions (
      member_id, store_id, type, total_amount, balance_after, points_after, note
    )
    select
      p_member_id, p_store_id, 'topup_bonus', v_bonus,
      v_new_balance, points,
      format('儲值 NT$%s 贈送 NT$%s', p_amount, v_bonus)
    from members where id = p_member_id;
  end if;

  return v_tx_id;
end; $$;

-- 服務結帳（美容/看診）
create or replace function process_service_payment(
  p_member_id      uuid,
  p_store_id       uuid,
  p_total_amount   integer,
  p_balance_to_use integer,
  p_card_amount    integer,
  p_ref_type       text,
  p_ref_id         uuid
) returns uuid language plpgsql security definer as $$
declare
  v_member         members%rowtype;
  v_max_offset     integer;
  v_max_offset_pct integer;
  v_new_balance    integer;
  v_points_earned  integer;
  v_points_rate    numeric;
  v_tx_id          uuid;
begin
  select * into v_member from members where id = p_member_id for update;

  select balance_offset_max_pct, points_rate
  into v_max_offset_pct, v_points_rate
  from store_settings where store_id = p_store_id;

  v_max_offset := (p_total_amount * v_max_offset_pct / 100)::integer;
  if p_balance_to_use > v_max_offset then
    raise exception '折抵金額超過上限（最多 %）', v_max_offset;
  end if;

  if p_balance_to_use > v_member.platform_balance then
    raise exception '儲值餘額不足';
  end if;

  if p_balance_to_use + p_card_amount != p_total_amount then
    raise exception '付款金額不符';
  end if;

  v_points_earned := floor(p_card_amount * v_points_rate)::integer;

  update members
  set
    platform_balance = platform_balance - p_balance_to_use,
    points = points + v_points_earned
  where id = p_member_id
  returning platform_balance into v_new_balance;

  insert into transactions (
    member_id, store_id, type,
    total_amount, balance_used, card_amount,
    balance_after, points_after,
    payment_method, ref_type, ref_id
  )
  select
    p_member_id, p_store_id, 'service_payment',
    p_total_amount, p_balance_to_use, p_card_amount,
    v_new_balance, points,
    case when p_balance_to_use > 0 and p_card_amount > 0 then 'mixed'
         when p_balance_to_use > 0 then 'balance'
         else 'card' end,
    p_ref_type, p_ref_id
  from members where id = p_member_id
  returning id into v_tx_id;

  if v_points_earned > 0 then
    insert into points_log (member_id, delta, balance_after, source, ref_id)
    select p_member_id, v_points_earned, points, p_ref_type, p_ref_id
    from members where id = p_member_id;
  end if;

  return v_tx_id;
end; $$;

-- 點數折抵商城訂單
create or replace function process_order_payment(
  p_member_id     uuid,
  p_order_id      uuid,
  p_total_amount  integer,
  p_points_to_use integer,
  p_card_amount   integer
) returns uuid language plpgsql security definer as $$
declare
  v_member     members%rowtype;
  v_new_points integer;
  v_tx_id      uuid;
begin
  select * into v_member from members where id = p_member_id for update;

  if p_points_to_use > v_member.points then
    raise exception '點數不足';
  end if;

  if p_points_to_use + p_card_amount != p_total_amount then
    raise exception '付款金額不符';
  end if;

  update members
  set points = points - p_points_to_use
  where id = p_member_id
  returning points into v_new_points;

  insert into transactions (
    member_id, type, total_amount, points_used, card_amount,
    balance_after, points_after, payment_method, ref_type, ref_id
  )
  select
    p_member_id, 'order_payment', p_total_amount, p_points_to_use, p_card_amount,
    platform_balance, v_new_points,
    case when p_points_to_use > 0 and p_card_amount > 0 then 'mixed'
         when p_points_to_use > 0 then 'points'
         else 'card' end,
    'order', p_order_id
  from members where id = p_member_id
  returning id into v_tx_id;

  if p_points_to_use > 0 then
    insert into points_log (member_id, delta, balance_after, source, ref_id)
    values (p_member_id, -p_points_to_use, v_new_points, 'redemption', p_order_id);
  end if;

  return v_tx_id;
end; $$;

-- ── 17. Tier 自動升級 Trigger ───────────────────────────────

create or replace function auto_upgrade_tier()
returns trigger language plpgsql as $$
declare
  v_total_spent integer;
begin
  select coalesce(sum(total_amount), 0) into v_total_spent
  from transactions
  where member_id = new.member_id
    and type in ('service_payment', 'order_payment');

  update members set tier =
    case
      when v_total_spent >= 30000 then 'gold'
      when v_total_spent >= 10000 then 'silver'
      else 'basic'
    end
  where id = new.member_id;

  return new;
end; $$;

create trigger auto_upgrade_tier_on_transaction
  after insert on transactions
  for each row
  when (new.type in ('service_payment', 'order_payment'))
  execute function auto_upgrade_tier();
