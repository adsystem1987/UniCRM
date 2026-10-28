import { MetadataRoute } from 'next';
import { getAdminClient } from '@/lib/gdrive/offload';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dfyunicrm.com';
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/p`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const admin = getAdminClient();
    const { data: businessPages } = await admin
      .from('business_pages')
      .select('slug, updated_at')
      .eq('is_published', true)
      .limit(100);

    const businessRoutes: MetadataRoute.Sitemap = (businessPages || []).map((page) => ({
      url: `${siteUrl}/p/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    return [...staticRoutes, ...businessRoutes];
  } catch {
    return staticRoutes;
  }
}
