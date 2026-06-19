-- ══════════════════════════════════════════════════════════════
-- 020_appointment_booking.sql
-- Phase 1：WebApp 預約 + POS 排程共用系統
-- ══════════════════════════════════════════════════════════════

-- 1. appointments 補欄位
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS main_service_id    uuid REFERENCES grooming_services(id),
  ADD COLUMN IF NOT EXISTS addon_service_ids  uuid[]       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_price    integer,
  ADD COLUMN IF NOT EXISTS photo_url          text,
  ADD COLUMN IF NOT EXISTS confirmed_at       timestamptz,
  ADD COLUMN IF NOT EXISTS checked_in_at      timestamptz,
  ADD COLUMN IF NOT EXISTS service_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at       timestamptz,
  ADD COLUMN IF NOT EXISTS contract_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason      text,
  ADD COLUMN IF NOT EXISTS deposit_amount     integer,
  ADD COLUMN IF NOT EXISTS deposit_paid_at    timestamptz;

-- 2. 更新 status CHECK（加入 rejected / in_service）
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN (
    'pending','confirmed','rejected',
    'checked_in','in_service','completed',
    'cancelled','no_show'
  ));

-- 3. 更新 source CHECK（加入 pos）
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_source_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_source_check
  CHECK (source IN ('kiosk','webapp','pos','line','phone'));

-- 4. groomer_shifts（美容師班表）
CREATE TABLE IF NOT EXISTS groomer_shifts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  groomer_id  uuid        NOT NULL REFERENCES groomers(id) ON DELETE CASCADE,
  store_id    uuid        NOT NULL REFERENCES stores(id),
  work_date   date        NOT NULL,
  start_time  time        NOT NULL DEFAULT '09:00',
  end_time    time        NOT NULL DEFAULT '18:00',
  is_day_off  boolean     NOT NULL DEFAULT false,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (groomer_id, work_date)
);

-- 5. store_booking_settings（各店預約設定）
CREATE TABLE IF NOT EXISTS store_booking_settings (
  store_id                   uuid         PRIMARY KEY REFERENCES stores(id),
  slot_interval_minutes      integer      NOT NULL DEFAULT 30,
  max_advance_days           integer      NOT NULL DEFAULT 30,
  cancel_deadline_hours      integer      NOT NULL DEFAULT 24,
  deposit_rate               numeric(4,2) NOT NULL DEFAULT 0.30,
  deposit_fixed_amount       integer,
  no_show_full_charge        boolean      NOT NULL DEFAULT true,
  buffer_minutes             integer      NOT NULL DEFAULT 15,
  rejection_message_template text         NOT NULL DEFAULT '非常抱歉，您所選的時段目前無法安排，請選擇其他時段或聯繫我們。',
  updated_at                 timestamptz  NOT NULL DEFAULT now()
);

