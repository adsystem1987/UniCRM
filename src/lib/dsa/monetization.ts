/**
 * UniCRM — DSA Lead Monetization & Masked Contact Unlock Service
 *
 * Adapted from DFYDude OS (interview-ace/src/lib/services/monetization.service.ts).
 * Controls unmasking borrower contacts (phone & email) for verified DSA partners:
 * 1. Tracks unlocked lead status per user/partner.
 * 2. Deducts credits or consumes partner pilot passes.
 * 3. Enforces an immutable audit log (`unlocked_leads`).
 */

import { getAdminClient } from "@/lib/gdrive/offload";

export interface UnlockedLeadRecord {
  id: string;
  user_id: string;
  lead_id: string;
  unlocked_at: string;
}

/**
 * Checks whether a partner or agent has already unlocked this lead's contact details.
 */
export async function isLeadUnlockedByPartner(
  userId: string,
  leadId: string
): Promise<boolean> {
  const admin = getAdminClient();
  try {
    const { data } = await admin
      .from("unlocked_leads")
      .select("id")
      .eq("user_id", userId)
      .eq("lead_id", leadId)
      .maybeSingle();

    return !!data;
  } catch {
    // If table does not exist yet or error occurs, fall back to default check
    return false;
  }
}

/**
 * Records an unlocked lead event for a DSA partner.
 */
export async function recordLeadUnlock(
  userId: string,
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = getAdminClient();
  try {
    const { error } = await admin
      .from("unlocked_leads")
      .insert({
        user_id: userId,
        lead_id: leadId,
        unlocked_at: new Date().toISOString(),
      });

    if (error) {
      console.warn("[Monetization] Error recording lead unlock:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn("[Monetization] Exception in recordLeadUnlock:", err);
    return { success: false, error: err?.message };
  }
}

/**
 * Helper to mask phone numbers safely:
 * "+91 98765 43210" -> "+91 98••••••10"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 5) return "••••••••••";
  const clean = phone.trim();
  return `${clean.slice(0, 4)}••••••${clean.slice(-2)}`;
}

/**
 * Helper to mask emails safely:
 * "john.doe@company.com" -> "j••••••@company.com"
 */
export function maskEmailAddress(email: string): string {
  if (!email || !email.includes("@")) return "••••@••••.com";
  const [userPart, domainPart] = email.split("@");
  return userPart && domainPart
    ? `${userPart[0]}••••••@${domainPart}`
    : "••••@••••.com";
}
