-- Member handle: unique user-chosen ID, set once at onboarding, never changed
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS handle varchar(20) UNIQUE;

-- Index for fast uniqueness checks
CREATE UNIQUE INDEX IF NOT EXISTS members_handle_unique ON members (handle)
  WHERE handle IS NOT NULL;

-- Prevent UPDATE of handle once set (trigger-based immutability)
CREATE OR REPLACE FUNCTION lock_member_handle()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.handle IS NOT NULL AND NEW.handle IS DISTINCT FROM OLD.handle THEN
    RAISE EXCEPTION 'Member handle cannot be changed once set';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_member_handle ON members;
CREATE TRIGGER trg_lock_member_handle
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION lock_member_handle();
