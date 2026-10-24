import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processDueOnboardingEmails } from "@/lib/email/onboarding-queue";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/onboarding
 * Drains due onboarding emails (Touchpoints 2 & 3).
 *
 * Securing:
 * Matches `AUTOMATION_CRON_SECRET` via `x-cron-secret` header or
 * Vercel Cron `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.AUTOMATION_CRON_SECRET || process.env.CRON_SECRET;

  if (cronSecret) {
    const headerSecret = request.headers.get("x-cron-secret");
    const authHeader = request.headers.get("authorization");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const supplied = headerSecret || bearerSecret || "";

    const suppliedBuf = Buffer.from(supplied);
    const expectedBuf = Buffer.from(cronSecret);

    if (
      suppliedBuf.length !== expectedBuf.length ||
      !timingSafeEqual(suppliedBuf, expectedBuf)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processDueOnboardingEmails(50);
    return NextResponse.json({
      status: "ok",
      ...result,
    });
  } catch (err: any) {
    console.error("[Cron/Onboarding] Error processing queue:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