-- Seed 既有美容店
INSERT INTO store_booking_settings (store_id)
SELECT id FROM stores WHERE type = 'grooming'
ON CONFLICT DO NOTHING;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_appt_store_date     ON appointments(store_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appt_groomer_date   ON appointments(groomer_id, scheduled_date) WHERE groomer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appt_member         ON appointments(member_id);
CREATE INDEX IF NOT EXISTS idx_appt_status         ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_groomer_shifts_date ON groomer_shifts(store_id, work_date);

-- 7. RLS：會員可建立自己的 pending 預約（webapp）
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_insert_member" ON appointments;
CREATE POLICY "appointments_insert_member"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (
    member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
    AND status = 'pending'
    AND source = 'webapp'
  );

-- 8. get_available_slots：查詢指定店/日期/服務的可用時段
CREATE OR REPLACE FUNCTION get_available_slots(
  p_store_id   uuid,
  p_date       date,
  p_service_id uuid,
  p_groomer_id uuid DEFAULT NULL
)
RETURNS TABLE (slot_time time, groomer_id uuid, groomer_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_duration integer; v_buffer integer; v_interval integer; v_total integer;
BEGIN
  SELECT COALESCE(duration, 60) INTO v_duration FROM grooming_services WHERE id = p_service_id;
  v_duration := COALESCE(v_duration, 60);
  SELECT COALESCE(sbs.buffer_minutes,15), COALESCE(sbs.slot_interval_minutes,30)
  INTO v_buffer, v_interval
  FROM store_booking_settings sbs WHERE sbs.store_id = p_store_id;
  v_buffer := COALESCE(v_buffer,15); v_interval := COALESCE(v_interval,30);
  v_total := v_duration + v_buffer;

  RETURN QUERY
  SELECT s.slot::time, wg.groomer_id, wg.gname
  FROM (
    SELECT gs.groomer_id, g.name AS gname, gs.start_time, gs.end_time
    FROM groomer_shifts gs
    JOIN groomers g ON g.id = gs.groomer_id
    WHERE gs.store_id = p_store_id AND gs.work_date = p_date AND gs.is_day_off = false
      AND (p_groomer_id IS NULL OR gs.groomer_id = p_groomer_id)
  ) wg
  CROSS JOIN LATERAL (
    SELECT generate_series(
      (p_date + wg.start_time)::timestamp,
      (p_date + wg.end_time)::timestamp - (v_total || ' minutes')::interval,
      (v_interval || ' minutes')::interval
    ) AS slot
  ) s
  WHERE NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.store_id = p_store_id AND a.groomer_id = wg.groomer_id
      AND a.scheduled_date = p_date
      AND a.status IN ('pending','confirmed','checked_in','in_service')
      AND (p_date + a.scheduled_time)::timestamp < (s.slot + (v_total||' minutes')::interval)
      AND (p_date + COALESCE(a.end_time,
           (a.scheduled_time+((COALESCE(a.duration_min,60)+v_buffer)||' minutes')::interval)::time
           ))::timestamp > s.slot
  )
  ORDER BY s.slot, wg.groomer_id;
END; $$;

-- 9. create_appointment：原子建立預約（防重複搶位）
CREATE OR REPLACE FUNCTION create_appointment(
  p_member_id  uuid, p_pet_id uuid, p_store_id uuid, p_service_id uuid,
  p_addon_ids  uuid[] DEFAULT '{}', p_date date DEFAULT NULL,
  p_time time DEFAULT NULL, p_groomer_id uuid DEFAULT NULL,
  p_notes text DEFAULT '', p_photo_url text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_duration integer; v_svc_price integer; v_addon_price integer := 0;
  v_buffer integer; v_deposit_rate numeric; v_deposit_fixed integer;
  v_est_price integer; v_deposit integer; v_end_time time; v_id uuid;
BEGIN
  SELECT duration, price INTO v_duration, v_svc_price
  FROM grooming_services WHERE id = p_service_id AND is_enabled = true AND is_addon = false;
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_SERVICE'; END IF;

  SELECT COALESCE(SUM(price),0) INTO v_addon_price
  FROM grooming_services WHERE id = ANY(p_addon_ids) AND is_addon = true AND is_enabled = true;
  v_est_price := v_svc_price + v_addon_price;

  SELECT COALESCE(buffer_minutes,15), deposit_rate, deposit_fixed_amount
  INTO v_buffer, v_deposit_rate, v_deposit_fixed
  FROM store_booking_settings WHERE store_id = p_store_id;
  v_buffer := COALESCE(v_buffer,15);
  v_end_time := (p_time + ((v_duration + v_buffer) || ' minutes')::interval)::time;
  v_deposit := CASE WHEN v_deposit_fixed IS NOT NULL THEN v_deposit_fixed
               ELSE CEIL(v_est_price * COALESCE(v_deposit_rate, 0.30)) END;

  IF p_groomer_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM appointments
      WHERE store_id = p_store_id AND groomer_id = p_groomer_id
        AND scheduled_date = p_date AND status IN ('pending','confirmed','checked_in','in_service')
        AND (p_date + scheduled_time)::timestamp < (p_date + v_end_time)::timestamp
        AND (p_date + COALESCE(end_time,
             (scheduled_time+((COALESCE(duration_min,60)+v_buffer)||' minutes')::interval)::time
             ))::timestamp > (p_date + p_time)::timestamp
      FOR UPDATE
    ) THEN RAISE EXCEPTION 'SLOT_CONFLICT'; END IF;
  END IF;

  INSERT INTO appointments (
    member_id, pet_id, store_id, type, source, status,
    scheduled_date, scheduled_time, end_time, duration_min,
    groomer_id, main_service_id, addon_service_ids,
    estimated_price, deposit_amount, notes, photo_url
  ) VALUES (
    p_member_id, p_pet_id, p_store_id, 'grooming', 'webapp', 'pending',
    p_date, p_time, v_end_time, v_duration,
    p_groomer_id, p_service_id, p_addon_ids,
    v_est_price, v_deposit, COALESCE(p_notes,''), p_photo_url
  ) RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

-- 10. confirm_appointment / reject_appointment / checkin_appointment
--     start_service_appointment / cancel_appointment
CREATE OR REPLACE FUNCTION confirm_appointment(
  p_id uuid, p_groomer_id uuid DEFAULT NULL, p_duration_min integer DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_store uuid; v_buf integer;
BEGIN
  SELECT store_id INTO v_store FROM appointments WHERE id = p_id AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_STATE'; END IF;
  SELECT COALESCE(buffer_minutes,15) INTO v_buf FROM store_booking_settings WHERE store_id = v_store;
  UPDATE appointments SET
    status = 'confirmed', confirmed_at = now(),
    groomer_id   = COALESCE(p_groomer_id, groomer_id),
    duration_min = COALESCE(p_duration_min, duration_min),
    end_time     = CASE WHEN p_duration_min IS NOT NULL
                   THEN (scheduled_time+((p_duration_min+COALESCE(v_buf,15))||' minutes')::interval)::time
                   ELSE end_time END,
    updated_at = now()
  WHERE id = p_id;
END; $$;

CREATE OR REPLACE FUNCTION reject_appointment(p_id uuid, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tpl text; v_store uuid;
BEGIN
  SELECT store_id INTO v_store FROM appointments WHERE id = p_id AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_STATE'; END IF;
  SELECT rejection_message_template INTO v_tpl FROM store_booking_settings WHERE store_id = v_store;
  UPDATE appointments SET status = 'rejected', cancelled_at = now(),
    cancel_reason = COALESCE(p_reason, v_tpl), updated_at = now()
  WHERE id = p_id;
END; $$;

CREATE OR REPLACE FUNCTION checkin_appointment(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE appointments SET status = 'checked_in', checked_in_at = now(),
    contract_signed_at = now(), updated_at = now()
  WHERE id = p_id AND status = 'confirmed';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_STATE'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION start_service_appointment(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE appointments SET status = 'in_service', service_started_at = now(), updated_at = now()
  WHERE id = p_id AND status = 'checked_in';
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_STATE'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION cancel_appointment(p_id uuid, p_reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_appt record; v_hours numeric; v_forfeit boolean := false;
BEGIN
  SELECT a.*, sbs.cancel_deadline_hours INTO v_appt
  FROM appointments a
  LEFT JOIN store_booking_settings sbs ON sbs.store_id = a.store_id
  WHERE a.id = p_id AND a.status IN ('pending','confirmed');
  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_STATE'; END IF;
  v_hours := EXTRACT(EPOCH FROM (
    (v_appt.scheduled_date + v_appt.scheduled_time)::timestamp - now()
  )) / 3600.0;
  IF v_hours < COALESCE(v_appt.cancel_deadline_hours, 24) THEN v_forfeit := true; END IF;
  UPDATE appointments SET status = 'cancelled', cancelled_at = now(),
    cancel_reason = COALESCE(p_reason,'飼主取消'), updated_at = now()
  WHERE id = p_id;
  RETURN jsonb_build_object(
    'deposit_forfeited', v_forfeit,
    'amount', CASE WHEN v_forfeit THEN COALESCE(v_appt.deposit_amount,0) ELSE 0 END
  );
END; $$;
