import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dfyunicrm.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/contact', '/privacy', '/terms', '/p/'],
        disallow: ['/api/', '/admin/', '/dashboard/', '/settings/', '/auth/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'cohere-ai', 'OAI-SearchBot'],
        allow: ['/', '/contact', '/privacy', '/terms', '/p/', '/llms.txt'],
        disallow: ['/api/', '/admin/', '/dashboard/', '/settings/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
