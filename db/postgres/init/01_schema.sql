CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,           -- INSERT / UPDATE / DELETE
  row_data JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by TEXT
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION audit_trigger_fn() RETURNS TRIGGER AS $$
DECLARE payload JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    payload := to_jsonb(NEW);
  ELSIF (TG_OP = 'UPDATE') THEN
    payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSE
    payload := to_jsonb(OLD);
  END IF;

  INSERT INTO audit_log(table_name, action, row_data, changed_by)
  VALUES (TG_TABLE_NAME, TG_OP, payload, current_user);

  RETURN COALESCE(NEW, OLD);
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_audit_ins ON products;
DROP TRIGGER IF EXISTS trg_products_audit_upd ON products;
DROP TRIGGER IF EXISTS trg_products_audit_del ON products;

CREATE TRIGGER trg_products_audit_ins AFTER INSERT ON products
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER trg_products_audit_upd AFTER UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER trg_products_audit_del AFTER DELETE ON products
FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
