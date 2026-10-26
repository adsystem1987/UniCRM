'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  MessageCircle,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Loader2,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface BusinessItem {
  id: string;
  title: string;
  category?: string;
  description?: string;
  price?: string;
  badge?: string;
  image_url?: string;
  button_label?: string;
  prefill_message?: string;
}

export interface BusinessPageRecord {
  id: string;
  account_id: string;
  slug: string;
  title: string;
  tagline?: string;
  about?: string;
  whatsapp_number: string;
  calling_number?: string;
  address?: string;
  google_maps_url?: string;
  logo_url?: string;
  cover_url?: string;
  items: BusinessItem[];
  view_count: number;
}

export function PublicBusinessPageView({ page }: { page: BusinessPageRecord }) {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Compute unique categories
  const categories = ['All', ...Array.from(new Set(page.items.map((it) => it.category).filter(Boolean)))];

  const filteredItems = selectedCategory === 'All'
    ? page.items
    : page.items.filter((it) => it.category === selectedCategory);

  const cleanWaNumber = page.whatsapp_number.replace(/[^0-9]/g, '');

  const openWhatsApp = (customMessage?: string) => {
    const defaultText = `Hi ${page.title}! I am reaching out from your business link. I'd like more details.`;
    const message = customMessage || defaultText;
    const url = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: page.title,
          text: page.tagline || page.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Business link copied to clipboard!');
    }
  };

  const handleQuickLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      toast.error('Please enter your name and phone number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/business-pages/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: page.id,
          accountId: page.account_id,
          name: inquiryName.trim(),
          phone: inquiryPhone.trim(),
          notes: inquiryNotes.trim(),
          itemTitle: 'Direct Callback Request',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit inquiry');
      }

      setSubmitted(true);
      toast.success('Request sent! The team will reach out to you shortly.');
    } catch {
      toast.error('Could not send inquiry. Please click the WhatsApp button to chat directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 antialiased selection:bg-emerald-500 selection:text-neutral-950 pb-24">
      {/* Top Banner / Cover */}
      <div className="relative h-48 sm:h-64 w-full bg-neutral-950 overflow-hidden border-b border-neutral-800">
        {page.cover_url ? (
          <Image
            src={page.cover_url}
            alt="Cover"
            fill
            className="object-cover opacity-50"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
        
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-700/60 shadow-xs backdrop-blur-md transition-colors"
        >
          <Share2 className="size-3.5" />
          Share Page
        </button>
      </div>

      {/* Main Profile Card Container */}
      <main className="max-w-xl mx-auto px-4 -mt-20 sm:-mt-24 relative z-20 space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            {/* Logo / Avatar */}
            <div className="relative size-20 sm:size-24 rounded-2xl bg-neutral-800 text-emerald-400 font-mono flex items-center justify-center text-2xl font-black border border-neutral-700 shadow-inner overflow-hidden shrink-0">
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

            {/* Profile Info */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                  {page.title}
                </h1>
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              </div>
              {page.tagline && (
                <p className="text-xs sm:text-sm font-medium text-emerald-400/90 leading-snug">
                  {page.tagline}
                </p>
              )}
              {page.address && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-neutral-400 pt-0.5">
                  <MapPin className="size-3 text-neutral-500 shrink-0" />
                  {page.google_maps_url ? (
                    <a
                      href={page.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-neutral-200 line-clamp-1"
                    >
                      {page.address}
                    </a>
                  ) : (
                    <span className="line-clamp-1">{page.address}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {page.about && (
            <p className="pt-4 border-t border-neutral-800/80 text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              {page.about}
            </p>
          )}

          {/* Primary Action Buttons */}
          <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => openWhatsApp()}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.99]"
            >
              <MessageCircle className="size-4 fill-current" />
              Chat on WhatsApp
            </button>
            {page.calling_number ? (
              <a
                href={`tel:${page.calling_number}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80 transition-colors"
              >
                <Phone className="size-3.5" />
                Call Directly
              </a>
            ) : (
              <button
                onClick={() => {
                  const formEl = document.getElementById('inquiry-section');
                  formEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80 transition-colors"
              >
                <Clock className="size-3.5" />
                Request Callback
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Items / Offers Section */}
        {page.items && page.items.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-emerald-400" />
                Featured Offerings &amp; Rates
              </h2>
              <span className="text-[11px] font-mono text-neutral-500">
                {filteredItems.length} of {page.items.length}
              </span>
            </div>

            {/* Category Filter Pills (if categories exist) */}
            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as string)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                      selectedCategory === cat
                        ? 'bg-neutral-100 text-neutral-950 font-bold shadow-xs'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 hover:border-neutral-700 transition-colors flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex gap-3.5">
                    {item.image_url && (
                      <div className="relative size-18 rounded-xl bg-neutral-800 overflow-hidden shrink-0 border border-neutral-800">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-bold text-sm text-white">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.price && (
                        <div className="pt-0.5">
                          <span className="inline-block text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {item.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center sm:self-center shrink-0">
                    <button
                      onClick={() =>
                        openWhatsApp(
                          item.prefill_message ||
                            `Hi ${page.title}! I'm interested in "${item.title}". Please share details and availability.`
                        )
                      }
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-emerald-500 text-neutral-200 hover:text-neutral-950 transition-colors flex items-center justify-center gap-1.5 border border-neutral-700 hover:border-emerald-500"
                    >
                      <MessageCircle className="size-3.5 fill-current" />
                      {item.button_label || 'Inquire on WhatsApp'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Callback / Lead Capture Box */}
        <div id="inquiry-section" className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white">
              Prefer a callback? Leave your details
            </h3>
            <p className="text-xs text-neutral-400">
              We will reach out to you directly on WhatsApp or phone.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
              <CheckCircle2 className="size-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-white">
                Inquiry Received!
              </p>
              <p className="text-[11px] text-neutral-400">
                Thank you, {inquiryName}. The {page.title} team has been notified.
              </p>
            </div>
          ) : (
            <form onSubmit={handleQuickLeadSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone Number"
                  required
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <textarea
                placeholder="What are you looking for? (Optional)"
                rows={2}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-emerald-500 resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-950 hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Submit Callback Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 text-center space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Powered by{' '}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-foreground hover:underline"
            >
              UniCRM
            </a>{' '}
            — End-to-End Business Operating System
          </p>
        </div>
      </main>

      {/* Persistent Floating Bottom Bar for Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-3 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 flex items-center justify-between sm:hidden gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold truncate text-white">{page.title}</p>
          <p className="text-[10px] text-emerald-400 font-medium truncate font-mono">
            {page.tagline || 'Verified Business'}
          </p>
        </div>
        <button
          onClick={() => openWhatsApp()}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md"
        >
          <MessageCircle className="size-3.5 fill-current" />
          Chat Now
        </button>
      </div>
    </div>
  );
}
