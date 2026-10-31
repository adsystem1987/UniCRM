import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/gdrive/offload';
import { PublicBusinessPageView, BusinessPageRecord } from '@/components/business-page/public-page-view';
import { generateBusinessJsonLd } from '@/lib/business-page/seo-schema';
import { SHOWCASE_BUSINESS_PAGES } from '@/lib/business-page/showcase-data';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dfyunicrm.com';

async function getBusinessPage(slug: string): Promise<BusinessPageRecord | null> {
  const normalizedSlug = slug.toLowerCase();

  try {
    const admin = getAdminClient();
    const { data } = await admin
      .from('business_pages')
      .select('*')
      .eq('slug', normalizedSlug)
      .eq('is_published', true)
      .maybeSingle();

    if (data) {
      return data as BusinessPageRecord;
    }

    // Check workspace claim tokens (for pre-provisioned outbound businesses)
    const { data: claimToken } = await admin
      .from('workspace_claim_tokens')
      .select('*')
      .eq('page_slug', normalizedSlug)
      .maybeSingle();

    if (claimToken && claimToken.status !== 'opted_out') {
      const categoryLabel = claimToken.category?.replace(/_/g, ' ') || 'Professional Services';
      return {
        id: claimToken.id,
        account_id: claimToken.account_id || 'unclaimed',
        slug: claimToken.page_slug,
        title: claimToken.business_name,
        tagline: `Verified ${categoryLabel}${claimToken.city ? ` in ${claimToken.city}` : ''}`,
        about: `Welcome to the official digital page of ${claimToken.business_name}. Connect directly with our team for inquiries, pricing, and appointments.`,
        whatsapp_number: claimToken.phone || '919876543210',
        calling_number: claimToken.phone || null,
        address: claimToken.city || '',
        google_maps_url: '',
        logo_url: '',
        cover_url: '',
        items: [],
        is_published: true,
        view_count: 1,
        lead_count: 0,
        created_at: claimToken.created_at,
        updated_at: claimToken.created_at,
      } as BusinessPageRecord;
    }
  } catch (err) {
    console.error('[getBusinessPage] supabase fetch error, checking showcase fallback:', err);
  }

  // Fallback to verified showcase templates for cold outreach & live demos
  const showcase = SHOWCASE_BUSINESS_PAGES.find((p) => p.slug === normalizedSlug);
  if (showcase) {
    return {
      id: showcase.id,
      account_id: 'showcase-account',
      slug: showcase.slug,
      title: showcase.title,
      tagline: showcase.tagline || '',
      about: showcase.about || '',
      whatsapp_number: showcase.whatsapp_number,
      calling_number: showcase.calling_number || showcase.whatsapp_number,
      address: showcase.address || '',
      google_maps_url: showcase.google_maps_url || '',
      logo_url: showcase.logo_url || '',
      cover_url: showcase.cover_url || '',
      items: showcase.items || [],
      is_published: true,
      view_count: showcase.view_count || 100,
      lead_count: showcase.lead_count || 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as BusinessPageRecord;
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBusinessPage(slug);

  if (!page) {
    return {
      title: 'Business Not Found | UniCRM',
    };
  }

  const canonicalUrl = `${siteUrl}/p/${slug}`;

  return {
    title: `${page.title} | Verified Business Profile & Catalog`,
    description: page.tagline || page.about || `Connect with ${page.title} directly via WhatsApp and direct call. View offerings, pricing, and services.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.tagline || page.about || '',
      url: canonicalUrl,
      siteName: `${page.title} via UniCRM`,
      type: 'website',
      images: page.cover_url ? [page.cover_url] : page.logo_url ? [page.logo_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.tagline || page.about || '',
      images: page.cover_url ? [page.cover_url] : page.logo_url ? [page.logo_url] : [],
    },
    other: {
      'geo.placename': page.address || 'India',
    },
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getBusinessPage(slug);

  if (!page) {
    notFound();
  }

  const { localBusinessSchema, catalogSchema, breadcrumbSchema } = generateBusinessJsonLd(page, siteUrl);

  return (
    <>
      {/* AEO & GEO Structured Data (JSON-LD) for Search & AI Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {catalogSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PublicBusinessPageView page={page} />
    </>
  );
}
