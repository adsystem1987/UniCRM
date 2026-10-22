/**
 * Apify Runner for Leads Finder
 * Triggers Google Maps / Places scraper using dedicated client token
 * and standardizes phone contacts into UniCRM format (+91).
 */

export interface ScrapeRequest {
  category: string;
  city: string;
  count: number;
}

export interface StandardizedLead {
  name: string;
  phone: string;
  email?: string;
  website?: string;
  address?: string;
  city: string;
  category: string;
  rating?: number;
  reviewsCount?: number;
}

/**
 * Clean & normalize phone numbers, especially Indian numbers
 */
export function normalizePhone(rawPhone: string): string | null {
  if (!rawPhone) return null;
  // Remove spaces, hyphens, brackets
  const cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  // If already full international format e.g. +919876543210
  if (/^\+\d{10,15}$/.test(cleaned)) {
    return cleaned;
  }

  // 10-digit Indian mobile number starting with 6,7,8,9
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // 11-digit starting with 0
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned.substring(1)}`;
  }

  // 12-digit starting with 91
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // Reject generic landlines or unparseable formats
  return null;
}

/**
 * Runs the Apify Google Maps / Places Actor using the client's isolated token
 */
export async function runApifyLeadsScraper(
  apifyToken: string,
  request: ScrapeRequest
): Promise<StandardizedLead[]> {
  const { category, city, count } = request;
  const searchQuery = `${category} in ${city}`;

  // Apify Compass Google Places Actor
  // actorId: compass/crawler-google-places
  const actorId = 'compass~crawler-google-places';
  const url = `https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyToken}&waitForFinish=120`;

  const inputPayload = {
    searchStringsArray: [searchQuery],
    maxCrawledPlacesPerSearch: count,
    language: 'en',
    scrapeReviews: false,
    scrapeImages: false,
    allPlacesNoSearchAction: false,
  };

  const runRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputPayload),
  });

  if (!runRes.ok) {
    const errorBody = await runRes.text();
    throw new Error(`Apify run failed (${runRes.status}): ${errorBody}`);
  }

  const runData = await runRes.json();
  const datasetId = runData?.data?.defaultDatasetId;

  if (!datasetId) {
    throw new Error("Apify run completed without a dataset ID.");
  }

  // Fetch results from dataset
  const datasetRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&limit=${count}`
  );

  if (!datasetRes.ok) {
    throw new Error(`Failed to retrieve Apify dataset items (${datasetRes.status})`);
  }

  const items = await datasetRes.json();
  const validLeads: StandardizedLead[] = [];
  const seenPhones = new Set<string>();

  for (const item of items) {
    const rawPhone = item.phone || item.phoneUnformatted || item.internationalPhone;
    const phone = normalizePhone(rawPhone);

    // Only count and charge for leads with valid mobile/phone contacts
    if (phone && !seenPhones.has(phone)) {
      seenPhones.add(phone);
      validLeads.push({
        name: item.title || item.name || 'Business Contact',
        phone,
        email: item.email || undefined,
        website: item.website || undefined,
        address: item.address || undefined,
        city,
        category,
        rating: typeof item.totalScore === 'number' ? item.totalScore : undefined,
        reviewsCount: typeof item.reviewsCount === 'number' ? item.reviewsCount : undefined,
      });
    }

    if (validLeads.length >= count) {
      break;
    }
  }

  return validLeads;
}
