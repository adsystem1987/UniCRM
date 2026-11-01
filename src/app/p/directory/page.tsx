import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MapPin, Building2, Tag, ExternalLink } from 'lucide-react';
import { getAdminClient } from '@/lib/gdrive/offload';
import { PublicDirectoryPageItem } from '@/components/business-page/public-directory-view';
import { SHOWCASE_BUSINESS_PAGES } from '@/lib/business-page/showcase-data';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dfyunicrm.com';

export const metadata: Metadata = {
  title: 'Yellow Pages Directory — Businesses by Category, City & Alphabetical Index | UniCRM',
  description:
    'Comprehensive business directory index organized alphabetically by company name, industry category, and city location across India.',
  alternates: {
    canonical: `${siteUrl}/p/directory`,
  },
};

async function getAllDirectoryPages(): Promise<PublicDirectoryPageItem[]> {
  try {
    const admin = getAdminClient();
    const { data } = await admin
      .from('business_pages')
      .select('id, slug, title, tagline, about, whatsapp_number, address, google_maps_url, logo_url, cover_url, items, view_count, lead_count')
      .eq('is_published', true)
      .limit(100);

    const publishedPages = (data || []).map((row) => ({
      ...row,
      items: Array.isArray(row.items) ? row.items : [],
    })) as PublicDirectoryPageItem[];

    const existingSlugs = new Set(publishedPages.map((p) => p.slug));
    return [
      ...publishedPages,
      ...SHOWCASE_BUSINESS_PAGES.filter((p) => !existingSlugs.has(p.slug)),
    ];
  } catch {
    return SHOWCASE_BUSINESS_PAGES;
  }
}

function inferCategory(page: PublicDirectoryPageItem): string {
  const text = `${page.title} ${page.tagline || ''} ${page.about || ''} ${(page.items || []).map((i) => `${i.title} ${i.category || ''}`).join(' ')}`.toLowerCase();
  if (text.includes('solar') || text.includes('epc') || text.includes('clean energy')) return 'Solar & Clean Energy';
  if (text.includes('realty') || text.includes('property') || text.includes('villa') || text.includes('estate') || text.includes('residence')) return 'Real Estate & Properties';
  if (text.includes('loan') || text.includes('mortgage') || text.includes('finance') || text.includes('dsa') || text.includes('capital')) return 'Loans & Financial Services';
  if (text.includes('stay') || text.includes('hotel') || text.includes('resort') || text.includes('homestay')) return 'Hotels & Homestays';
  if (text.includes('clinic') || text.includes('health') || text.includes('doctor') || text.includes('wellness')) return 'Healthcare & Wellness';
  if (text.includes('tour') || text.includes('travel') || text.includes('cab')) return 'Tours & Travel';
  return 'Professional & Local Services';
}

function extractLocations(address?: string): string[] {
  if (!address) return ['Pan-India'];
  const knownCities = [
    'Mumbai', 'Delhi', 'New Delhi', 'Bangalore', 'Bengaluru', 'Gurgaon', 'Gurugram',
    'Noida', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur',
    'Chandigarh', 'Goa', 'Indore', 'Kochi'
  ];
  const matched = knownCities.filter((city) => address.toLowerCase().includes(city.toLowerCase()));
  return matched.length > 0 ? matched : [address.split(',')[0].trim() || 'Pan-India'];
}

