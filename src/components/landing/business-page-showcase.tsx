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
    label: 'Loans & Mortgages',
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
      <div className="max-w-4xl mx-auto rounded-3xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md p-5 sm:p-8 shadow-2xl space-y-6">
        {/* Top Browser Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 bg-neutral-950 px-3.5 py-1.5 rounded-full border border-neutral-800 text-xs font-mono text-neutral-400 w-full sm:w-auto">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              https://unicrm.live/p/
              <strong className="text-white font-bold">{activeTab.slug}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400 shrink-0 font-mono">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <QrCode className="size-3.5" /> Printable QR Flyer
            </span>
            <span>•</span>
            <span className="text-neutral-300">0% Commission</span>
          </div>
        </div>

        {/* Mock Mobile Profile Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6 shadow-inner space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="size-16 rounded-2xl bg-neutral-800 text-emerald-400 font-mono flex items-center justify-center text-xl font-black border border-neutral-700 shadow-md shrink-0">
              {activeTab.bizName.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h3 className="text-lg font-black text-white">
                  {activeTab.bizName}
                </h3>
                <CheckCircle2 className="size-4 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-emerald-400/90">
                {activeTab.tagline}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-[11px] text-neutral-500 pt-0.5 font-mono">
                <span>📍 Verified City Listing</span>
                <span>•</span>
                <span>⭐ 4.9 Direct Rating</span>
              </div>
            </div>
          </div>

          {/* Catalog Items Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="size-3.5" />
                Featured Offerings &amp; Rates
              </span>
              <span className="text-[10px] text-neutral-500 lowercase">Direct WhatsApp Pre-fill</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeTab.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <span className="inline-block text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {item.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {item.price}
                    </span>
                    <button
                      onClick={() => {
                        const url = `https://wa.me/?text=${encodeURIComponent(item.prefill)}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-emerald-500 text-neutral-200 hover:text-neutral-950 transition-colors flex items-center gap-1.5 border border-neutral-700 hover:border-emerald-500"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center sm:text-left">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <Share2 className="size-3.5 text-emerald-500" />
              1. Put Link Anywhere
            </span>
            <p className="text-[11px] text-muted-foreground">
              Add to your Instagram Bio, Google Maps Profile, or print a QR sticker on your desk or car.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <MessageCircle className="size-3.5 text-emerald-500" />
              2. 1-Click WhatsApp Chat
            </span>
            <p className="text-[11px] text-muted-foreground">
              Customers tap their desired package or room—WhatsApp opens with the exact details ready to send.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              3. Captured in UniCRM
            </span>
            <p className="text-[11px] text-muted-foreground">
              The phone number and deal requirements land instantly in your pipeline as #WebPageLead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
