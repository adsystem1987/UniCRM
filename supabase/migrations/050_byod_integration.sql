-- ============================================================
-- 050_byod_integration.sql — Bring Your Own Database (BYOD)
-- ============================================================

CREATE TABLE IF NOT EXISTS byod_configs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id          uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  supabase_url        text NOT NULL,
  anon_key            text NOT NULL,                 -- AES-256 encrypted public anon key
  service_role_key    text,                          -- AES-256 encrypted service role key (optional)
  is_active           boolean NOT NULL DEFAULT true,
  schema_initialized  boolean NOT NULL DEFAULT false,
  last_tested_at      timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE byod_configs ENABLE ROW LEVEL SECURITY;

-- SELECT: Account members can check if BYOD is active
DROP POLICY IF EXISTS byod_configs_select ON byod_configs;
CREATE POLICY byod_configs_select ON byod_configs FOR SELECT
  USING (is_account_member(account_id));

-- INSERT: Admin+ only
DROP POLICY IF EXISTS byod_configs_insert ON byod_configs;
CREATE POLICY byod_configs_insert ON byod_configs FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

-- UPDATE: Admin+ only
DROP POLICY IF EXISTS byod_configs_update ON byod_configs;
CREATE POLICY byod_configs_update ON byod_configs FOR UPDATE
  USING (is_account_member(account_id, 'admin'));

-- DELETE: Admin+ only
DROP POLICY IF EXISTS byod_configs_delete ON byod_configs;
CREATE POLICY byod_configs_delete ON byod_configs FOR DELETE
  USING (is_account_member(account_id, 'admin'));

CREATE OR REPLACE FUNCTION public.update_byod_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS byod_configs_updated_at ON byod_configs;
CREATE TRIGGER byod_configs_updated_at
  BEFORE UPDATE ON byod_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_byod_configs_updated_at();
