-- ============================================================
-- 066_gdrive_multi_pool.sql — Multi-Google Drive Storage Pooling (9Drive Concept)
-- Enables pooling multiple Google accounts (e.g. 15GB + 15GB = 30GB)
-- ============================================================

-- 1. Create table for pooled storage accounts
CREATE TABLE IF NOT EXISTS gdrive_storage_nodes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id          uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  connected_email     text NOT NULL,
  refresh_token       text NOT NULL,           -- AES-256-GCM encrypted Google OAuth refresh token
  target_folder       text NOT NULL DEFAULT '/DFY UniCRM Attachments',
  folder_id           text,                    -- Google Drive folder ID
  storage_quota_bytes bigint DEFAULT 16106127360, -- 15 GB default
  storage_used_bytes  bigint DEFAULT 0,
  is_active           boolean NOT NULL DEFAULT true,
  priority_order      int NOT NULL DEFAULT 1,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, connected_email)
);

ALTER TABLE gdrive_storage_nodes ENABLE ROW LEVEL SECURITY;

-- SELECT: Any member of the account can see pooled drive status
DROP POLICY IF EXISTS gdrive_storage_nodes_select ON gdrive_storage_nodes;
CREATE POLICY gdrive_storage_nodes_select ON gdrive_storage_nodes FOR SELECT
  USING (is_account_member(account_id));

-- INSERT: Admin+ only
DROP POLICY IF EXISTS gdrive_storage_nodes_insert ON gdrive_storage_nodes;
CREATE POLICY gdrive_storage_nodes_insert ON gdrive_storage_nodes FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

-- UPDATE: Admin+ only
DROP POLICY IF EXISTS gdrive_storage_nodes_update ON gdrive_storage_nodes;
CREATE POLICY gdrive_storage_nodes_update ON gdrive_storage_nodes FOR UPDATE
  USING (is_account_member(account_id, 'admin'));

-- DELETE: Admin+ only
DROP POLICY IF EXISTS gdrive_storage_nodes_delete ON gdrive_storage_nodes;
CREATE POLICY gdrive_storage_nodes_delete ON gdrive_storage_nodes FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Backfill existing single gdrive_configs into the pool table if exists
INSERT INTO gdrive_storage_nodes (
  account_id,
  connected_email,
  refresh_token,
  target_folder,
  folder_id,
  is_active,
  priority_order
)
SELECT 
  account_id,
  connected_email,
  refresh_token,
  target_folder,
  folder_id,
  true,
  1
FROM gdrive_configs
ON CONFLICT (account_id, connected_email) DO NOTHING;
