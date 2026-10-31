import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

/**
 * GET /api/claim?token=...
 * Validates a claim token and returns profile details for preview.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("workspace_claim_tokens")
    .select("business_name, contact_name, email, category, city, page_slug, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid or nonexistent invitation." }, { status: 404 });
  }

  if (data.status !== "pending") {
    return NextResponse.json({ error: `This invitation has already been ${data.status}.` }, { status: 400 });
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invitation link has expired." }, { status: 410 });
  }

  return NextResponse.json({
    businessName: data.business_name,
    contactName: data.contact_name || "",
    email: data.email,
    category: data.category || "General",
    city: data.city || "",
    pageSlug: data.page_slug,
  });
}

/**
 * POST /api/claim
 * Claims the workspace:
 * 1. Creates the user account in Supabase auth (or attaches if exists).
 * 2. Creates the CRM account/workspace.
 * 3. Updates the token status to 'claimed'.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json().catch(() => ({}));
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password required." }, { status: 400 });
    }

    const admin = getAdminClient();

    // 1. Verify token
    const { data: claimRecord, error: claimErr } = await admin
      .from("workspace_claim_tokens")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .maybeSingle();

    if (claimErr || !claimRecord) {
      return NextResponse.json({ error: "Invalid or expired invitation token." }, { status: 400 });
    }

    const email = claimRecord.email.toLowerCase();

    // 2. Create user in Supabase Auth via Admin Client
    const { data: userData, error: userErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: claimRecord.contact_name || claimRecord.business_name,
      },
    });

    let userId = userData?.user?.id;

    if (userErr) {
      // If user already exists, update their password
      if (userErr.message.includes("already been registered")) {
        const { data: listUser } = await admin.auth.admin.listUsers();
        const existing = listUser.users.find((u) => u.email?.toLowerCase() === email);
        if (existing) {
          userId = existing.id;
          await admin.auth.admin.updateUserById(userId, { password });
        } else {
          return NextResponse.json({ error: userErr.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: userErr.message }, { status: 400 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Failed to provision user." }, { status: 500 });
    }

    // 3. Create or attach CRM Account
    const { data: newAccount } = await admin
      .from("accounts")
      .insert({
        name: claimRecord.business_name,
        owner_user_id: userId,
      })
      .select("id")
      .single();

    const accountId = newAccount?.id;

    if (accountId) {
      // Add user to account_users
      await admin.from("account_users").insert({
        account_id: accountId,
        user_id: userId,
        role: "owner",
      });
    }

    // 4. Update claim token status
    await admin
      .from("workspace_claim_tokens")
      .update({
        status: "claimed",
        claimed_at: new Date().toISOString(),
        account_id: accountId || null,
      })
      .eq("token", token);

    return NextResponse.json({
      success: true,
      message: "Workspace successfully claimed!",
    });
  } catch (err: any) {
    console.error("[api/claim] Error claiming workspace:", err);
    return NextResponse.json({ error: err.message || "Failed to claim workspace" }, { status: 500 });
  }
}
