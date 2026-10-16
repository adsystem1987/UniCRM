-- ============================================================
-- 048_gdrive_integration.sql — Google Drive Bring-Your-Own-Storage (BYOS)
-- ============================================================

CREATE TABLE IF NOT EXISTS gdrive_configs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  connected_email   text NOT NULL,
  refresh_token     text NOT NULL,           -- AES-256-GCM encrypted Google OAuth refresh token
  target_folder     text NOT NULL DEFAULT '/DFY UniCRM Attachments',
  folder_id         text,                    -- Google Drive folder ID
  mirror_inbound    boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gdrive_configs ENABLE ROW LEVEL SECURITY;

-- SELECT: Any member of the account can check if Drive is connected
DROP POLICY IF EXISTS gdrive_configs_select ON gdrive_configs;
CREATE POLICY gdrive_configs_select ON gdrive_configs FOR SELECT
  USING (is_account_member(account_id));

-- INSERT: Admin+ only
DROP POLICY IF EXISTS gdrive_configs_insert ON gdrive_configs;
CREATE POLICY gdrive_configs_insert ON gdrive_configs FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

-- UPDATE: Admin+ only
DROP POLICY IF EXISTS gdrive_configs_update ON gdrive_configs;
CREATE POLICY gdrive_configs_update ON gdrive_configs FOR UPDATE
  USING (is_account_member(account_id, 'admin'));

-- DELETE: Admin+ only
DROP POLICY IF EXISTS gdrive_configs_delete ON gdrive_configs;
CREATE POLICY gdrive_configs_delete ON gdrive_configs FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_gdrive_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gdrive_configs_updated_at ON gdrive_configs;
CREATE TRIGGER gdrive_configs_updated_at
  BEFORE UPDATE ON gdrive_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gdrive_configs_updated_at();
