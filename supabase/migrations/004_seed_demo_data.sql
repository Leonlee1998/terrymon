-- TerryMon demo data for linked Supabase project.
-- Fixed IDs keep local app environment files stable across resets.

insert into stores (id, type, owner_type, name, address, phone, line_id, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'grooming', 'platform', 'TerryMon 寵物美容旗艦店', '台北市信義區松仁路 88 號', '02-2711-5566', '@terrymon-grooming', true),
  ('22222222-2222-2222-2222-222222222222', 'vet', 'platform', 'TerryMon 聯盟動物醫院', '台北市大安區復興南路 120 號', '02-2700-8899', '@terrymon-vet', true)
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  phone = excluded.phone,
  line_id = excluded.line_id,
  is_active = excluded.is_active;

insert into store_settings (store_id, topup_tiers, balance_offset_max_pct, payment_methods, points_rate)
values
  ('11111111-1111-1111-1111-111111111111', '[{"topup":3000,"bonus":300},{"topup":5000,"bonus":600},{"topup":10000,"bonus":1500}]', 100, '{balance,card,cash}', 1.0),
  ('22222222-2222-2222-2222-222222222222', '[{"topup":3000,"bonus":300},{"topup":5000,"bonus":600}]', 70, '{balance,card,cash}', 1.0)
on conflict (store_id) do update set
  topup_tiers = excluded.topup_tiers,
  balance_offset_max_pct = excluded.balance_offset_max_pct,
  payment_methods = excluded.payment_methods,
  points_rate = excluded.points_rate,
  updated_at = now_utc();

insert into groomers (id, store_id, name, is_active)
values
  ('11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111111', 'Mika', true),
  ('11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111111', 'Leo', true)
on conflict (id) do update set
  name = excluded.name,
  is_active = excluded.is_active;

insert into grooming_services (id, store_id, name, description, price, duration, is_addon, is_enabled, sort_order)
values
  ('11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111111', '小型犬基礎洗澡', '洗澡、吹整、耳朵清潔、指甲修剪', 900, 90, false, true, 10),
  ('11111111-1111-1111-1111-111111111202', '11111111-1111-1111-1111-111111111111', '貓咪精緻洗護', '低壓洗護、梳毛、基礎清潔', 1600, 120, false, true, 20),
  ('11111111-1111-1111-1111-111111111203', '11111111-1111-1111-1111-111111111111', '牙齒清潔加購', '溫和口腔清潔與口氣護理', 300, 15, true, true, 30)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  duration = excluded.duration,
  is_addon = excluded.is_addon,
  is_enabled = excluded.is_enabled,
  sort_order = excluded.sort_order;

insert into vendors (id, store_name, owner_name, email, phone, description, status, commission_rate)
values
  ('33333333-3333-3333-3333-333333333333', 'TerryMon 精選商城', 'Terry Chen', 'vendor@terrymon.com', '0912-345-678', '寵物日常食品、護理與外出用品選物店。', 'approved', 5.0)
on conflict (id) do update set
  store_name = excluded.store_name,
  owner_name = excluded.owner_name,
  email = excluded.email,
  phone = excluded.phone,
  description = excluded.description,
  status = excluded.status,
  commission_rate = excluded.commission_rate;

insert into members (id, name, phone, email, platform_balance, points, tier, home_store_id)
values
  ('44444444-4444-4444-4444-444444444444', 'Demo 會員', '0911-222-333', 'demo@terrymon.com', 5000, 1200, 'gold', '11111111-1111-1111-1111-111111111111')
on conflict (id) do update set
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email,
  platform_balance = excluded.platform_balance,
  points = excluded.points,
  tier = excluded.tier,
  home_store_id = excluded.home_store_id;

insert into pets (id, member_id, name, species, breed, birth_date, weight, allergies, notes, is_active)
values
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Money', 'dog', '柴犬', '2021-04-18', 11.6, '{雞肉}', '洗澡時需要低風速吹整。', true),
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Luna', 'cat', '英國短毛貓', '2020-09-02', 5.2, '{}', '容易緊張，建議預留安靜空間。', true)
on conflict (id) do update set
  name = excluded.name,
  species = excluded.species,
  breed = excluded.breed,
  birth_date = excluded.birth_date,
  weight = excluded.weight,
  allergies = excluded.allergies,
  notes = excluded.notes,
  is_active = excluded.is_active;

