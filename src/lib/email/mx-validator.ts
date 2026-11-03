import { Resolver } from "dns/promises";

const mxCache = new Map<string, { valid: boolean; expiresAt: number }>();
const SUCCESS_TTL = 4 * 60 * 60 * 1000; // 4 hours
const FAILURE_TTL = 10 * 60 * 1000;     // 10 minutes

/**
 * Validates whether the recipient's domain has active, deliverable MX records.
 * Uses a cancellation-aware timeout and in-memory TTL caching to protect AWS SES reputation at ₹0 cost.
 */
export async function hasValidMxRecord(
  email: string,
  timeoutMs: number = 3000
): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;

  const cached = mxCache.get(domain);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.valid;
  }

  const resolver = new Resolver();
  let timer: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      try {
        resolver.cancel();
      } catch {
        // Ignore if already completed
      }
      reject(new Error("DNS lookup timeout"));
    }, timeoutMs);
  });

  try {
    const records = await Promise.race([
      resolver.resolveMx(domain),
      timeoutPromise,
    ]);
    clearTimeout(timer!);
    const isValid = Array.isArray(records) && records.length > 0;

    mxCache.set(domain, { valid: isValid, expiresAt: Date.now() + SUCCESS_TTL });
    return isValid;
  } catch (error) {
    clearTimeout(timer!);
    mxCache.set(domain, { valid: false, expiresAt: Date.now() + FAILURE_TTL });
    return false;
  }
}
