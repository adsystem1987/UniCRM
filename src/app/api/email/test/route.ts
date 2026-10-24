import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail, sendEmail } from "@/lib/email/sender";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const recipient = body.to || user?.email;

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient email is required (pass { to: 'email@domain.com' })" },
        { status: 400 }
      );
    }

    const name = body.name || user?.user_metadata?.full_name || "UniCRM Founder";

    const result = await sendWelcomeEmail({
      to: recipient,
      name,
    });

    return NextResponse.json({
      status: result.success ? "delivered" : "failed",
      provider: result.provider,
      id: result.id,
      error: result.error,
      sentTo: recipient,
    });
  } catch (err: any) {
    console.error("[api/email/test] Exception:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetEmail = searchParams.get("to");

  const unitpostKey =
    process.env.UNITPOST_API_KEY?.trim() ||
    process.env.UNITPOST_KEY?.trim() ||
    process.env.UNIT_POST_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_UNITPOST_API_KEY?.trim();

  const hasUnitpostKey = Boolean(unitpostKey);
  const fromAddress = process.env.UNITPOST_FROM || "UniCRM <hello@mail.dfyunicrm.com>";

  const availableEmailKeys = Object.keys(process.env).filter(
    (k) =>
      k.toUpperCase().includes("UNIT") ||
      k.toUpperCase().includes("POST") ||
      k.toUpperCase().includes("EMAIL") ||
      k.toUpperCase().includes("RESEND")
  );

  if (targetEmail) {
    const name = searchParams.get("name") || "UniCRM Test User";
    const result = await sendWelcomeEmail({
      to: targetEmail,
      name,
    });

    return NextResponse.json({
      status: result.success ? "delivered" : "failed",
      provider: result.provider,
      id: result.id,
      error: result.error,
      sentTo: targetEmail,
      fromAddress,
      unitpostKeyPresent: hasUnitpostKey,
      detectedEnvKeys: availableEmailKeys,
    });
  }

  return NextResponse.json({
    status: "ok",
    unitpostConfigured: hasUnitpostKey,
    fromAddress,
    detectedEnvKeys: availableEmailKeys,
    instructions: "Add ?to=your-email@gmail.com to this URL to trigger an instant test welcome email.",
  });
}
