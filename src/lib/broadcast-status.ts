/**
 * Shared status badge config for broadcasts + recipients.
 *
 * Previously `statusConfig` was defined inline in both
 * /broadcasts/page.tsx and /broadcasts/[id]/page.tsx with slight
 * drift risk. One source of truth now.
 *
 * Badge shape: bg-*-500/10 + text-*-400 + border-*-500/20. The
 * translucent fills sit fine on both light and dark surfaces; neutral
 * statuses use text-muted-foreground so the label stays legible in
 * light mode (a solid slate-400 would be too faint on white).
 */

import type { BroadcastStatus, RecipientStatus } from "@/types";

export interface StatusDisplay {
  label: string;
  classes: string;
  /**
   * Set true for statuses that should pulse in the UI to convey
   * "live / in-flight" — currently only `sending`.
   */
  pulse?: boolean;
}

export const broadcastStatusConfig: Record<BroadcastStatus, StatusDisplay> = {
  draft: {
    label: "draft",
    classes: "bg-muted text-muted-foreground border-border",
  },
  scheduled: {
    label: "scheduled",
    classes: "bg-status-info-bg text-status-info border-status-info-border",
  },
  sending: {
    label: "sending",
    classes: "bg-status-warning-bg text-status-warning border-status-warning-border",
    pulse: true,
  },
  sent: {
    label: "sent",
    classes: "bg-status-success-bg text-status-success border-status-success-border",
  },
  failed: {
    label: "failed",
    classes: "bg-status-danger-bg text-status-danger border-status-danger-border",
  },
};

export const recipientStatusConfig: Record<RecipientStatus, StatusDisplay> = {
  pending: {
    label: "pending",
    classes: "bg-muted text-muted-foreground border-border",
  },
  sent: {
    label: "sent",
    classes: "bg-status-info-bg text-status-info border-status-info-border",
  },
  delivered: {
    label: "delivered",
    classes: "bg-status-success-bg text-status-success border-status-success-border",
  },
  read: {
    label: "read",
    classes: "bg-primary/15 text-primary border-primary/30",
  },
  replied: {
    label: "replied",
    classes: "bg-status-violet-bg text-status-violet border-status-violet-border",
  },
  failed: {
    label: "failed",
    classes: "bg-status-danger-bg text-status-danger border-status-danger-border",
  },
};

/**
 * Tolerant lookup — callers often have a generic string status
 * coming from Supabase. Falls back to the "draft" / "pending"
 * entry so the UI never crashes on an unknown value.
 */
export function getBroadcastStatus(status: string): StatusDisplay {
  return (
    broadcastStatusConfig[status as BroadcastStatus] ??
    broadcastStatusConfig.draft
  );
}

export function getRecipientStatus(status: string): StatusDisplay {
  return (
    recipientStatusConfig[status as RecipientStatus] ??
    recipientStatusConfig.pending
  );
}
