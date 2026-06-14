-- 實體美容店（可進駐的物理地點）
CREATE TABLE IF NOT EXISTS grooming_stores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  city        TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 測試店家資料
INSERT INTO grooming_stores (name, address, city) VALUES
  ('TerryMon 台北信義美容', '台北市信義區忠孝東路五段68號', '台北市'),
  ('TerryMon 台中旗艦美容', '台中市西屯區台灣大道三段301號', '台中市'),
  ('TerryMon 高雄左營美容', '高雄市左營區博愛二路366號', '高雄市')
ON CONFLICT DO NOTHING;

-- 品牌進駐申請（vendor → grooming_store）
CREATE TABLE IF NOT EXISTS store_placements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  store_id        UUID NOT NULL REFERENCES grooming_stores(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'terminated')),
  note            TEXT,
  admin_note      TEXT,
  listing_fee     NUMERIC(10,2) DEFAULT 0,
  commission_rate NUMERIC(4,2) DEFAULT 10,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vendor_id, store_id)
);

-- RLS
ALTER TABLE grooming_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grooming_stores_public_read" ON grooming_stores
  FOR SELECT USING (true);

CREATE POLICY "placements_public_read" ON store_placements
  FOR SELECT USING (true);
