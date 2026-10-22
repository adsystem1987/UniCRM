/**
 * Google Sheet Client for Leads Finder
 * Reads dedicated client Apify tokens and credit balances from an admin Google Sheet.
 * Also supports updating/deducting credits.
 */

export interface ClientLeadConfig {
  email: string;
  apifyToken: string;
  creditsBalance: number;
  status: 'active' | 'suspended';
  notes?: string;
}

/**
 * Parses CSV export of the Admin Google Sheet
 * Expected headers: email, apify_token, credits_balance, status, notes
 */
export function parseSheetCsv(csvText: string): Map<string, ClientLeadConfig> {
  const map = new Map<string, ClientLeadConfig>();
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return map;

  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const emailIdx = header.findIndex(h => h.includes('email') || h.includes('client') || h.includes('workspace'));
  const tokenIdx = header.findIndex(h => h.includes('token') || h.includes('apify'));
  const creditsIdx = header.findIndex(h => h.includes('credit') || h.includes('balance'));
  const statusIdx = header.findIndex(h => h.includes('status'));
  const notesIdx = header.findIndex(h => h.includes('note'));

  if (emailIdx === -1 || tokenIdx === -1) {
    return map;
  }

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV splitting handling commas inside quotes
    const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    const email = row[emailIdx]?.toLowerCase();
    const apifyToken = row[tokenIdx];
    const credits = creditsIdx !== -1 ? parseInt(row[creditsIdx], 10) || 0 : 0;
    const status = (statusIdx !== -1 && row[statusIdx]?.toLowerCase() === 'suspended') ? 'suspended' : 'active';
    const notes = notesIdx !== -1 ? row[notesIdx] : '';

    if (email && apifyToken) {
      map.set(email, {
        email,
        apifyToken,
        creditsBalance: credits,
        status,
        notes,
      });
    }
  }

  return map;
}

/**
 * Default fallback Google Sheet if LEADS_FINDER_GOOGLE_SHEET_URL is not set in env
 */
const DEFAULT_SHEET_EXPORT_URL = "https://docs.google.com/spreadsheets/d/10OIKdvmjaKoHPD6g1Vyx4wKMJBuQwugt_maDx_ZcZGU/export?format=csv&gid=0";

/**
 * Fetch the client's configuration from the Admin Google Sheet
 * Uses LEADS_FINDER_GOOGLE_SHEET_URL or falls back to the default UniCRM master sheet.
 */
export async function getClientLeadConfig(clientEmail: string): Promise<ClientLeadConfig | null> {
  const sheetUrl = process.env.LEADS_FINDER_GOOGLE_SHEET_URL || DEFAULT_SHEET_EXPORT_URL;
  if (!sheetUrl) {
    // Development fallback or direct env key fallback
    const fallbackToken = process.env.APIFY_API_TOKEN;
    if (fallbackToken) {
      return {
        email: clientEmail,
        apifyToken: fallbackToken,
        creditsBalance: 5000,
        status: 'active',
        notes: 'Fallback admin token'
      };
    }
    throw new Error("Admin Google Sheet URL (LEADS_FINDER_GOOGLE_SHEET_URL) is not configured.");
  }

  try {
    const res = await fetch(sheetUrl, { next: { revalidate: 30 } }); // Cache for 30s
    if (!res.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${res.statusText}`);
    }
    const csv = await res.text();
    const configMap = parseSheetCsv(csv);
    return configMap.get(clientEmail.toLowerCase()) || null;
  } catch (err) {
    console.error("[LeadsFinder] Error reading Google Sheet:", err);
    throw err;
  }
}
