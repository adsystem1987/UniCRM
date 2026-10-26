import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getClientLeadConfig } from "@/lib/leads-finder/sheet-client";
import { runApifyLeadsScraper } from "@/lib/leads-finder/apify-runner";
import { supabaseAdmin } from "@/lib/flows/admin-client";

export const dynamic = "force-dynamic";

/**
 * GET /api/leads-finder/config
 * Check user's credit balance and token status.
 * Prioritizes the database account_entitlements first, falls back to Google Sheet.
 */
export async function GET() {
  try {
    const { supabase, accountId } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check account_entitlements in Database first
    const admin = supabaseAdmin();
    const { data: entitlement } = await admin
      .from("account_entitlements")
      .select("lead_credits_balance, lead_scraper_token_encrypted")
      .eq("account_id", accountId)
      .maybeSingle();

    if (entitlement && entitlement.lead_credits_balance > 0) {
      return NextResponse.json({
        hasKey: true,
        creditsBalance: entitlement.lead_credits_balance,
        status: "active",
      });
    }

    // 2. Fallback to Google Sheet if not provisioned in database
    const config = await getClientLeadConfig(email);
    if (!config) {
      return NextResponse.json({
        hasKey: false,
        creditsBalance: entitlement?.lead_credits_balance || 0,
        status: "inactive",
        message: "No lead discovery allocation found. Please recharge credits.",
      });
    }

    return NextResponse.json({
      hasKey: true,
      creditsBalance: config.creditsBalance,
      status: config.status,
    });
  } catch (err) {
    console.error("[leads-finder/config] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load credits" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads-finder/run
 * Validates limits (min 100, max 1000) and credit balance, then triggers scraper and inserts contacts
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const count = parseInt(body.count, 10);

    if (!category || !city) {
      return NextResponse.json({ error: "Please specify both Category and City." }, { status: 400 });
    }

    // STRICT RULES: 100 min cap, 1000 max per run
    if (isNaN(count) || count < 100 || count > 1000) {
      return NextResponse.json(
        { error: "Contacts to fetch must be between 100 (min cap) and 1,000 (max cap) per run." },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    // 1. Check account_entitlements in Database first
    const { data: entitlement } = await admin
      .from("account_entitlements")
      .select("id, lead_credits_balance, lead_scraper_token_encrypted")
      .eq("account_id", accountId)
      .maybeSingle();

    let activeToken = entitlement?.lead_scraper_token_encrypted || process.env.APIFY_API_TOKEN || "";
    let availableCredits = entitlement?.lead_credits_balance || 0;
    let isDbEntitlement = !!entitlement && entitlement.lead_credits_balance > 0;

    // 2. Fallback to Google Sheet if no credits in DB
    if (!isDbEntitlement) {
      const clientConfig = await getClientLeadConfig(email);
      if (clientConfig && clientConfig.status !== "suspended") {
        activeToken = clientConfig.apifyToken || activeToken;
        availableCredits = clientConfig.creditsBalance;
      }
    }

    if (!activeToken) {
      return NextResponse.json(
        { error: "No lead scraper allocation found. Please contact support or recharge credits." },
        { status: 403 }
      );
    }

    if (availableCredits < count) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You requested ${count} contacts, but have ${availableCredits} credits left. Please recharge.`,
          currentCredits: availableCredits,
          requiredCredits: count,
        },
        { status: 402 }
      );
    }

    // Run Scraper
    const leads = await runApifyLeadsScraper(activeToken, {
      category,
      city,
      count,
    });

    if (leads.length === 0) {
      return NextResponse.json({
        success: true,
        importedCount: 0,
        message: "No verified contacts found for this criteria. Zero credits deducted.",
      });
    }

    // Deduct credits from account_entitlements if managed in DB
    if (entitlement) {
      const deductedBalance = Math.max(0, entitlement.lead_credits_balance - leads.length);
      await admin
        .from("account_entitlements")
        .update({
          lead_credits_balance: deductedBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entitlement.id);
    }

    // Ingest into UniCRM contacts table
    const contactInserts = leads.map((lead) => ({
      account_id: accountId,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || null,
      address: lead.address || null,
      city: lead.city,
      source: "lead-finder",
      tags: ["lead-finder", `cat:${category.toLowerCase()}`, `city:${city.toLowerCase()}`],
      custom_fields: {
        website: lead.website || null,
        rating: lead.rating || null,
        reviews_count: lead.reviewsCount || null,
      },
    }));

    // Upsert into contacts
    const { error: insertError } = await supabase.from("contacts").upsert(contactInserts, {
      onConflict: "account_id,phone",
      ignoreDuplicates: true,
    });

    if (insertError) {
      console.error("[leads-finder/run] Error inserting contacts:", insertError);
    }

    return NextResponse.json({
      success: true,
      importedCount: leads.length,
      remainingCredits: Math.max(0, availableCredits - leads.length),
      message: `Successfully discovered and saved ${leads.length} verified leads into your CRM.`,
    });
  } catch (err: unknown) {
    console.error("[leads-finder/run] execution error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scraper execution failed" },
      { status: 500 }
    );
  }
}
