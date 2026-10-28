'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Home,
  Ticket,
  Users,
  ArrowLeft,
  Store,
  ExternalLink,
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
  item_type?: 'service' | 'stay' | 'event';
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

  // Airbnb stays & Eventbrite ticket parameters
  const [checkInDate, setCheckInDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    return dayAfter.toISOString().split('T')[0];
  });
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [ticketsCount, setTicketsCount] = useState<number>(1);
  const [bookedTicketCode, setBookedTicketCode] = useState<string | null>(null);

  // Helper to determine booking pattern of current item
  const getItemBookingType = (item?: BusinessItem | null): 'stay' | 'event' | 'appointment' => {
    if (!item) return 'appointment';
    if (item.item_type === 'stay') return 'stay';
    if (item.item_type === 'event') return 'event';
    const cat = (item.category || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    if (
      cat.includes('stay') ||
      cat.includes('hotel') ||
      cat.includes('homestay') ||
      cat.includes('room') ||
      cat.includes('villa') ||
      title.includes('stay') ||
      title.includes('villa') ||
      title.includes('night') ||
      title.includes('room')
    ) {
      return 'stay';
    }
    if (
      cat.includes('event') ||
      cat.includes('workshop') ||
      cat.includes('ticket') ||
      cat.includes('pass') ||
      cat.includes('festival') ||
      cat.includes('webinar') ||
      title.includes('workshop') ||
      title.includes('event') ||
      title.includes('summit') ||
      title.includes('ticket')
    ) {
      return 'event';
    }
    return 'appointment';
  };

  const activeBookingType = getItemBookingType(selectedItemForBooking);

  // Calculate nights for stay
  const totalNights = (() => {
    try {
      const inD = new Date(checkInDate);
      const outD = new Date(checkOutDate);
      const diffTime = outD.getTime() - inD.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  })();

  // Calculate estimated price
  const calculateEstimatedTotal = (): string | null => {
    if (!selectedItemForBooking?.price) return null;
    const rawNum = selectedItemForBooking.price.replace(/[^0-9.]/g, '');
    const unitPrice = parseFloat(rawNum);
    if (isNaN(unitPrice)) return selectedItemForBooking.price;

    const currencySymbol = selectedItemForBooking.price.replace(/[0-9.,\s]/g, '') || '₹';
    if (activeBookingType === 'stay') {
      const total = unitPrice * totalNights;
      return `${currencySymbol}${total.toLocaleString()}`;
    }
    if (activeBookingType === 'event') {
      const total = unitPrice * ticketsCount;
      return `${currencySymbol}${total.toLocaleString()}`;
    }
    return selectedItemForBooking.price;
  };

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
    if (!bookingName.trim() || !bookingPhone.trim()) {
      toast.error('Please fill in your name and WhatsApp phone number.');
      return;
    }

    if (activeBookingType === 'stay' && (!checkInDate || !checkOutDate)) {
      toast.error('Please select both check-in and check-out dates.');
      return;
    }

    if (activeBookingType === 'appointment' && (!bookingDate || !bookingSlot)) {
      toast.error('Please select preferred date and time slot.');
      return;
    }

    const calculatedPrice = calculateEstimatedTotal();

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
          bookingDate: activeBookingType === 'stay' ? checkInDate : bookingDate,
          timeSlot: activeBookingType === 'stay' ? '12:00 PM (Check-in)' : bookingSlot,
          itemId: selectedItemForBooking?.id || null,
          itemTitle: selectedItemForBooking?.title || null,
          notes: bookingNotes.trim() || null,
          bookingType: activeBookingType,
          checkInDate: activeBookingType === 'stay' ? checkInDate : null,
          checkOutDate: activeBookingType === 'stay' ? checkOutDate : null,
          guestsCount: activeBookingType === 'stay' ? guestsCount : null,
          totalNights: activeBookingType === 'stay' ? totalNights : null,
          ticketsCount: activeBookingType === 'event' ? ticketsCount : null,
          totalPrice: calculatedPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process booking');
      }

      setBookingSuccess(true);
      if (data.booking?.ticket_reference_code) {
        setBookedTicketCode(data.booking.ticket_reference_code);
      }
      if (data.clientWaDeepLink) {
        setBookingWaDeepLink(data.clientWaDeepLink);
      }
      if (data.clientCalendarLink) {
        setBookingCalendarLink(data.clientCalendarLink);
      }
      toast.success(
        activeBookingType === 'stay'
          ? 'Stay booked successfully! WhatsApp confirmation sent.'
          : activeBookingType === 'event'
          ? 'Tickets confirmed! Your digital WhatsApp pass has been issued.'
          : 'Appointment booked successfully! WhatsApp confirmation sent.'
      );
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground antialiased selection:bg-emerald-500 selection:text-white pb-24 sm:pb-16">
      {/* Universal Top Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/p"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2.5 rounded-xl hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to Directory</span>
              <span className="sm:hidden">Directory</span>
            </Link>

            <span className="text-border">|</span>

            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="UniCRM"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <span className="font-black text-sm tracking-tight text-foreground hidden sm:inline">
                UniCRM
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-opacity shadow-xs"
            >
              <Store className="size-3.5" />
              <span className="hidden md:inline">Create Your Page</span>
              <span className="md:hidden">Get Yours</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner / Cover */}
      <div className="relative h-48 sm:h-64 lg:h-80 w-full bg-linear-to-br from-emerald-700 via-teal-700 to-slate-950 overflow-hidden">
        {page.cover_url && (
          <Image
            src={page.cover_url}
            alt={page.title}
            fill
            className="object-cover opacity-65"
            priority
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 max-w-7xl mx-auto flex items-end justify-between z-10 text-white">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
              <CheckCircle2 className="size-3 text-emerald-300" />
              Verified Direct Desk
            </span>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column (Main Content: Profile, Services, Offers) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Primary Profile Card */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-xl backdrop-blur-xs">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                {/* Logo / Avatar */}
                <div className="relative size-20 sm:size-24 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-3xl font-black shadow-lg border-4 border-background overflow-hidden shrink-0">
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
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground truncate">
                      {page.title}
                    </h1>
                    <CheckCircle2 className="size-5 sm:size-6 text-emerald-500 fill-emerald-500/20 shrink-0" />
                  </div>

                  {page.tagline && (
                    <p className="text-sm sm:text-base font-medium text-emerald-600 dark:text-emerald-400">
                      {page.tagline}
                    </p>
                  )}

                  {page.address && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-muted-foreground pt-1">
                      <MapPin className="size-4 text-emerald-600 shrink-0" />
                      {page.google_maps_url ? (
                        <a
                          href={page.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-foreground line-clamp-1 flex items-center gap-1"
                        >
                          <span>{page.address}</span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="line-clamp-1">{page.address}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {page.about && (
                <div className="mt-5 pt-5 border-t border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <p>{page.about}</p>
                </div>
              )}

              {/* Mobile Quick Actions (Shown on sm or smaller) */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:hidden">
                <button
                  onClick={() => openBookingModal()}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-transform active:scale-[0.98]"
                >
                  <Calendar className="size-4" />
                  Book Appointment / Pass
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
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                      <Sparkles className="size-5 text-emerald-500" />
                      Catalog, Services &amp; Passes
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Direct WhatsApp inquiries and guaranteed zero booking commissions.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-full self-start sm:self-auto">
                    {filteredItems.length} of {page.items.length} items
                  </span>
                </div>

                {/* Category Filter Pills */}
                {categories.length > 2 && (
                  <div className="flex flex-wrap items-center gap-2 pb-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat as string)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                          selectedCategory === cat
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Items Grid (Responsive 1-col on mobile, 2-col on md/lg) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:shadow-lg hover:border-emerald-500/50 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {item.image_url ? (
                          <div className="relative h-40 w-full rounded-xl bg-muted overflow-hidden border border-border">
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                            {item.badge && (
                              <div className="absolute top-2.5 left-2.5">
                                <span className="text-[10px] font-bold bg-background/90 text-foreground backdrop-blur-md border border-border/60 px-2 py-0.5 rounded-md shadow-xs">
                                  {item.badge}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Dummy Fallback Preview Graphic when No Image is Provided */
                          <div className="relative h-32 w-full rounded-xl bg-linear-to-br from-slate-100 via-emerald-50/40 to-teal-100/30 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-800 border border-border/80 flex items-center justify-between p-4 overflow-hidden">
                            <div className="space-y-1 z-10">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                {item.category || 'Service Offering'}
                              </span>
                              <p className="text-xs font-bold text-foreground line-clamp-1">
                                {item.title}
                              </p>
                            </div>
                            <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs z-10">
                              {getItemBookingType(item) === 'stay' ? (
                                <Home className="size-6" />
                              ) : getItemBookingType(item) === 'event' ? (
                                <Ticket className="size-6" />
                              ) : (
                                <Sparkles className="size-6" />
                              )}
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-emerald-500/5 pointer-events-none" />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                              {item.title}
                            </h3>
                            {!item.image_url && item.badge && (
                              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {item.price && (
                            <div className="pt-1">
                              <span className="inline-block text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                {item.price}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openBookingModal(item)}
                          className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
                        >
                          {getItemBookingType(item) === 'stay' ? (
                            <>
                              <Home className="size-3.5" />
                              Reserve Stay
                            </>
                          ) : getItemBookingType(item) === 'event' ? (
                            <>
                              <Ticket className="size-3.5" />
                              Get Pass
                            </>
                          ) : (
                            <>
                              <Calendar className="size-3.5" />
                              Book Slot
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            openWhatsApp(
                              item.prefill_message ||
                                `Hi ${page.title}! I'm interested in "${item.title}". Please share details and availability.`
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center justify-center gap-1.5 border border-border"
                        >
                          <MessageCircle className="size-3.5 fill-current text-emerald-500" />
                          {item.button_label || 'Inquire'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Consultation & Callback Desk (Desktop Sidebar) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Direct Booking Desk Card */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-card p-6 shadow-xl space-y-5">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Clock className="size-3" />
                  Instant Direct Response
                </span>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Connect with {page.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Direct WhatsApp bookings, appointments, and custom quotes with 0% platform surcharge.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => openBookingModal()}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="size-4" />
                  Schedule Slot / Book Pass
                </button>

                <button
                  onClick={() => openWhatsApp()}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-4 fill-current text-emerald-500" />
                  Chat Directly on WhatsApp
                </button>
              </div>

              {/* Direct Callback Form */}
              <div id="inquiry-section" className="pt-4 border-t border-border space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">
                    Request an Instant Callback
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Leave your contact details and our team will message you shortly.
                  </p>
                </div>

                {submitted ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
                    <CheckCircle2 className="size-7 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-foreground">
                      Inquiry Received!
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Thank you, {inquiryName}. The {page.title} team has been notified.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleQuickLeadSubmit} className="space-y-2.5">
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
                    <textarea
                      placeholder="Requirements / preferred time (Optional)"
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
                          Submit Request
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* UniCRM Powered By Pill */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-foreground">
                Run your business on UniCRM
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Free DIY core with Google Drive media storage &amp; WhatsApp automation.
              </p>
              <div className="pt-1.5">
                <Link
                  href="/signup"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  Create your own free page &rarr;
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Global Directory Footer */}
        <footer className="mt-16 pt-8 border-t border-border/60 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Verified Business Profile hosted on{' '}
            <Link href="/" className="font-bold text-foreground hover:underline">
              UniCRM
            </Link>{' '}
            • Zero-Commission Direct WhatsApp Platform
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
            <Link href="/p" className="hover:text-foreground hover:underline">
              Browse Business Directory
            </Link>
            <span>•</span>
            <Link href="/signup" className="hover:text-foreground hover:underline">
              Claim Your Business
            </Link>
          </div>
        </footer>
      </main>

      {/* Persistent Floating Bottom Bar for Mobile Only */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-between lg:hidden gap-2 shadow-lg">
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
                      {activeBookingType === 'stay' ? (
                        <Home className="size-4" />
                      ) : activeBookingType === 'event' ? (
                        <Ticket className="size-4" />
                      ) : (
                        <CalendarCheck className="size-4" />
                      )}
                    </span>
                    <h3 className="font-bold text-base text-foreground">
                      {activeBookingType === 'stay'
                        ? 'Reserve Your Stay'
                        : activeBookingType === 'event'
                        ? 'Event Registration & Tickets'
                        : 'Book an Appointment'}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedItemForBooking
                      ? `${selectedItemForBooking.title}`
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
                    {activeBookingType === 'stay'
                      ? 'Stay Confirmed!'
                      : activeBookingType === 'event'
                      ? 'Tickets Reserved!'
                      : 'Booking Confirmed!'}
                  </h4>

                  {activeBookingType === 'stay' ? (
                    <div className="text-xs text-muted-foreground leading-relaxed px-4 space-y-1">
                      <p>
                        Your stay is scheduled from{' '}
                        <strong className="text-foreground">{checkInDate}</strong> to{' '}
                        <strong className="text-foreground">{checkOutDate}</strong> ({totalNights} nights, {guestsCount} guests).
                      </p>
                      {calculateEstimatedTotal() && (
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          Total Estimate: {calculateEstimatedTotal()}
                        </p>
                      )}
                      <p className="text-[11px] pt-1">A WhatsApp confirmation with property details has been sent to your phone.</p>
                    </div>
                  ) : activeBookingType === 'event' ? (
                    <div className="text-xs text-muted-foreground leading-relaxed px-4 space-y-1.5">
                      <p>
                        You reserved <strong className="text-foreground">{ticketsCount} ticket{ticketsCount > 1 ? 's' : ''}</strong> for{' '}
                        <strong className="text-foreground">{selectedItemForBooking?.title || page.title}</strong>.
                      </p>
                      {bookedTicketCode && (
                        <div className="py-1">
                          <span className="inline-block px-3 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono font-bold text-sm border border-purple-500/20">
                            Pass: {bookedTicketCode}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px]">Your digital pass has been sent directly to your WhatsApp number.</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground leading-relaxed px-4">
                      Your appointment has been scheduled for{' '}
                      <strong className="text-foreground">{bookingDate}</strong> at{' '}
                      <strong className="text-foreground">{bookingSlot}</strong>.
                      A WhatsApp reminder has been sent to your number.
                    </p>
                  )}

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

                  {/* Dynamic Inputs Based on Airbnb Stay / Eventbrite Event / Appointment */}
                  {activeBookingType === 'stay' ? (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                            <Calendar className="size-3 text-emerald-500" />
                            Check-in Date
                          </label>
                          <input
                            type="date"
                            required
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                            <Calendar className="size-3 text-emerald-500" />
                            Check-out Date
                          </label>
                          <input
                            type="date"
                            required
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                            <Users className="size-3 text-emerald-500" />
                            Guests
                          </label>
                          <select
                            value={guestsCount}
                            onChange={(e) => setGuestsCount(Number(e.target.value))}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((g) => (
                              <option key={g} value={g}>
                                {g} {g === 1 ? 'Guest' : 'Guests'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Duration &amp; Price
                          </label>
                          <div className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground flex items-center justify-between">
                            <span>{totalNights} Night{totalNights > 1 ? 's' : ''}</span>
                            {calculateEstimatedTotal() && (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {calculateEstimatedTotal()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : activeBookingType === 'event' ? (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                            <Ticket className="size-3 text-purple-500" />
                            Number of Tickets
                          </label>
                          <select
                            value={ticketsCount}
                            onChange={(e) => setTicketsCount(Number(e.target.value))}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                          >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map((t) => (
                              <option key={t} value={t}>
                                {t} Ticket{t > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Total Pass Amount
                          </label>
                          <div className="w-full rounded-xl border border-border bg-purple-500/5 px-3 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-between">
                            <span>{ticketsCount} Pass{ticketsCount > 1 ? 'es' : ''}</span>
                            <span>{calculateEstimatedTotal() || 'Free RSVP'}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
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
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">
                      Special Requirements / Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        activeBookingType === 'stay'
                          ? 'Arrival time, extra bed request, dietary preferences...'
                          : activeBookingType === 'event'
                          ? 'Attendee names, company or guest details...'
                          : 'Any specific questions or preparation details...'
                      }
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-md ${
                        activeBookingType === 'event'
                          ? 'bg-purple-600 hover:bg-purple-500'
                          : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                    >
                      {bookingSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Processing...
                        </>
                      ) : activeBookingType === 'stay' ? (
                        <>
                          <Home className="size-3.5" />
                          Reserve Stay &amp; Get WhatsApp Confirmation
                        </>
                      ) : activeBookingType === 'event' ? (
                        <>
                          <Ticket className="size-3.5" />
                          Confirm Tickets &amp; Get Digital Pass
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
