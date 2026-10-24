import { supabaseAdmin } from "@/lib/automations/admin-client";
import {
  sendWhatsAppFollowupEmail,
  sendDfyPitchEmail,
} from "./sender";

export type OnboardingStep = "whatsapp_followup" | "dfy_pitch";

export interface QueueOnboardingParams {
  userId: string;
  email: string;
  name: string;
  baseDate?: Date;
}

/**
 * Enqueues Touchpoint 2 (24h) and Touchpoint 3 (72h) for newly registered users.
 * Uses ON CONFLICT DO NOTHING via UNIQUE(user_id, step) to prevent duplicates.
 */
export async function queueUserOnboarding({
  userId,
  email,
  name,
  baseDate = new Date(),
}: QueueOnboardingParams): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = supabaseAdmin();
    const nowMs = baseDate.getTime();

    const t2RunAt = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
    const t3RunAt = new Date(nowMs + 72 * 60 * 60 * 1000).toISOString();

    const rows = [
      {
        user_id: userId,
        email,
        name,
        step: "whatsapp_followup" as const,
        status: "pending" as const,
        run_at: t2RunAt,
      },
      {
        user_id: userId,
        email,
        name,
        step: "dfy_pitch" as const,
        status: "pending" as const,
        run_at: t3RunAt,
      },
    ];

    const { error } = await admin
      .from("user_onboarding_sequence")
      .upsert(rows, { onConflict: "user_id,step", ignoreDuplicates: true });

    if (error) {
      console.error("[OnboardingQueue] Failed to enqueue follow-ups:", error);
      return { success: false, error: error.message };
    }

    console.log(`[OnboardingQueue] Successfully enqueued 24h and 72h emails for ${email}`);
    return { success: true };
  } catch (err: any) {
    console.error("[OnboardingQueue] Unexpected error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Scans and processes due onboarding sequence emails.
 * Performs smart state checks:
 * - Touchpoint 2: Checks if WhatsApp is already connected. If yes, marks as skipped.
 * - Touchpoint 3: Sends transparent DFY Pro engineering note.
 */
export async function processDueOnboardingEmails(limit = 50): Promise<{
  processed: number;
  delivered: number;
  skipped: number;
  failed: number;
}> {
  const admin = supabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data: due, error } = await admin
    .from("user_onboarding_sequence")
    .select("*")
    .eq("status", "pending")
    .lte("run_at", nowIso)
    .order("run_at", { ascending: true })
    .limit(limit);

  if (error || !due || due.length === 0) {
    if (error) console.error("[OnboardingQueue] Fetch error:", error);
    return { processed: 0, delivered: 0, skipped: 0, failed: 0 };
  }

  let delivered = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of due) {
    // 1. Claim row with status = 'running' to prevent duplicate execution
    const { data: claim } = await admin
      .from("user_onboarding_sequence")
      .update({ status: "running", updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (!claim) continue;

    try {
      // 2. Smart state check for Touchpoint 2: WhatsApp Connection
      if (row.step === "whatsapp_followup") {
        const { data: waConfig } = await admin
          .from("whatsapp_config")
          .select("status, phone_number_id")
          .eq("user_id", row.user_id)
          .maybeSingle();

        if (waConfig && waConfig.status === "connected") {
          console.log(`[OnboardingQueue] User ${row.email} already connected WhatsApp. Skipping Touchpoint 2.`);
          await admin
            .from("user_onboarding_sequence")
            .update({
              status: "skipped",
              metadata: { reason: "whatsapp_already_connected" },
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
          skipped++;
          continue;
        }

        // Deliver Touchpoint 2
        const result = await sendWhatsAppFollowupEmail({
          to: row.email,
          name: row.name,
        });

        if (result.success) {
          await admin
            .from("user_onboarding_sequence")
            .update({
              status: "delivered",
              delivered_at: new Date().toISOString(),
              metadata: { providerId: result.id, provider: result.provider },
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
          delivered++;
        } else {
          await admin
            .from("user_onboarding_sequence")
            .update({
              status: "failed",
              metadata: { error: result.error },
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
          failed++;
        }
      }

      // 3. Touchpoint 3: DFY Pitch
      else if (row.step === "dfy_pitch") {
        const result = await sendDfyPitchEmail({
          to: row.email,
          name: row.name,
        });

        if (result.success) {
          await admin
            .from("user_onboarding_sequence")
            .update({
              status: "delivered",
              delivered_at: new Date().toISOString(),
              metadata: { providerId: result.id, provider: result.provider },
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
          delivered++;
        } else {
          await admin
            .from("user_onboarding_sequence")
            .update({
              status: "failed",
              metadata: { error: result.error },
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
          failed++;
        }
      }
    } catch (deliveryErr: any) {
      console.error(`[OnboardingQueue] Error delivering row ${row.id}:`, deliveryErr);
      await admin
        .from("user_onboarding_sequence")
        .update({
          status: "failed",
          metadata: { error: deliveryErr.message || "Unknown delivery exception" },
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      failed++;
    }
  }

  return {
    processed: due.length,
    delivered,
    skipped,
    failed,
  };
}
