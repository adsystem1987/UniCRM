// ============================================================
// /api/webhooks/slack
//
// Ingests signup events from Supabase webhooks or tests Slack connectivity.
//
// GET: Sends a test ping to the configured Slack channel.
// POST: Accepts Supabase Auth / Database Webhook events (auth.users or profiles INSERT)
// ============================================================

import { NextResponse } from "next/server";
import { notifySlackNewSignup, sendSlackMessage } from "@/lib/slack/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  const channel = process.env.SLACK_CHANNEL || "C0BJU7JLKUM";
  const ok = await sendSlackMessage({
    text: "🟢 UniCRM Slack Webhook is active and listening for signups!",
    channel,
  });

  return NextResponse.json({
    status: ok ? "success" : "failed",
    channel,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Handle Supabase Database Webhook payload
    // Table: auth.users or public.profiles
    const record = body?.record || body;
    const type = body?.type || "INSERT";

    if (type === "INSERT" || !body?.type) {
      const email = record.email || record.raw_user_meta_data?.email;
      const name =
        record.full_name ||
        record.raw_user_meta_data?.full_name ||
        record.raw_user_meta_data?.name;
      const userId = record.id || record.user_id;
      const provider =
        record.raw_app_meta_data?.provider ||
        record.app_metadata?.provider ||
        "Supabase Auth";

      if (email || userId) {
        await notifySlackNewSignup({
          name,
          email,
          provider,
          userId,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/webhooks/slack] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
