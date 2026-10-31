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
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { UniCrmLogo } from '@/components/brand/logo';
import { ModeToggle } from '@/components/layout/mode-toggle';

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
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [itemErrors, setItemErrors] = useState<Record<string, boolean>>({});

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

    // Stays & Rooms (Airbnb-style room nights, homestay, resort)
    if (
      cat.includes('stay') ||
      cat.includes('hotel') ||
      cat.includes('homestay') ||
      cat.includes('room') ||
      cat.includes('resort') ||
      title.includes('stay') ||
      title.includes('night') ||
      title.includes('room')
    ) {
      return 'stay';
    }

    // Events & Passes (workshops, summits, conferences, tickets, site visit passes)
    if (
      cat.includes('event') ||
      cat.includes('workshop') ||
      cat.includes('ticket') ||
      cat.includes('pass') ||
      cat.includes('festival') ||
      cat.includes('webinar') ||
      cat.includes('site visit') ||
      title.includes('workshop') ||
      title.includes('event') ||
      title.includes('summit') ||
      title.includes('pass') ||
      title.includes('ticket') ||
      title.includes('site visit')
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

  // Calculate estimated price with clean currency and suffix support
  const calculateEstimatedTotal = (): string | null => {
    if (!selectedItemForBooking?.price) return null;
    const priceStr = selectedItemForBooking.price.trim();

    // Match leading currency symbol if present
    const currencyMatch = priceStr.match(/^[^0-9.]+/);
    const currency = currencyMatch ? currencyMatch[0].trim() : '₹';

    // Match number portion
    const numMatch = priceStr.match(/[0-9]+(?:\.[0-9]+)?/);
    if (!numMatch) return priceStr;

    const unitVal = parseFloat(numMatch[0]);
    if (isNaN(unitVal)) return priceStr;

    const multiplier = activeBookingType === 'stay' ? totalNights : activeBookingType === 'event' ? ticketsCount : 1;
    const total = unitVal * multiplier;
    const formattedTotal = Number.isInteger(total) ? total.toLocaleString() : total.toFixed(2);

    // Extract trailing suffix like "Cr onwards", "Lakhs", etc. (stripping per night/person)
    const afterNum = priceStr.slice(priceStr.indexOf(numMatch[0]) + numMatch[0].length).trim();
    const cleanSuffix = afterNum.replace(/^\s*\/\s*(night|person|ticket|pass|slot|pax)/i, '').trim();

    return `${currency}${formattedTotal}${cleanSuffix ? ' ' + cleanSuffix : ''}`;
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Compute unique categories
  const categories = ['All', ...Array.from(new Set(page.items.map((it) => it.category).filter(Boolean)))];

  const filteredItems = selectedCategory === 'All'
    ? page.items
    : page.items.filter((it) => it.category === selectedCategory);

  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      id: 'welcome_1',
      sender: 'agent',
      text: `Hello! 👋 Thanks for reaching out to ${page.title}. How can we assist you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [chatInputText, setChatInputText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const openChatWithMe = (customMsg?: string) => {
    if (customMsg) {
      setChatInputText(customMsg);
    }
    setChatDrawerOpen(true);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    if (!hasStartedChat && (!visitorName.trim() || !visitorPhone.trim())) {
      toast.error('Please provide your name and phone number to start chatting');
      return;
    }

    const outgoingText = chatInputText.trim();
    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user' as const,
      text: outgoingText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInputText('');
    setChatSending(true);

    try {
      const res = await fetch('/api/business-pages/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: page.id,
          accountId: page.account_id,
          name: visitorName.trim() || 'Visitor',
          phone: visitorPhone.trim(),
          notes: outgoingText,
          itemTitle: 'Live Chat Widget Message',
        }),
      });

      if (!res.ok) {
        throw new Error('Message delivery failed');
      }

      setHasStartedChat(true);

      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'agent',
            text: `Thank you! Your message has been received by ${page.title}'s team. We will reply to you right away or follow up via your number.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 700);
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setChatSending(false);
    }
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
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 pb-24 sm:pb-16">
      {/* Universal Top Header / Navbar (Clean, No Auth, No Theme Switch) */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
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
              <UniCrmLogo className="h-7 w-7" showGlow />
              <span className="font-black text-sm tracking-tight text-foreground hidden sm:inline">
                Uni<span className="text-muted-foreground font-semibold">CRM</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              <Share2 className="size-3.5" />
              <span>Share</span>
            </button>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold btn-gold-gradient shadow-xs"
            >
              <Store className="size-3.5" />
              <span className="hidden sm:inline">Create Your Page</span>
              <span className="sm:hidden">Get Yours</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner / Cover: UnitPost Style Radial/Dot Pattern when no image or image error */}
      <div className="relative h-44 sm:h-56 lg:h-64 w-full border-b border-border/40 overflow-hidden bg-surface">
        {page.cover_url && !coverError ? (
          <>
            <Image
              src={page.cover_url}
              alt={page.title}
              fill
              className="object-cover opacity-35"
              priority
              onError={() => setCoverError(true)}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
          </>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="mkt-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(75%_65%_at_50%_40%,black,transparent)]"
            />
            <div className="absolute inset-0 bg-radial from-primary/10 via-background/60 to-background pointer-events-none" />
          </>
        )}
      </div>

      {/* Main Responsive Grid Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column (Main Content: Profile, Services, Offers) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Primary Profile Card */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                {/* Logo / Avatar (UnitPost Branded Monogram) */}
                <div className="relative size-20 sm:size-24 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-black shadow-lg border-4 border-card overflow-hidden shrink-0">
                  {page.logo_url && !logoError ? (
                    <Image
                      src={page.logo_url}
                      alt={page.title}
                      fill
                      className="object-cover"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    page.title.slice(0, 2).toUpperCase()
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground truncate">
                      {page.title}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <CheckCircle2 className="size-3.5 text-primary" />
                      Verified
                    </span>
                  </div>

                  {page.tagline && (
                    <p className="text-sm sm:text-base font-medium text-muted-foreground">
                      {page.tagline}
                    </p>
                  )}

                  {page.address && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-muted-foreground pt-1">
                      <MapPin className="size-4 text-primary shrink-0" />
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
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm btn-gold-gradient shadow-md"
                >
                  <Calendar className="size-4" />
                  Book Appointment / Pass
                </button>
                <button
                  onClick={() => openChatWithMe()}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
                >
                  <MessageSquare className="size-4" />
                  Chat With Me
                </button>
              </div>
            </div>

            {/* Dynamic Items / Offers Section */}
            {page.items && page.items.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                      <Sparkles className="size-5 text-primary" />
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
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
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
                      className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {item.image_url && !itemErrors[item.id] ? (
                          <div className="relative h-40 w-full rounded-xl bg-muted overflow-hidden border border-border">
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                              onError={() => setItemErrors((prev) => ({ ...prev, [item.id]: true }))}
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
                          <div className="relative h-32 w-full rounded-xl bg-surface border border-border/80 flex items-center justify-between p-4 overflow-hidden">
                            <div className="space-y-1 z-10">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                {item.category || 'Service Offering'}
                              </span>
                              <p className="text-xs font-bold text-foreground line-clamp-1">
                                {item.title}
                              </p>
                            </div>
                            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs z-10">
                              {getItemBookingType(item) === 'stay' ? (
                                <Home className="size-6" />
                              ) : getItemBookingType(item) === 'event' ? (
                                <Ticket className="size-6" />
                              ) : (
                                <Sparkles className="size-6" />
                              )}
                            </div>
                            <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-primary/5 pointer-events-none" />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                              {item.title}
                            </h3>
                            {!item.image_url && item.badge && (
                              <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md shrink-0">
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
                              <span className="inline-block text-xs sm:text-sm font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                                {item.price}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/60">
                        {/* If direct WhatsApp order item (e.g. D2C / Products / Storefront) */}
                        {item.button_label?.toLowerCase().includes('order') || item.price ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <a
                              href={`https://wa.me/${page.whatsapp_number}?text=${encodeURIComponent(
                                item.prefill_message || `Hi ${page.title}! I would like to order "${item.title}" (${item.price || ''}). Please confirm availability.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full px-3 py-2.5 rounded-xl text-xs font-bold btn-gold-gradient transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                            >
                              <MessageCircle className="size-4" />
                              {item.button_label || 'Order on WhatsApp'}
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                openChatWithMe(
                                  item.prefill_message ||
                                    `Hi ${page.title}! I have a question about "${item.title}".`
                                )
                              }
                              className="w-full px-3 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center justify-center gap-1.5 border border-border"
                            >
                              <MessageSquare className="size-3.5 text-primary" />
                              Ask Question
                            </button>
                          </div>
                        ) : (
                          /* Standard Service / Stay / Appointment items */
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => openBookingModal(item)}
                              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex items-center justify-center gap-1 shadow-xs"
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
                              type="button"
                              onClick={() =>
                                openChatWithMe(
                                  item.prefill_message ||
                                    `Hi ${page.title}! I'm interested in "${item.title}". Please share details and availability.`
                                )
                              }
                              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center justify-center gap-1.5 border border-border"
                            >
                              <MessageSquare className="size-3.5 text-primary" />
                              {item.button_label || 'Inquire'}
                            </button>
                          </div>
                        )}
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
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
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
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm btn-gold-gradient shadow-md flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="size-4" />
                  Schedule Slot / Book Pass
                </button>

                <button
                  onClick={() => openChatWithMe()}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="size-4" />
                  Chat With Me
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
                  <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center space-y-2">
                    <CheckCircle2 className="size-7 text-primary mx-auto" />
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
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp / Phone Number"
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                    <textarea
                      placeholder="Requirements / preferred time (Optional)"
                      rows={2}
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
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
            <div className="rounded-xl border border-border/80 bg-surface p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-foreground">
                Run your business on UniCRM
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Free DIY core with Google Drive media storage &amp; WhatsApp automation.
              </p>
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
          </div>
        </footer>
      </main>

      {/* Persistent Floating Bottom Bar for Mobile Only */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-between lg:hidden gap-2 shadow-lg safe-bottom">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold truncate text-foreground">{page.title}</p>
          <p className="text-[10px] text-primary font-medium truncate">
            {page.tagline || 'Verified Business'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`https://wa.me/${page.whatsapp_number}?text=${encodeURIComponent(
              `Hi ${page.title}! I'm visiting your page and would like to inquire.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl btn-gold-gradient font-bold text-xs shadow-xs"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => openChatWithMe()}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-card border border-border text-foreground font-bold text-xs shadow-xs"
          >
            <MessageSquare className="size-3.5" />
            Chat
          </button>
        </div>
      </div>

        {/* Interactive Booking Modal */}
        {bookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in-snappy">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
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
                        <p className="font-bold text-primary">
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
                          <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary font-mono font-bold text-sm border border-primary/20">
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
                        className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors"
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
                        className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md transition-colors"
                      >
                        <MessageCircle className="size-3.5 fill-current text-[#25D366]" />
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
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Dynamic Inputs Based on Airbnb Stay / Eventbrite Event / Appointment */}
                  {activeBookingType === 'stay' ? (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                            <Calendar className="size-3 text-primary" />
                            Check-in Date
                          </label>
                          <input
                            type="date"
                            required
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                            <Calendar className="size-3 text-primary" />
                            Check-out Date
                          </label>
                          <input
                            type="date"
                            required
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                            <Users className="size-3 text-primary" />
                            Guests
                          </label>
                          <select
                            value={guestsCount}
                            onChange={(e) => setGuestsCount(Number(e.target.value))}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                              <span className="text-primary font-bold">
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
                            <Ticket className="size-3 text-primary" />
                            Number of Tickets
                          </label>
                          <select
                            value={ticketsCount}
                            onChange={(e) => setTicketsCount(Number(e.target.value))}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                          <div className="w-full rounded-xl border border-border bg-primary/5 px-3 py-2 text-xs font-bold text-primary flex items-center justify-between">
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
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-foreground">
                          Time Slot
                        </label>
                        <select
                          value={bookingSlot}
                          onChange={(e) => setBookingSlot(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full py-2.5 rounded-xl text-xs font-bold btn-gold-gradient transition-all flex items-center justify-center gap-1.5 shadow-md"
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
        {/* Native Chat With Me Desk Modal */}
        {chatDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in-snappy">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xl flex flex-col h-[480px] max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                      <MessageSquare className="size-4" />
                    </div>
                    <span className="absolute bottom-0 right-0 size-2 rounded-full bg-primary ring-2 ring-card" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      {page.title}
                      <ShieldCheck className="size-3.5 text-primary" />
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      UniCRM Live Desk • Direct response via inbox &amp; WhatsApp
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-muted text-foreground rounded-bl-xs border border-border'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Identification Form if not yet provided */}
              {!hasStartedChat && (
                <div className="py-2.5 px-3 mb-2 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <p className="text-[11px] font-semibold text-foreground">
                    Where should the team reach back out to you?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="tel"
                      placeholder="Phone / WhatsApp"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={chatSending || !chatInputText.trim()}
                  className="p-2 rounded-xl btn-gold-gradient disabled:opacity-50 transition-colors shadow-xs"
                >
                  {chatSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
