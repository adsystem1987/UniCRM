/**
 * Master Super Admin Configuration & Helpers
 *
 * Defines platform-level super admins who have cross-tenant access to:
 * - Review & verify orders/payments across all accounts
 * - Moderate, suspend, or phase out tenant workspaces
 * - View platform telemetry
 */

export const MASTER_ADMIN_EMAILS: ReadonlySet<string> = new Set([
  'brosir2019@gmail.com',
  'help@dfyunicrm.com',
]);

/**
 * Returns true if the provided email belongs to a platform master super admin.
 */
export function isMasterAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.has(email.trim().toLowerCase());
}
