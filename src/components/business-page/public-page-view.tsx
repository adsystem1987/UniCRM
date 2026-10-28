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
  Calendar,
  X,
  CalendarCheck,
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

  // Booking Modal State
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedItemForBooking, setSelectedItemForBooking] = useState<BusinessItem | null>(null);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingSlot, setBookingSlot] = useState('11:00 AM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingWaDeepLink, setBookingWaDeepLink] = useState<string | null>(null);
  const [bookingCalendarLink, setBookingCalendarLink] = useState<string | null>(null);

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim() || !bookingDate || !bookingSlot) {
      toast.error('Please fill in your name, phone, date, and preferred time slot.');
      return;
    }

    setBookingSubmitting(true);
    try {
      const res = await fetch('/api/business-pages/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: page.id,
          accountId: page.account_id,
          name: bookingName.trim(),
          phone: bookingPhone.trim(),
          bookingDate,
          timeSlot: bookingSlot,
          itemId: selectedItemForBooking?.id || null,
          itemTitle: selectedItemForBooking?.title || null,
          notes: bookingNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule booking');
      }

      setBookingSuccess(true);
      if (data.clientWaDeepLink) {
        setBookingWaDeepLink(data.clientWaDeepLink);
      }
      if (data.clientCalendarLink) {
        setBookingCalendarLink(data.clientCalendarLink);
      }
      toast.success('Appointment booked successfully! WhatsApp confirmation sent.');
    } catch (err: any) {
      toast.error(err.message || 'Could not schedule booking. Please message us on WhatsApp.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const openBookingModal = (item?: BusinessItem) => {
    setSelectedItemForBooking(item || null);
    setBookingSuccess(false);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground antialiased selection:bg-emerald-500 selection:text-white pb-20">
      {/* Top Banner / Cover */}
      <div className="relative h-44 sm:h-56 w-full bg-linear-to-br from-emerald-600 via-teal-600 to-slate-900 overflow-hidden">
        {page.cover_url && (
          <Image
            src={page.cover_url}
            alt="Cover"
            fill
            className="object-cover opacity-60"
            priority
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/20" />
        
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Share2 className="size-3.5" />
          Share
        </button>
      </div>

      {/* Main Profile Card Container */}
      <main className="max-w-xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-20 space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl backdrop-blur-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            {/* Logo / Avatar */}
            <div className="relative size-20 sm:size-24 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-3xl font-black shadow-md border-2 border-background overflow-hidden shrink-0">
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
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {page.title}
                </h1>
                <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-500/20 shrink-0" />
              </div>
              {page.tagline && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {page.tagline}
                </p>
              )}
              {page.address && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground pt-1">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  {page.google_maps_url ? (
                    <a
                      href={page.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline line-clamp-1"
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
            <p className="mt-4 pt-4 border-t border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {page.about}
            </p>
          )}

          {/* Primary Action Buttons */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => openBookingModal()}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-transform active:scale-[0.98]"
            >
              <Calendar className="size-4" />
              Book Appointment / Slot
            </button>
            <button
              onClick={() => openWhatsApp()}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground transition-colors"
            >
              <MessageCircle className="size-4 fill-current text-emerald-500" />
              Chat on WhatsApp
            </button>
          </div>
        </div>

        {/* Dynamic Items / Offers Section */}
        {page.items && page.items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 uppercase">
                <Sparkles className="size-4 text-emerald-500" />
                Featured Services &amp; Offers
              </h2>
              <span className="text-[11px] text-muted-foreground font-medium">
                {filteredItems.length} of {page.items.length} items
              </span>
            </div>

            {/* Category Filter Pills (if categories exist) */}
            {categories.length > 2 && (
              <div className="flex flex-wrap items-center gap-2 pb-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as string)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
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
                  className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex gap-3.5">
                    {item.image_url && (
                      <div className="relative size-18 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
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
                        <h3 className="font-bold text-sm text-foreground">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.price && (
                        <div className="pt-0.5">
                          <span className="inline-block text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {item.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <button
                      onClick={() => openBookingModal(item)}
                      className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Calendar className="size-3.5" />
                      Book Slot
                    </button>
                    <button
                      onClick={() =>
                        openWhatsApp(
                          item.prefill_message ||
                            `Hi ${page.title}! I'm interested in "${item.title}". Please share details and availability.`
                        )
                      }
                      className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/20"
                    >
                      <MessageCircle className="size-3.5 fill-current" />
                      {item.button_label || 'Inquire'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Callback / Lead Capture Box */}
        <div id="inquiry-section" className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-foreground">
              Prefer a callback? Leave your details
            </h3>
            <p className="text-xs text-muted-foreground">
              We will reach out to you directly on WhatsApp or phone.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
              <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-foreground">
                Inquiry Received!
              </p>
              <p className="text-[11px] text-muted-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone Number"
                  required
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <textarea
                placeholder="What are you looking for? (Optional)"
                rows={2}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
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
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-between sm:hidden gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-foreground">{page.title}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
              {page.tagline || 'Verified Business'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => openBookingModal()}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-xs"
            >
              <Calendar className="size-3.5" />
              Book
            </button>
            <button
              onClick={() => openWhatsApp()}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              <MessageCircle className="size-3.5 fill-current" />
              Chat
            </button>
          </div>
        </div>

        {/* Interactive Booking Modal */}
        {bookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in-snappy">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CalendarCheck className="size-4" />
                    </span>
                    <h3 className="font-bold text-base text-foreground">
                      Book an Appointment
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedItemForBooking
                      ? `Service: ${selectedItemForBooking.title}`
                      : `With ${page.title}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">
                    Booking Confirmed!
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed px-4">
                    Your appointment has been scheduled for{' '}
                    <strong className="text-foreground">{bookingDate}</strong> at{' '}
                    <strong className="text-foreground">{bookingSlot}</strong>.
                    A WhatsApp reminder has been sent to your number.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    {bookingCalendarLink && (
                      <a
                        href={bookingCalendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors"
                      >
                        <Calendar className="size-3.5" />
                        Add to Google Calendar
                      </a>
                    )}

                    {bookingWaDeepLink && (
                      <a
                        href={bookingWaDeepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                      >
                        <MessageCircle className="size-3.5 fill-current" />
                        Chat on WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setBookingOpen(false)}
                      className="w-full py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">
                      WhatsApp Phone Number (with Country Code)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground">
                        Time Slot
                      </label>
                      <select
                        value={bookingSlot}
                        onChange={(e) => setBookingSlot(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:30 PM">03:30 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:30 PM">06:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">
                      Special Requirements / Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any specific questions or preparation details..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      {bookingSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Confirming Slot...
                        </>
                      ) : (
                        <>
                          <CalendarCheck className="size-3.5" />
                          Confirm Booking &amp; Send WhatsApp Reminder
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
