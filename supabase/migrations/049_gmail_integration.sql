-- ============================================================
-- 049_gmail_integration.sql — 1-Click Gmail / Google Workspace
-- ============================================================

CREATE TABLE IF NOT EXISTS gmail_configs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  connected_email   text NOT NULL,
  refresh_token     text NOT NULL,           -- AES-256-GCM encrypted Google OAuth refresh token
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gmail_configs ENABLE ROW LEVEL SECURITY;

-- SELECT: Any member of the account can check if Gmail is connected
DROP POLICY IF EXISTS gmail_configs_select ON gmail_configs;
CREATE POLICY gmail_configs_select ON gmail_configs FOR SELECT
  USING (is_account_member(account_id));

-- INSERT: Admin+ only
DROP POLICY IF EXISTS gmail_configs_insert ON gmail_configs;
CREATE POLICY gmail_configs_insert ON gmail_configs FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

-- UPDATE: Admin+ only
DROP POLICY IF EXISTS gmail_configs_update ON gmail_configs;
CREATE POLICY gmail_configs_update ON gmail_configs FOR UPDATE
  USING (is_account_member(account_id, 'admin'));

-- DELETE: Admin+ only
DROP POLICY IF EXISTS gmail_configs_delete ON gmail_configs;
CREATE POLICY gmail_configs_delete ON gmail_configs FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_gmail_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gmail_configs_updated_at ON gmail_configs;
CREATE TRIGGER gmail_configs_updated_at
  BEFORE UPDATE ON gmail_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gmail_configs_updated_at();
