// Edge & Serverless-compatible Supabase Vault Client
//
// In-process cache with 60s TTL prevents repeated DB calls and keeps Vercel Function CPU minimal.
const SECRET_TTL_MS = 60_000;
const secretCache = new Map<string, { value: string | null; expiresAt: number }>();

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    supabaseUrl: (url || 'https://cwujrgoxtydrbolxgnyr.supabase.co').replace(/\/+$/, ''),
    serviceKey: key || null,
  };
}

export async function getVaultSecret(keyName: string, forceRefresh = false): Promise<string | null> {
  // Check local memory cache first
  if (!forceRefresh) {
    const hit = secretCache.get(keyName);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.value;
    }
  }

  // Check local env override first (e.g. for development or testing)
  if (process.env[keyName]) {
    return process.env[keyName]!;
  }

  const { supabaseUrl, serviceKey } = getSupabaseCredentials();
  if (!serviceKey) return null;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_vault_secret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ secret_name: keyName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof data === 'string' && data.length > 0) {
        secretCache.set(keyName, { value: data, expiresAt: Date.now() + SECRET_TTL_MS });
        return data;
      }
    }
    // Cache the miss too so a missing secret doesn't re-hit Supabase on every request
    secretCache.set(keyName, { value: null, expiresAt: Date.now() + SECRET_TTL_MS });
  } catch (err) {
    console.error(`[Vault] Failed to retrieve '${keyName}':`, err);
  }

  return null;
}