export default async function YellowPagesDirectory() {
  const pages = await getAllDirectoryPages();

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const alphabeticalGroups: Record<string, PublicDirectoryPageItem[]> = {};
  alphabet.forEach((char) => {
    alphabeticalGroups[char] = [];
  });
  alphabeticalGroups['#'] = [];

  pages.forEach((p) => {
    const firstChar = p.title.trim().charAt(0).toUpperCase();
    if (alphabet.includes(firstChar)) {
      alphabeticalGroups[firstChar].push(p);
    } else {
      alphabeticalGroups['#'].push(p);
    }
  });

  Object.keys(alphabeticalGroups).forEach((k) => {
    alphabeticalGroups[k].sort((a, b) => a.title.localeCompare(b.title));
  });

  const categoryGroups: Record<string, PublicDirectoryPageItem[]> = {};
  pages.forEach((p) => {
    const cat = inferCategory(p);
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(p);
  });

  const locationGroups: Record<string, PublicDirectoryPageItem[]> = {};
  pages.forEach((p) => {
    const locs = extractLocations(p.address);
    locs.forEach((loc) => {
      if (!locationGroups[loc]) locationGroups[loc] = [];
      locationGroups[loc].push(p);
    });
  });

  const allActiveLetters = Object.keys(alphabeticalGroups).filter(
    (char) => alphabeticalGroups[char].length > 0
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-background sticky top-0 z-20 px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/p"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Directory</span>
            </Link>
            <span className="text-border">|</span>
            <span className="font-bold text-sm text-foreground">Yellow Pages A–Z</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              List Your Business Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="border-b border-border bg-muted/30 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Tag className="h-3.5 w-3.5" />
            <span>Master Yellow Pages &amp; Business Index</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Business Directory Index
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Browse verified Indian enterprises, contractors, lending brokers, and luxury properties categorized by alphabetical letter, industry niche, and city location.
          </p>

          {/* Jump Anchor Bar */}
          <div className="pt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-2">Jump to:</span>
            {alphabet.map((letter) => {
              const hasEntries = (alphabeticalGroups[letter]?.length || 0) > 0;
              return (
                <a
                  key={letter}
                  href={hasEntries ? `#letter-${letter}` : undefined}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
                    hasEntries
                      ? 'bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground'
                      : 'text-muted-foreground/30 pointer-events-none'
                  }`}
                >
                  {letter}
                </a>
              );
            })}
            <a
              href="#categories"
              className="ml-2 px-2.5 py-1 rounded-md text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              By Category ↓
            </a>
            <a
              href="#locations"
              className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              By City Location ↓
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl w-full px-4 py-12 sm:px-8 space-y-16 flex-1">
        {/* Section 1: Alphabetical A–Z Index */}
        <section id="alphabetical" className="space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Alphabetical Index (A–Z)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Listing all verified enterprise storefronts alphabetically
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted border border-border text-foreground">
              {pages.length} Businesses
            </span>
          </div>

          <div className="space-y-10">
            {allActiveLetters.map((letter) => (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shadow-xs">
                    {letter}
                  </div>
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {alphabeticalGroups[letter].length} {alphabeticalGroups[letter].length === 1 ? 'business' : 'businesses'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alphabeticalGroups[letter].map((biz) => (
                    <Link
                      key={biz.id}
                      href={`/p/${biz.slug}`}
                      className="group p-4 rounded-xl border border-border bg-card hover:border-emerald-500/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {biz.title}
                          </h3>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {biz.tagline && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {biz.tagline}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate max-w-[160px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          {biz.address ? biz.address.split(',')[0] : 'Pan-India'}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {biz.items.length} {biz.items.length === 1 ? 'Offering' : 'Offerings'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Industry Category Index */}
        <section id="categories" className="scroll-mt-20 space-y-8">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Industry Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore businesses structured by trade, specialization, and service vertical
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(categoryGroups).map((catName) => (
              <div key={catName} className="p-5 rounded-2xl border border-border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-sm text-foreground">{catName}</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    {categoryGroups[catName].length} listings
                  </span>
                </div>

                <div className="divide-y divide-border/40">
                  {categoryGroups[catName].map((biz) => (
                    <Link
                      key={biz.id}
                      href={`/p/${biz.slug}`}
                      className="py-2.5 flex items-center justify-between text-xs hover:text-emerald-600 transition-colors group"
                    >
                      <span className="font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {biz.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground group-hover:text-foreground">
                        {biz.address ? biz.address.split(',')[0] : 'Pan-India'} &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Location / City Index */}
        <section id="locations" className="scroll-mt-20 space-y-8">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">City &amp; Location Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified physical and regional presence across metropolitan hubs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(locationGroups).map((city) => (
              <div key={city} className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{city}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {locationGroups[city].length}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs">
                  {locationGroups[city].map((biz) => (
                    <li key={biz.id}>
                      <Link
                        href={`/p/${biz.slug}`}
                        className="text-muted-foreground hover:text-foreground transition-colors truncate block"
                      >
                        • {biz.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Directory Footer */}
      <footer className="border-t border-border bg-muted/20 px-4 py-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">UniCRM Yellow Pages</span>
            <span>•</span>
            <span>Alphabetical &amp; Categorical Registry</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/p" className="hover:text-foreground transition-colors">
              Grid Directory
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Platform Home
            </Link>
            <Link href="/contact" className="text-emerald-500 font-semibold hover:underline">
              Submit Business
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
