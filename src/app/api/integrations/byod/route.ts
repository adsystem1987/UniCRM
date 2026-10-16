import { NextResponse } from "next/server";
import { getCurrentAccount, requireRole } from "@/lib/auth/account";
import { encrypt, decrypt } from "@/lib/whatsapp/encryption";
import {
  testByodConnection,
  initializeCustomerSupabase,
  TENANT_SCHEMA_SQL,
} from "@/lib/byod/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/byod
 * Return BYOD status and schema SQL template
 */
export async function GET() {
  try {
    const { supabase, accountId } = await getCurrentAccount();

    const { data: config } = await supabase
      .from("byod_configs")
      .select("supabase_url, is_active, schema_initialized, last_tested_at, updated_at")
      .eq("account_id", accountId)
      .maybeSingle();

    return NextResponse.json({
      connected: !!config?.is_active,
      supabaseUrl: config?.supabase_url || "",
      schemaInitialized: !!config?.schema_initialized,
      lastTestedAt: config?.last_tested_at,
      schemaSql: TENANT_SCHEMA_SQL,
    });
  } catch (err) {
    console.error("[byod GET] error:", err);
    return NextResponse.json({ connected: false, schemaSql: TENANT_SCHEMA_SQL });
  }
}

/**
 * POST /api/integrations/byod
 * Test, save, and activate personal Supabase configuration
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId } = await requireRole("admin");
    const body = await request.json().catch(() => ({}));

    const supabaseUrl = typeof body.supabaseUrl === "string" ? body.supabaseUrl.trim() : "";
    const anonKey = typeof body.anonKey === "string" ? body.anonKey.trim() : "";
    const serviceRoleKey = typeof body.serviceRoleKey === "string" ? body.serviceRoleKey.trim() : "";

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: "Supabase Project URL and Anon Key are required." },
        { status: 400 }
      );
    }

    if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Supabase URL must start with https:// or http://" },
        { status: 400 }
      );
    }

    // 1. Test connectivity
    const test = await testByodConnection(supabaseUrl, anonKey);
    if (!test.success) {
      return NextResponse.json({ error: test.message }, { status: 400 });
    }

    // 2. Test if tables exist
    const hasContacts = (test.tablesFound || []).includes("contacts");
    let schemaInitialized = hasContacts;

    if (!schemaInitialized && serviceRoleKey) {
      const initResult = await initializeCustomerSupabase({
        supabaseUrl,
        serviceRoleKey,
      });
      if (initResult.success) {
        schemaInitialized = true;
      }
    }

    // 3. Encrypt and save to byod_configs
    const encryptedAnonKey = encrypt(anonKey);
    const encryptedServiceRoleKey = serviceRoleKey ? encrypt(serviceRoleKey) : null;

    const { error: dbError } = await supabase.from("byod_configs").upsert(
      {
        account_id: accountId,
        supabase_url: supabaseUrl,
        anon_key: encryptedAnonKey,
        service_role_key: encryptedServiceRoleKey,
        is_active: true,
        schema_initialized: schemaInitialized,
        last_tested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id" }
    );

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: test.message,
      schemaInitialized,
      tablesFound: test.tablesFound,
    });
  } catch (err) {
    console.error("[byod POST] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to configure BYOD" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/byod
 * Disconnect BYOD and revert to master Supabase
 */
export async function DELETE() {
  try {
    const { supabase, accountId } = await requireRole("admin");

    const { error } = await supabase
      .from("byod_configs")
      .delete()
      .eq("account_id", accountId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[byod DELETE] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to disconnect BYOD" },
      { status: 500 }
    );
  }
}