insert into products (id, vendor_id, name, category, subcategory, price, original_price, cost, stock, image_url, images, description, specs, tags, status, total_sold, rating, review_count)
values
  ('33333333-3333-3333-3333-333333333101', '33333333-3333-3333-3333-333333333333', '低敏鮭魚犬糧 2kg', 'food', 'dog-food', 980, 1180, 520, 42, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800', '{"https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800"}', '單一蛋白配方，適合敏感腸胃犬隻。', '{"weight":"2kg","flavor":"salmon"}', '{低敏,犬糧,鮭魚}', 'active', 128, 4.8, 36),
  ('33333333-3333-3333-3333-333333333102', '33333333-3333-3333-3333-333333333333', '貓咪木天蓼潔牙棒', 'care', 'cat-care', 260, 320, 90, 86, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800', '{"https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800"}', '日常啃咬與潔牙輔助用品。', '{"count":"12 sticks"}', '{貓咪,潔牙,木天蓼}', 'active', 75, 4.6, 18),
  ('33333333-3333-3333-3333-333333333103', '33333333-3333-3333-3333-333333333333', '外出摺疊飲水杯', 'accessory', 'travel', 390, 450, 140, 31, 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=800', '{"https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=800"}', '外出散步、旅行可快速收納。', '{"capacity":"350ml"}', '{外出,飲水,散步}', 'active', 54, 4.7, 22)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  subcategory = excluded.subcategory,
  price = excluded.price,
  original_price = excluded.original_price,
  cost = excluded.cost,
  stock = excluded.stock,
  image_url = excluded.image_url,
  images = excluded.images,
  description = excluded.description,
  specs = excluded.specs,
  tags = excluded.tags,
  status = excluded.status,
  total_sold = excluded.total_sold,
  rating = excluded.rating,
  review_count = excluded.review_count,
  updated_at = now_utc();

insert into orders (id, member_id, recipient_name, recipient_phone, address, subtotal, shipping_fee, discount_amount, total_price, status, tracking_number, shipped_at, note)
values
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Demo 會員', '0911-222-333', '台北市信義區松仁路 88 號', 1240, 80, 0, 1320, 'paid', null, null, 'Demo order')
on conflict (id) do update set
  status = excluded.status,
  tracking_number = excluded.tracking_number,
  shipped_at = excluded.shipped_at,
  note = excluded.note,
  updated_at = now_utc();

insert into order_items (id, order_id, product_id, vendor_id, product_name, price, qty, subtotal, image_url)
values
  ('77777777-7777-7777-7777-777777777701', '77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333101', '33333333-3333-3333-3333-333333333333', '低敏鮭魚犬糧 2kg', 980, 1, 980, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800'),
  ('77777777-7777-7777-7777-777777777702', '77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333102', '33333333-3333-3333-3333-333333333333', '貓咪木天蓼潔牙棒', 260, 1, 260, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800')
on conflict (id) do update set
  price = excluded.price,
  qty = excluded.qty,
  subtotal = excluded.subtotal,
  image_url = excluded.image_url;

insert into promotions (id, vendor_id, name, type, discount_value, discount_type, min_order_amount, max_discount, start_date, end_date, usage_limit, used_count, is_active)
values
  ('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', '新會員滿千折百', 'coupon', 100, 'fixed', 1000, 100, current_date, current_date + interval '90 days', 500, 12, true)
on conflict (id) do update set
  name = excluded.name,
  discount_value = excluded.discount_value,
  discount_type = excluded.discount_type,
  min_order_amount = excluded.min_order_amount,
  max_discount = excluded.max_discount,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  usage_limit = excluded.usage_limit,
  used_count = excluded.used_count,
  is_active = excluded.is_active;

insert into appointments (id, member_id, pet_id, store_id, type, scheduled_date, scheduled_time, end_time, duration_min, source, status, groomer_id, notes)
values
  ('99999999-9999-9999-9999-999999999901', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'grooming', current_date, '14:00', '15:30', 90, 'webapp', 'confirmed', '11111111-1111-1111-1111-111111111101', '小型犬基礎洗澡'),
  ('99999999-9999-9999-9999-999999999902', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'vet', current_date + interval '1 day', '10:30', '11:00', 30, 'webapp', 'confirmed', null, '年度健康檢查')
on conflict (id) do update set
  scheduled_date = excluded.scheduled_date,
  scheduled_time = excluded.scheduled_time,
  end_time = excluded.end_time,
  duration_min = excluded.duration_min,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = now_utc();

insert into notifications (id, member_id, type, title, body, is_read, action_url, sent_via)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'appointment_reminder', '預約提醒', 'Money 今天 14:00 有美容預約。', false, '/appointments', '{app}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'order_update', '訂單已付款', '您的商城訂單已成立，等待出貨。', false, '/shop/orders/77777777-7777-7777-7777-777777777777', '{app}')
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  is_read = excluded.is_read,
  action_url = excluded.action_url,
  sent_via = excluded.sent_via;
