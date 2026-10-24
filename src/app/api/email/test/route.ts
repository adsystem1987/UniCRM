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

export async function GET() {
  const hasUnitpostKey = Boolean(process.env.UNITPOST_API_KEY);
  const fromAddress = process.env.UNITPOST_FROM || "UniCRM <hello@mail.dfyunicrm.com>";
  return NextResponse.json({
    status: "ok",
    unitpostConfigured: hasUnitpostKey,
    fromAddress,
    instructions: "POST to /api/email/test with JSON { to: 'your-email@domain.com' } to send a live test email.",
  });
}
