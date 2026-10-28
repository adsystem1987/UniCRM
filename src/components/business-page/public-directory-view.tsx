'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Home,
  Ticket,
  Sparkles,
  ArrowRight,
  Store,
  Layers,
} from 'lucide-react';
import { BusinessItem } from '@/components/business-page/public-page-view';

export interface PublicDirectoryPageItem {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  about?: string;
  whatsapp_number: string;
  address?: string;
  google_maps_url?: string;
  logo_url?: string;
  cover_url?: string;
  items: BusinessItem[];
  view_count?: number;
  lead_count?: number;
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Businesses' },
  { id: 'stays', label: 'Stays & Villas', icon: Home },
  { id: 'events', label: 'Events & Passes', icon: Ticket },
  { id: 'tours', label: 'Tours & Travel' },
  { id: 'wellness', label: 'Clinics & Wellness' },
  { id: 'services', label: 'Professional Services' },
];

export function PublicDirectoryView({ pages }: { pages: PublicDirectoryPageItem[] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Helper to categorize a page based on its items, title, and tagline
  const getPageCategory = (page: PublicDirectoryPageItem): string => {
    const text = `${page.title} ${page.tagline || ''} ${page.about || ''} ${(page.items || []).map((i) => `${i.title} ${i.category || ''}`).join(' ')}`.toLowerCase();

    if (text.includes('stay') || text.includes('hotel') || text.includes('resort') || text.includes('villa') || text.includes('homestay') || text.includes('room')) {
      return 'stays';
    }
    if (text.includes('event') || text.includes('workshop') || text.includes('ticket') || text.includes('pass') || text.includes('summit') || text.includes('fest')) {
      return 'events';
    }
    if (text.includes('tour') || text.includes('travel') || text.includes('holiday') || text.includes('itinerary') || text.includes('cab')) {
      return 'tours';
    }
    if (text.includes('clinic') || text.includes('dental') || text.includes('doctor') || text.includes('hospital') || text.includes('salon') || text.includes('spa') || text.includes('yoga') || text.includes('fitness')) {
      return 'wellness';
    }
    return 'services';
  };

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = getPageCategory(page);
        if (cat !== selectedCategory) return false;
      }

      // Search keyword filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = page.title.toLowerCase().includes(q);
        const matchesTagline = (page.tagline || '').toLowerCase().includes(q);
        const matchesAddress = (page.address || '').toLowerCase().includes(q);
        const matchesItems = (page.items || []).some(
          (item) => item.title.toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q)
        );
        return matchesTitle || matchesTagline || matchesAddress || matchesItems;
      }

      return true;
    });
  }, [pages, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground selection:bg-emerald-500 selection:text-white pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="UniCRM"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="font-black text-base tracking-tight text-foreground">
              UniCRM <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs ml-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Directory</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-opacity shadow-xs"
            >
              <Store className="size-3.5" />
              <span>Create Your Micro-Page</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Search Banner */}
      <section className="relative py-12 md:py-16 bg-linear-to-b from-emerald-500/10 via-teal-500/5 to-transparent border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="size-3.5" />
            Verified Direct WhatsApp Business Pages
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Explore &amp; Book Directly with Local Businesses
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Direct reservations, appointment scheduling, and WhatsApp catalogs with 0% platform commission.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center rounded-2xl border-2 border-border/80 bg-card shadow-lg shadow-emerald-500/5 hover:border-emerald-500/50 transition-colors overflow-hidden">
              <Search className="size-5 text-muted-foreground ml-4 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by business name, stay, service, or city (e.g. Manali, Villa, Dentist)..."
                className="w-full bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mr-3 px-2 py-1 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {CATEGORY_FILTERS.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/30'
                  }`}
                >
                  {Icon && <Icon className="size-3.5" />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between pb-6 border-b border-border/40">
          <div>
            <h2 className="text-base sm:text-lg font-black text-foreground">
              {selectedCategory === 'all'
                ? 'All Verified Businesses'
                : CATEGORY_FILTERS.find((c) => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-xs text-muted-foreground">
              Showing {filteredPages.length} active business{filteredPages.length === 1 ? '' : 'es'}
            </p>
          </div>
        </div>

        {filteredPages.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl mt-8 bg-card/40 space-y-3">
            <Store className="size-10 text-muted-foreground/60 mx-auto" />
            <h3 className="font-bold text-base text-foreground">No businesses found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search
                ? `No businesses matching "${search}". Try searching another keyword or city.`
                : 'No published business pages in this category yet.'}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
                className="mt-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground"
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredPages.map((page) => {
              const cleanWa = page.whatsapp_number.replace(/[^0-9]/g, '');
              const primaryItem = (page.items || [])[0];
              const isStay = getPageCategory(page) === 'stays';
              const isEvent = getPageCategory(page) === 'events';

              return (
                <div
                  key={page.id}
                  className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover & Avatar Header */}
                    <div className="relative h-36 w-full bg-linear-to-br from-emerald-600 via-teal-600 to-slate-800 overflow-hidden">
                      {page.cover_url && (
                        <Image
                          src={page.cover_url}
                          alt={page.title}
                          fill
                          className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {isStay && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                            <Home className="size-2.5" />
                            Stay &amp; Villa
                          </span>
                        )}
                        {isEvent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white flex items-center gap-1 shadow-xs">
                            <Ticket className="size-2.5" />
                            Events &amp; Passes
                          </span>
                        )}
                        {!isStay && !isEvent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/40 text-white backdrop-blur-md border border-white/20">
                            Verified Business
                          </span>
                        )}
                      </div>

                      {/* Logo Avatar */}
                      <div className="absolute -bottom-4 left-5 size-14 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-card overflow-hidden">
                        {page.logo_url ? (
                          <Image
                            src={page.logo_url}
                            alt={page.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          page.title.slice(0, 2).toUpperCase()
                        )}
                      </div>
                    </div>

                    {/* Business Details */}
                    <div className="pt-6 px-5 pb-4 space-y-2.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-base text-foreground truncate">
                          {page.title}
                        </h3>
                        <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
                      </div>

                      {page.tagline && (
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 line-clamp-1">
                          {page.tagline}
                        </p>
                      )}

                      {page.address && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{page.address}</span>
                        </div>
                      )}

                      {/* Featured Item Preview */}
                      {primaryItem && (
                        <div className="mt-3 p-2.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground truncate pr-2">
                              {primaryItem.title}
                            </span>
                            {primaryItem.price && (
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 text-[11px]">
                                {primaryItem.price}
                              </span>
                            )}
                          </div>
                          {primaryItem.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {primaryItem.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 pt-0 border-t border-border/40 mt-2 flex items-center gap-2">
                    <Link
                      href={`/p/${page.slug}`}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Calendar className="size-3.5" />
                      <span>{isStay ? 'Book Stay' : isEvent ? 'Get Tickets' : 'View & Book'}</span>
                      <ArrowRight className="size-3 ml-0.5" />
                    </Link>

                    <a
                      href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                        `Hi ${page.title}! I found your page on the UniCRM Directory. I'd like more details.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white transition-colors border border-emerald-500/20 flex items-center justify-center gap-1 shrink-0"
                    >
                      <MessageCircle className="size-3.5 fill-current" />
                      <span>Chat</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
