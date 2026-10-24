import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendWelcomeEmail,
  sendWhatsAppFollowupEmail,
  sendDfyPitchEmail,
} from "@/lib/email/sender";

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
    const type = body.type || "welcome"; // "welcome" | "whatsapp" | "dfy"

    let result;
    if (type === "whatsapp") {
      result = await sendWhatsAppFollowupEmail({ to: recipient, name });
    } else if (type === "dfy") {
      result = await sendDfyPitchEmail({ to: recipient, name });
    } else {
      result = await sendWelcomeEmail({ to: recipient, name });
    }

    return NextResponse.json({
      status: result.success ? "delivered" : "failed",
      provider: result.provider,
      template: type,
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
  const templateType = searchParams.get("type") || "welcome"; // "welcome" | "whatsapp" | "dfy"

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
    let result;

    if (templateType === "whatsapp") {
      result = await sendWhatsAppFollowupEmail({ to: targetEmail, name });
    } else if (templateType === "dfy") {
      result = await sendDfyPitchEmail({ to: targetEmail, name });
    } else {
      result = await sendWelcomeEmail({ to: targetEmail, name });
    }

    return NextResponse.json({
      status: result.success ? "delivered" : "failed",
      provider: result.provider,
      template: templateType,
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
    availableTemplates: ["welcome", "whatsapp", "dfy"],
    detectedEnvKeys: availableEmailKeys,
    instructions: "Add ?to=your-email@gmail.com&type=welcome|whatsapp|dfy to test any email template.",
  });
}

