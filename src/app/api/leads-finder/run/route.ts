import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getClientLeadConfig } from "@/lib/leads-finder/sheet-client";
import { runApifyLeadsScraper } from "@/lib/leads-finder/apify-runner";

export const dynamic = "force-dynamic";

/**
 * GET /api/leads-finder/config
 * Check user's credit balance and token status from the Google Sheet
 */
export async function GET() {
  try {
    const { supabase, userId } = await getCurrentAccount();
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getClientLeadConfig(email);
    if (!config) {
      return NextResponse.json({
        hasKey: false,
        creditsBalance: 0,
        status: "inactive",
        message: "No Apify token assigned in the admin sheet yet. Please contact support or recharge credits.",
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
 * Validates limits (min 100, max 1000) and credit balance, then triggers Apify and inserts contacts
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

    // Check Google Sheet for Client's Dedicated Apify Token & Credit Balance
    const clientConfig = await getClientLeadConfig(email);
    if (!clientConfig) {
      return NextResponse.json(
        { error: "No dedicated Apify key or credit allocation found. Please contact support to activate your key." },
        { status: 403 }
      );
    }

    if (clientConfig.status === "suspended") {
      return NextResponse.json(
        { error: "Your lead finder access is currently suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Always check credit balance before run
    if (clientConfig.creditsBalance < count) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You requested ${count} contacts, but have ${clientConfig.creditsBalance} credits left. Please recharge.`,
          currentCredits: clientConfig.creditsBalance,
          requiredCredits: count,
        },
        { status: 402 }
      );
    }

    // Run Scraper using Client's Isolated Apify Key
    const leads = await runApifyLeadsScraper(clientConfig.apifyToken, {
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

    // Ingest into UniCRM contacts table
    const contactInserts = leads.map((lead) => ({
      account_id: accountId,
      first_name: lead.name,
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
      console.error("[leads-finder/run] contacts insert error:", insertError);
      // Fallback normal insert
      await supabase.from("contacts").insert(contactInserts);
    }

    return NextResponse.json({
      success: true,
      importedCount: leads.length,
      creditsUsed: leads.length,
      leadsPreview: leads.slice(0, 10),
      message: `Successfully found and imported ${leads.length} verified contacts into UniCRM!`,
    });
  } catch (err) {
    console.error("[leads-finder/run] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to run lead finder" },
      { status: 500 }
    );
  }
}
