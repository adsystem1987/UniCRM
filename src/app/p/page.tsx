import type { Metadata } from 'next';
import { getAdminClient } from '@/lib/gdrive/offload';
import { PublicDirectoryView, PublicDirectoryPageItem } from '@/components/business-page/public-directory-view';
import { SHOWCASE_BUSINESS_PAGES } from '@/lib/business-page/showcase-data';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dfyunicrm.com';

export const metadata: Metadata = {
  title: 'Explore Local Businesses, Stays & Services | UniCRM Directory',
  description:
    'Discover verified local businesses, boutique homestays, villas, workshops, and services. Book appointment slots and chat directly on WhatsApp with zero commission.',
  alternates: {
    canonical: `${siteUrl}/p`,
  },
  openGraph: {
    title: 'Explore Local Businesses, Stays & Services | UniCRM Directory',
    description:
      'Direct WhatsApp booking for verified stays, clinics, events, and local services.',
    url: `${siteUrl}/p`,
    type: 'website',
  },
};

async function getPublishedBusinessPages(): Promise<PublicDirectoryPageItem[]> {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from('business_pages')
      .select('id, slug, title, tagline, about, whatsapp_number, address, google_maps_url, logo_url, cover_url, items, view_count, lead_count')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[public directory] error fetching business pages:', error);
      return [];
    }

    return (data || []).map((row) => ({
      ...row,
      items: Array.isArray(row.items) ? row.items : [],
    })) as PublicDirectoryPageItem[];
  } catch (err) {
    console.error('[public directory] server error:', err);
    return [];
  }
}

export default async function PublicDirectoryRoute() {
  const publishedPages = await getPublishedBusinessPages();

  // Merge database published pages with our verified showcase templates
  const existingSlugs = new Set(publishedPages.map((p) => p.slug));
  const mergedPages: PublicDirectoryPageItem[] = [
    ...publishedPages,
    ...SHOWCASE_BUSINESS_PAGES.filter((p) => !existingSlugs.has(p.slug)),
  ];

  return <PublicDirectoryView pages={mergedPages} />;
}
