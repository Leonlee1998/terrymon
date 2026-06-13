-- Webapp-facing RLS policies for member app access.

create policy "members_insert_own" on members
  for insert
  with check (auth.uid() = supabase_uid);

create policy "members_update_own" on members
  for update
  using (auth.uid() = supabase_uid)
  with check (auth.uid() = supabase_uid);

alter table appointments enable row level security;
create policy "appointments_select_owner" on appointments
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "appointments_update_owner" on appointments
  for update using (
    member_id in (select id from members where supabase_uid = auth.uid())
  )
  with check (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "appointments_service_all" on appointments
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table grooming_records enable row level security;
create policy "grooming_records_select_owner" on grooming_records
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "grooming_records_service_all" on grooming_records
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table medical_records enable row level security;
create policy "medical_records_select_owner" on medical_records
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "medical_records_service_all" on medical_records
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table iot_devices enable row level security;
create policy "iot_devices_select_owner" on iot_devices
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "iot_devices_service_all" on iot_devices
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table health_data enable row level security;
create policy "health_data_select_pet_owner" on health_data
  for select using (
    pet_id in (
      select p.id
      from pets p
      join members m on m.id = p.member_id
      where m.supabase_uid = auth.uid()
    )
  );
create policy "health_data_service_all" on health_data
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table products enable row level security;
create policy "products_select_active" on products
  for select using (status = 'active');
create policy "products_service_all" on products
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table orders enable row level security;
create policy "orders_select_owner" on orders
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "orders_insert_owner" on orders
  for insert with check (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "orders_update_owner" on orders
  for update using (
    member_id in (select id from members where supabase_uid = auth.uid())
  )
  with check (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "orders_service_all" on orders
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table order_items enable row level security;
create policy "order_items_select_owner" on order_items
  for select using (
    order_id in (
      select o.id
      from orders o
      join members m on m.id = o.member_id
      where m.supabase_uid = auth.uid()
    )
  );
create policy "order_items_insert_owner" on order_items
  for insert with check (
    order_id in (
      select o.id
      from orders o
      join members m on m.id = o.member_id
      where m.supabase_uid = auth.uid()
    )
  );
create policy "order_items_service_all" on order_items
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table documents enable row level security;
create policy "documents_select_owner" on documents
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "documents_update_owner" on documents
  for update using (
    member_id in (select id from members where supabase_uid = auth.uid())
  )
  with check (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "documents_service_all" on documents
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table notifications enable row level security;
create policy "notifications_select_owner" on notifications
  for select using (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "notifications_update_owner" on notifications
  for update using (
    member_id in (select id from members where supabase_uid = auth.uid())
  )
  with check (
    member_id in (select id from members where supabase_uid = auth.uid())
  );
create policy "notifications_service_all" on notifications
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

