import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/gdrive/offload';
import { PublicBusinessPageView } from '@/components/business-page/public-page-view';
import { generateBusinessJsonLd } from '@/lib/business-page/seo-schema';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dfyunicrm.com';

async function getBusinessPage(slug: string) {
  const admin = getAdminClient();
  const { data } = await admin
    .from('business_pages')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .eq('is_published', true)
    .maybeSingle();

  return data;
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
