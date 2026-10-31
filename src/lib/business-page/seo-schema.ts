/**
 * Schema.org JSON-LD Generator for AEO (Answer Engine Optimization),
 * SEO (Search Engine Optimization), and GEO (Generative Engine Optimization).
 *
 * Modeled after crawler audit rules from open-seo-crawler to ensure:
 * 1. AI Crawlers (GPTBot, PerplexityBot, ClaudeBot, OAI-SearchBot) can cite the business.
 * 2. Search Engines (Google, Bing) get rich local business cards & product snippets.
 * 3. Exact NAP (Name, Address, Phone) & WhatsApp communication channel consistency.
 */

import { BusinessPageRecord } from '@/components/business-page/public-page-view';

export function generateBusinessJsonLd(page: BusinessPageRecord, siteUrl: string) {
  const canonicalUrl = `${siteUrl}/p/${page.slug}`;
  const cleanPhone = page.calling_number || page.whatsapp_number;
  const cleanWa = page.whatsapp_number.replace(/[^0-9]/g, '');

  // 1. LocalBusiness Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${canonicalUrl}#localbusiness`,
    name: page.title,
    description: page.tagline || page.about || `Verified business profile for ${page.title}`,
    url: canonicalUrl,
    telephone: cleanPhone,
    image: page.cover_url || page.logo_url || `${siteUrl}/icon.png`,
    priceRange: '₹₹',
    ...(page.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: page.address,
            addressCountry: 'IN',
          },
        }
      : {}),
    ...(page.google_maps_url
      ? {
          hasMap: page.google_maps_url,
        }
      : {}),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: cleanPhone,
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
      },
    ],
    sameAs: [
      `https://wa.me/${cleanWa}`,
      ...(page.google_maps_url ? [page.google_maps_url] : []),
    ],
  };

  // 2. OfferCatalog / Product Schema for Catalog Items (enables AI agents to cite catalog prices)
  const offersList = (page.items || []).map((item, idx) => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Product',
      name: item.title,
      description: item.description || item.title,
      category: item.category || 'General',
      image: item.image_url || page.cover_url || page.logo_url,
      sku: `${page.slug}-${idx + 1}`,
    },
    price: item.price ? item.price.replace(/[^0-9.]/g, '') || '0' : '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: `${canonicalUrl}#item-${item.id}`,
  }));

  const catalogSchema = offersList.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'OfferCatalog',
        name: `${page.title} Catalog & Services`,
        itemListElement: offersList,
      }
    : null;

  // 3. BreadcrumbList for Search Engine Nav
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: canonicalUrl,
      },
    ],
  };

  return {
    localBusinessSchema,
    catalogSchema,
    breadcrumbSchema,
  };
}
