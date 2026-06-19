-- migration: 023_rpc_auth_uid
-- created: 2026-06-18
-- description: create_appointment / cancel_appointment 改用 auth.uid() 查 member，移除 p_member_id 參數，安全性由 DB 保證

CREATE OR REPLACE FUNCTION create_appointment(
  p_pet_id     uuid,
  p_store_id   uuid,
  p_service_id uuid,
  p_addon_ids  uuid[]  DEFAULT '{}',
  p_date       date    DEFAULT NULL,
  p_time       time    DEFAULT NULL,
  p_groomer_id uuid    DEFAULT NULL,
  p_notes      text    DEFAULT '',
  p_photo_url  text    DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_member_id  uuid;
  v_duration   integer; v_svc_price integer; v_addon_price integer := 0;
  v_buffer     integer; v_deposit_rate numeric; v_deposit_fixed integer;
  v_est_price  integer; v_deposit integer; v_end_time time; v_id uuid;
BEGIN
  SELECT id INTO v_member_id FROM members WHERE supabase_uid = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

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
    v_member_id, p_pet_id, p_store_id, 'grooming', 'webapp', 'pending',
    p_date, p_time, v_end_time, v_duration,
    p_groomer_id, p_service_id, p_addon_ids,
    v_est_price, v_deposit, COALESCE(p_notes,''), p_photo_url
  ) RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION cancel_appointment(
  p_id     uuid,
  p_reason text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_member_id uuid; v_appt record; v_forfeit boolean := false; v_amount integer := 0;
BEGIN
  SELECT id INTO v_member_id FROM members WHERE supabase_uid = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  SELECT * INTO v_appt FROM appointments WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF v_appt.member_id != v_member_id THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF v_appt.status NOT IN ('pending','confirmed') THEN RAISE EXCEPTION 'INVALID_STATE'; END IF;

  IF v_appt.deposit_paid_at IS NOT NULL AND
     (v_appt.scheduled_date + v_appt.scheduled_time)::timestamp - NOW() < interval '24 hours'
  THEN
    v_forfeit := true;
    v_amount  := COALESCE(v_appt.deposit_amount, 0);
  END IF;

  UPDATE appointments
  SET status = 'cancelled', cancel_reason = p_reason, cancelled_at = NOW()
  WHERE id = p_id;

  RETURN jsonb_build_object('deposit_forfeited', v_forfeit, 'amount', v_amount);
END; $$;
