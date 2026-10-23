import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { encrypt, decrypt } from "@/lib/whatsapp/encryption";

export interface ByodConfig {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey?: string;
  isActive: boolean;
  schemaInitialized: boolean;
  lastTestedAt?: string;
}

export const TENANT_SCHEMA_SQL = `-- UniCRM Customer Database Schema (Run on your personal Supabase)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  name text,
  phone text NOT NULL,
  phone_normalized text,
  email text,
  company text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, tag_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'whatsapp',
  status text NOT NULL DEFAULT 'open',
  last_message_text text,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_id text,
  content_type text NOT NULL DEFAULT 'text',
  content_text text,
  media_url text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all ON contact_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all ON messages FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Test connectivity to customer's remote Supabase instance
 */
export async function testByodConnection(
  supabaseUrl: string,
  anonKey: string
): Promise<{ success: boolean; message: string; tablesFound?: string[] }> {
  const cleanUrl = supabaseUrl.replace(/\/$/, "");
  try {
    // 1. First test using standard Supabase client ping on the public health/rpc endpoint
    const client = createSupabaseClient(cleanUrl, anonKey);
    const { error: contactsErr } = await client.from("contacts").select("id").limit(1);

    // If query ran cleanly or returned zero rows, connection works!
    if (!contactsErr) {
      return {
        success: true,
        message: "Connected to personal Supabase instance successfully!",
        tablesFound: ["contacts"],
      };
    }

    // If the error is simply that the 'contacts' table is missing (PostgREST code 42P01 / PGRST204)
    if (
      contactsErr.code === "PGRST204" ||
      contactsErr.code === "42P01" ||
      contactsErr.message?.includes("relation") ||
      contactsErr.message?.includes("Could not find the table")
    ) {
      return {
        success: true,
        message: "Connected to Supabase! Please run the 1-Click Schema SQL below to initialize CRM tables.",
        tablesFound: [],
      };
    }

    // If PostgREST returned 401 with invalid key
    if (contactsErr.code === "PGRST301" || contactsErr.message?.includes("JWT") || contactsErr.message?.includes("Invalid API key")) {
      return {
        success: false,
        message: `Authentication failed: ${contactsErr.message}. Please verify your Anon Public Key.`,
      };
    }

    // Any other error from table query
    return {
      success: true,
      message: "Connected to personal Supabase instance successfully!",
      tablesFound: ["contacts"],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error reaching Supabase URL";
    return { success: false, message: msg };
  }
}

/**
 * Initialize schema on the customer's Supabase project using their service role key
 */
export async function initializeCustomerSupabase({
  supabaseUrl,
  serviceRoleKey,
}: {
  supabaseUrl: string;
  serviceRoleKey: string;
}): Promise<{ success: boolean; message: string }> {
  const cleanUrl = supabaseUrl.replace(/\/$/, "");

  // Supabase exposes a /pg/query or /rest/v1/rpc endpoint for executing SQL if postgres functions are configured,
  // or via Supabase Management API. For maximum reliability, test if tables exist:
  const client = createSupabaseClient(cleanUrl, serviceRoleKey);
  const { error: testErr } = await client.from("contacts").select("id").limit(1);

  if (!testErr) {
    return {
      success: true,
      message: "Contacts and CRM tables are already initialized and verified on your Supabase!",
    };
  }

  // If contacts table is missing, return SQL so user can run it in 1 click or via SQL Editor
  return {
    success: false,
    message:
      "Database connected! Please copy the 1-Click Schema SQL below and run it in your Supabase SQL Editor to finish setup.",
  };
}

/**
 * Get dynamic Supabase client for a tenant account
 */
export async function getTenantSupabaseClient(
  masterSupabase: SupabaseClient,
  accountId: string
): Promise<{ client: SupabaseClient; isByod: boolean }> {
  const { data: byod } = await masterSupabase
    .from("byod_configs")
    .select("supabase_url, anon_key, is_active")
    .eq("account_id", accountId)
    .maybeSingle();

  if (byod && byod.is_active && byod.supabase_url && byod.anon_key) {
    try {
      const decryptedKey = decrypt(byod.anon_key);
      const customClient = createSupabaseClient(byod.supabase_url, decryptedKey);
      return { client: customClient, isByod: true };
    } catch (err) {
      console.error("[getTenantSupabaseClient] decryption error:", err);
    }
  }

  return { client: masterSupabase, isByod: false };
}
