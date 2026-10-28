'use client';

import { useState } from 'react';
import {
  Globe,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Phone,
  QrCode,
  Share2,
  ArrowRight,
  Plane,
  Bed,
  Car,
  Coins,
  Utensils,
  Home,
  CalendarCheck,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShowcaseItem {
  id: string;
  title: string;
  badge: string;
  price: string;
  details: string;
  buttonLabel: string;
  prefill: string;
}

interface IndustryTab {
  id: string;
  label: string;
  bizName: string;
  slug: string;
  tagline: string;
  icon: typeof Plane;
  items: ShowcaseItem[];
}

const DEMO_INDUSTRIES: IndustryTab[] = [
  {
    id: 'travel',
    label: 'Travel & Trips',
    bizName: 'Royal Horizons Travels',
    slug: 'royal-travels',
    tagline: 'Custom Holiday Packages & Guaranteed Best Air/Hotel Deals',
    icon: Plane,
    items: [
      {
        id: '1',
        title: 'Goa 3 Nights / 4 Days Beach Holiday',
        badge: 'Top Seller • Breakfast Inc.',
        price: '₹8,999 / person',
        details: '4-star resort stay, daily breakfast, South Goa sightseeing cab, airport transfers.',
        buttonLabel: 'Book on WhatsApp',
        prefill: "Hi Royal Horizons! I'm interested in the Goa 3N/4D package. Please share dates and itinerary.",
      },
      {
        id: '2',
        title: 'Dubai Express 4N/5D with Desert Safari',
        badge: 'Visa Included • 4-Star',
        price: '₹34,999 / person',
        details: 'Desert safari with BBQ, Burj Khalifa 124th floor ticket, Marina Dhow Cruise, UAE visa.',
        buttonLabel: 'Get Itinerary',
        prefill: "Hi! Please share the day-wise itinerary and quote for the Dubai Express 4N/5D package.",
      },
    ],
  },
  {
    id: 'hotels',
    label: 'Hotels & Homestays',
    bizName: 'Green Mist Valley Resort',
    slug: 'green-mist-resort',
    tagline: 'Boutique Nature Retreat • Direct WhatsApp Booking at 0% Commission',
    icon: Bed,
    items: [
      {
        id: '1',
        title: 'Deluxe King Room with Mountain View',
        badge: 'Private Balcony • Free Wi-Fi',
        price: '₹2,799 / night',
        details: 'King-size bed, valley view balcony, high-speed Wi-Fi, smart TV, 24/7 room service.',
        buttonLabel: 'Check Availability',
        prefill: 'Hi Green Mist! Is the Deluxe King Room available this weekend? Please share availability.',
      },
      {
        id: '2',
        title: 'Executive 2-BHK Family Suite',
        badge: 'Breakfast Inc. • Sleeps 4',
        price: '₹5,499 / night',
        details: '2 spacious bedrooms, separate living hall, bathtub, and complimentary buffet breakfast.',
        buttonLabel: 'Reserve Suite',
        prefill: 'Hi! We are looking for the Executive Family Suite for [Dates]. Please confirm availability.',
      },
    ],
  },
  {
    id: 'cabs',
    label: 'Car & Cab Rentals',
    bizName: 'Apex Airport & Outstation Cabs',
    slug: 'apex-cabs',
    tagline: '24/7 Door-to-Terminal Airport Drops & Sanitized Highway Cabs',
    icon: Car,
    items: [
      {
        id: '1',
        title: 'Airport Drop & Pickup (Sedan Dzire/Etios)',
        badge: 'Fixed Fare • Zero Hidden Charges',
        price: '₹1,199 fixed',
        details: 'Clean AC sedan, toll included, verified on-time driver arrival guarantee.',
        buttonLabel: 'Book Cab on WhatsApp',
        prefill: 'Hi Apex Cabs! I need an Airport drop from [Location] on [Date & Time]. Please confirm.',
      },
      {
        id: '2',
        title: 'Innova Crysta 7-Seater Outstation Trip',
        badge: '7 Seater • Highway Specialist',
        price: '₹18 / km (min 250km)',
        details: 'Comfortable captain seats, powerful dual AC, experienced highway chauffeur for family trips.',
        buttonLabel: 'Get Outstation Quote',
        prefill: 'Hi! Need an Innova Crysta for outstation travel to [Destination] on [Dates]. Please quote.',
      },
    ],
  },
  {
    id: 'loans',
    label: 'Loans & Finance',
    bizName: 'FinTrust Capital Advisors',
    slug: 'fintrust-loans',
    tagline: 'Instant Loan Approvals Across 30+ Banks & NBFCs • Doorstep Pickup',
    icon: Coins,
    items: [
      {
        id: '1',
        title: 'Home Loan & Balance Transfer',
        badge: 'From 8.35% • 30+ Banks',
        price: 'Starting 8.35% p.a.',
        details: 'Compare top lenders, get maximum eligibility, and fast doorstep document processing.',
        buttonLabel: 'Check Eligibility',
        prefill: 'Hi FinTrust! I want to check my Home Loan eligibility for ₹[Amount]. Please advise.',
      },
      {
        id: '2',
        title: 'Fast Unsecured Business Loan (48h Disbursal)',
        badge: 'Zero Collateral • Up to ₹50L',
        price: 'Up to ₹50 Lakhs',
        details: 'Collateral-free business capital based on GST turnover and bank banking statements.',
        buttonLabel: 'Apply on WhatsApp',
        prefill: 'Hi! Looking for an Unsecured Business Loan for my company. Please share required docs.',
      },
    ],
  },
];

export function BusinessPageShowcase() {
  const [activeTabId, setActiveTabId] = useState<string>('travel');
  const activeTab = DEMO_INDUSTRIES.find((t) => t.id === activeTabId) || DEMO_INDUSTRIES[0];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Globe className="size-3.5" />
          No Website? Zero Problem
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Launch Your Mobile Page &amp; Catalog in 60 Seconds
        </h2>
        <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
          Post trips, rooms, cars, or loan offers just like an Instagram Story. 
          Get a link &amp; QR code for Google Maps and social media. When customers tap, it opens WhatsApp with the exact offer pre-filled and saves the lead into UniCRM.
        </p>

        {/* Industry Switcher Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          {DEMO_INDUSTRIES.map((ind) => {
            const Icon = ind.icon;
            const isActive = ind.id === activeTabId;
            return (
              <button
                key={ind.id}
                onClick={() => setActiveTabId(ind.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-105'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="size-3.5" />
                {ind.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Mockup Container */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-emerald-500/30 bg-card/60 backdrop-blur-md p-5 sm:p-8 shadow-2xl space-y-6">
        {/* Top Browser Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2 bg-muted/60 px-3.5 py-1.5 rounded-full border border-border text-xs font-mono text-muted-foreground w-full sm:w-auto">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">
              https://unicrm.live/p/
              <strong className="text-foreground">{activeTab.slug}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <QrCode className="size-3.5" /> Printable QR Included
            </span>
            <span>•</span>
            <span>0% Commission</span>
          </div>
        </div>

        {/* Mock Mobile Profile Card */}
        <div className="rounded-2xl border border-border bg-background p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="size-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-background shrink-0">
              {activeTab.bizName.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h3 className="text-lg font-black text-foreground">
                  {activeTab.bizName}
                </h3>
                <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500/20" />
              </div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {activeTab.tagline}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-muted-foreground pt-1">
                <span>📍 Verified City Listing</span>
                <span>•</span>
                <span>⭐ 4.9 (120+ WhatsApp Reviews)</span>
              </div>
            </div>
          </div>

          {/* Catalog Items Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                Featured Offerings &amp; Packages
              </span>
              <span className="text-[10px] text-muted-foreground lowercase">Instant WhatsApp prefill</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeTab.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-2xs hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <span className="inline-block text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-foreground">
                      {item.price}
                    </span>
                    <button
                      onClick={() => {
                        const url = `https://wa.me/?text=${encodeURIComponent(item.prefill)}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="size-3.5 fill-current" />
                      {item.buttonLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Flow Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-2 text-center sm:text-left">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <Share2 className="size-3.5 text-emerald-500" />
              1. Put Link Anywhere
            </span>
            <p className="text-[11px] text-muted-foreground">
              Add to your Instagram Bio, Google Maps Profile, or print a counter standee flyer with 1 click.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <CalendarCheck className="size-3.5 text-emerald-500" />
              2. 1-Click Slot Booking
            </span>
            <p className="text-[11px] text-muted-foreground">
              Clients pick their preferred date and time slot with automatic sync to your Google Calendar.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <MessageCircle className="size-3.5 text-emerald-500" />
              3. WhatsApp Reminders
            </span>
            <p className="text-[11px] text-muted-foreground">
              Automated confirmation and reminder notices are dispatched to the customer's WhatsApp.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              4. Captured in CRM Desk
            </span>
            <p className="text-[11px] text-muted-foreground">
              Bookings and client memory land automatically on your Appointments Desk and Inbox sidebar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
