import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/gdrive/offload';
import { PublicBusinessPageView } from '@/components/business-page/public-page-view';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

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

  return {
    title: `${page.title} | Verified Business Profile`,
    description: page.tagline || page.about || `Connect with ${page.title} directly via WhatsApp and direct call.`,
    openGraph: {
      title: page.title,
      description: page.tagline || page.about || '',
      images: page.cover_url ? [page.cover_url] : page.logo_url ? [page.logo_url] : [],
    },
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getBusinessPage(slug);

  if (!page) {
    notFound();
  }

  return <PublicBusinessPageView page={page} />;
}
