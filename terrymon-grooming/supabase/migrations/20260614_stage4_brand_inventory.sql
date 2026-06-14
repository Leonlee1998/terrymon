-- Stage 4: 品牌商品 & POS 庫存
-- 品牌開通後，選商品 push 到指定門市建立 pos_inventory

-- 品牌商
CREATE TABLE IF NOT EXISTS brands (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  contact_name  text,
  contact_phone text,
  contact_email text,
  status      text        NOT NULL DEFAULT 'pending', -- pending | active | suspended
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 品牌商品目錄
CREATE TABLE IF NOT EXISTS brand_products (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id         uuid        NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  category         text,
  description      text,
  cost_price       numeric(10,2) NOT NULL DEFAULT 0,
  suggested_price  numeric(10,2),
  barcode          text,
  image_url        text,
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- POS 庫存（品牌 push 到指定門市）
CREATE TABLE IF NOT EXISTS pos_inventory (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           uuid        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  brand_id           uuid        NOT NULL REFERENCES brands(id),
  brand_product_id   uuid        NOT NULL REFERENCES brand_products(id),
  retail_price       numeric(10,2) NOT NULL,
  member_price       numeric(10,2),
  stock              int         NOT NULL DEFAULT 0,
  is_active          boolean     NOT NULL DEFAULT true,
  pushed_at          timestamptz NOT NULL DEFAULT now(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, brand_product_id)
);

-- Index for fast store inventory lookup
CREATE INDEX IF NOT EXISTS idx_pos_inventory_store ON pos_inventory(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_brand_products_brand ON brand_products(brand_id, is_active);

-- updated_at 自動更新 trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER brand_products_updated_at
  BEFORE UPDATE ON brand_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER pos_inventory_updated_at
  BEFORE UPDATE ON pos_inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
