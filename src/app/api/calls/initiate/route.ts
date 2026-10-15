import { NextRequest, NextResponse } from "next/server";
import { whatomate } from "@/lib/whatomate/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toNumber, contactId } = await req.json();

    if (!toNumber) {
      return NextResponse.json({ error: "Missing toNumber parameter" }, { status: 400 });
    }

    const callResponse = await whatomate.initiateCall({
      toNumber,
      metadata: { initiatedByUserId: user.id, contactId },
    });

    return NextResponse.json(callResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initiate call";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
