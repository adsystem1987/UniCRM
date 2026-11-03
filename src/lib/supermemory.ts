/**
 * UniCRM — Supermemory Integration (Persistent Memory & Borrower Profiling)
 *
 * Uses native fetch to call api.supermemory.ai directly:
 * - 100% Edge & Serverless safe (zero Node.js built-ins like node:fs or node:child_process).
 * - Pulls SUPERMEMORY_API_KEY dynamically from Supabase Vault (via src/lib/vault.ts).
 * - Graceful degradation: all calls silently resolve/no-op if the key is absent or network fails.
 */

import { getVaultSecret } from './vault';

const SUPERMEMORY_API_BASE = 'https://api.supermemory.ai';

export interface BorrowerProfile {
  staticFacts: string[];
  recentContext: string[];
}

/**
 * Returns a clean container namespace for isolating borrower memories per tenant and phone.
 */
export function getBorrowerNamespace(accountId: string, phoneOrId: string): string {
  const cleanPhone = phoneOrId.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanAccount = accountId.replace(/[^a-zA-Z0-9_-]/g, '');
  return `unicrm_${cleanAccount}_${cleanPhone}`.slice(0, 64);
}

/**
 * Store a borrower fact or conversation summary into Supermemory.
 */
export async function storeBorrowerMemory(
  namespace: string,
  content: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const apiKey = (await getVaultSecret('SUPERMEMORY_API_KEY')) || process.env.SUPERMEMORY_API_KEY;
  if (!apiKey || !content.trim()) return false;

  try {
    const res = await fetch(`${SUPERMEMORY_API_BASE}/ns/${encodeURIComponent(namespace)}/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        content,
        metadata: {
          source: 'unicrm_loans_advisory',
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn('[Supermemory] storeBorrowerMemory error:', err);
    return false;
  }
}

/**
 * Recall contextual memories for a borrower given a query (e.g. current borrower question).
 */
export async function recallBorrowerContext(
  namespace: string,
  query: string,
  limit: number = 5
): Promise<string[]> {
  const apiKey = (await getVaultSecret('SUPERMEMORY_API_KEY')) || process.env.SUPERMEMORY_API_KEY;
  if (!apiKey || !query.trim()) return [];

  try {
    const res = await fetch(`${SUPERMEMORY_API_BASE}/ns/${encodeURIComponent(namespace)}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        q: query,
        limit,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results = data.results || data.memories || data.data || [];
    return Array.isArray(results)
      ? results
          .map((r: any) => (typeof r === 'string' ? r : r.content || r.text || r.summary || ''))
          .filter(Boolean)
      : [];
  } catch (err) {
    console.warn('[Supermemory] recallBorrowerContext error:', err);
    return [];
  }
}

/**
 * Retrieve synthesized profile facts for a borrower.
 */
export async function getBorrowerProfile(namespace: string): Promise<BorrowerProfile | null> {
  const apiKey = (await getVaultSecret('SUPERMEMORY_API_KEY')) || process.env.SUPERMEMORY_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${SUPERMEMORY_API_BASE}/ns/${encodeURIComponent(namespace)}/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      staticFacts: Array.isArray(data.static) ? data.static : Array.isArray(data.facts) ? data.facts : [],
      recentContext: Array.isArray(data.dynamic) ? data.dynamic : Array.isArray(data.context) ? data.context : [],
    };
  } catch (err) {
    console.warn('[Supermemory] getBorrowerProfile error:', err);
    return null;
  }
}
