'use client';

import { useState } from 'react';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  QrCode,
  Share2,
  Plane,
  Bed,
  Car,
  Coins,
  Utensils,
  CalendarCheck,
  MessageSquare,
  ShieldCheck,
  Send,
  X,
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
        buttonLabel: 'Chat / Inquire',
        prefill: "Hi Royal Horizons! I'm interested in the Goa 3N/4D package. Please share dates and itinerary.",
      },
      {
        id: '2',
        title: 'Dubai Express 4N/5D with Desert Safari',
        badge: 'Visa Included • 4-Star',
        price: '₹34,999 / person',
        details: 'Desert safari with BBQ, Burj Khalifa 124th floor ticket, Marina Dhow Cruise, UAE visa.',
        buttonLabel: 'Chat / Inquire',
        prefill: "Hi! Please share the day-wise itinerary and quote for the Dubai Express 4N/5D package.",
      },
    ],
  },
  {
    id: 'hotels',
    label: 'Hotels & Homestays',
    bizName: 'Green Mist Valley Resort',
    slug: 'green-mist-resort',
    tagline: 'Boutique Nature Retreat • Direct Booking at 0% Commission',
    icon: Bed,
    items: [
      {
        id: '1',
        title: 'Deluxe King Room with Mountain View',
        badge: 'Private Balcony • Free Wi-Fi',
        price: '₹2,799 / night',
        details: 'King-size bed, valley view balcony, high-speed Wi-Fi, smart TV, 24/7 room service.',
        buttonLabel: 'Check Dates',
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
    id: 'rentals',
    label: 'Cabs & Rentals',
    bizName: 'Apex City & Airport Cabs',
    slug: 'apex-cabs',
    tagline: '24/7 Guaranteed On-Time Airport Drops & Outstation Cabs',
    icon: Car,
    items: [
      {
        id: '1',
        title: 'Flat-Rate Airport Drop (Sedan)',
        badge: 'Zero Surge • Sanitized AC',
        price: '₹1,199 flat',
        details: 'Fixed door-to-terminal fare, verified driver, luggage assistance, flight tracking.',
        buttonLabel: 'Book Ride',
        prefill: 'Hi Apex Cabs! I need an Airport drop cab on [Date] at [Time]. Please confirm booking.',
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
        title: 'Unsecured Business Loan (Fast 48h Disbursal)',
        badge: 'Zero Collateral • Up to ₹50L',
        price: 'Up to ₹50 Lakhs',
        details: 'Working capital based on GST and bank statement turnover. Zero branch visits.',
        buttonLabel: 'Apply Now',
        prefill: 'Hi! I am looking for an Unsecured Business Loan for my company. Please advise steps.',
      },
    ],
  },
  {
    id: 'dining',
    label: 'Food & Catering',
    bizName: 'Saffron Spice Cloud Kitchen',
    slug: 'saffron-spice',
    tagline: 'Authentic Dum Biryani, Curries & Party Catering With 0% Markup',
    icon: Utensils,
    items: [
      {
        id: '1',
        title: 'Royal Dum Biryani Family Pot (Serves 4)',
        badge: 'Chef Signature • Serves 4',
        price: '₹899 combo',
        details: 'Includes aromatic Dum Biryani, Mirchi Ka Salan, creamy raita, and gulab jamun.',
        buttonLabel: 'Order Direct',
        prefill: 'Hi Saffron Spice! I want to order the Royal Dum Biryani Family Pot for delivery to [Address].',
      },
      {
        id: '2',
        title: 'Corporate & Party Catering (20-100 Pax)',
        badge: 'Live Counter • Full Buffet',
        price: '₹450 / plate onwards',
        details: 'Complete buffet setup, live appetizers counter, main course spread, and service staff.',
        buttonLabel: 'Get Menu Quote',
        prefill: 'Hi! We need catering for [X] guests on [Date]. Please share the menu and pricing.',
      },
    ],
  },
];

export function BusinessPageShowcase() {
  const [activeTabId, setActiveTabId] = useState<string>('travel');
  const [activeModalItem, setActiveModalItem] = useState<ShowcaseItem | null>(null);
  const [demoMessageSent, setDemoMessageSent] = useState(false);

  const activeTab = DEMO_INDUSTRIES.find((t) => t.id === activeTabId) || DEMO_INDUSTRIES[0];

  const handleOpenDemoModal = (item: ShowcaseItem) => {
    setActiveModalItem(item);
    setDemoMessageSent(false);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          <Globe className="size-3.5" />
          Platform Enabler • Front &amp; Back-Office Connected
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Launch Your Branded Business Desk in 60 Seconds
        </h2>
        <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
          Give your business a high-converting booking &amp; catalog desk (<code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">/p/your-brand</code>). 
          Inquiries and appointments land directly inside your UniCRM Unified Inbox and trigger WhatsApp flows with 0% platform commission.
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
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
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
      <div className="max-w-4xl mx-auto rounded-3xl border border-primary/30 bg-card/60 backdrop-blur-md p-5 sm:p-8 shadow-2xl space-y-6">
        {/* Top Browser Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2 bg-muted/60 px-3.5 py-1.5 rounded-full border border-border text-xs font-mono text-muted-foreground w-full sm:w-auto">
            <span className="size-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="truncate">
              https://dfyunicrm.com/p/
              <strong className="text-foreground">{activeTab.slug}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1 font-semibold text-primary">
              <QrCode className="size-3.5" /> Standee QR Ready
            </span>
            <span>•</span>
            <span className="font-semibold text-foreground">0% Platform Surcharge</span>
          </div>
        </div>

        {/* Mock Mobile Profile Card */}
        <div className="rounded-2xl border border-border bg-background p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-black shadow-md border-2 border-card shrink-0">
              {activeTab.bizName.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h3 className="text-lg font-black text-foreground">
                  {activeTab.bizName}
                </h3>
                <CheckCircle2 className="size-4 text-primary" />
              </div>
              <p className="text-xs font-semibold text-primary">
                {activeTab.tagline}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-muted-foreground pt-1">
                <span>📍 Verified Direct Desk</span>
                <span>•</span>
                <span>⚡ Direct WhatsApp &amp; Inbox Response</span>
              </div>
            </div>
          </div>

          {/* Catalog Items Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-primary">
                <Sparkles className="size-3.5" />
                Featured Offerings &amp; Services
              </span>
              <span className="text-[10px] text-muted-foreground lowercase">Native UniCRM Ingestion</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeTab.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <span className="inline-block text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md">
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
                      onClick={() => handleOpenDemoModal(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="size-3.5" />
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
              <Share2 className="size-3.5 text-primary" />
              1. Put Link Anywhere
            </span>
            <p className="text-[11px] text-muted-foreground">
              Add to your Instagram Bio, Google Maps Profile, or QR standee on your counter.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <CalendarCheck className="size-3.5 text-primary" />
              2. 1-Click Slot Booking
            </span>
            <p className="text-[11px] text-muted-foreground">
              Clients pick dates/slots or ask questions directly via the embedded UniCRM widget.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <CheckCircle2 className="size-3.5 text-primary" />
              3. CRM Ingestion
            </span>
            <p className="text-[11px] text-muted-foreground">
              Contacts, tags, and client memory are created inside your UniCRM workspace.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck className="size-3.5 text-primary" />
              4. Respond Anywhere
            </span>
            <p className="text-[11px] text-muted-foreground">
              Reply via UniCRM Unified Inbox (`/inbox`) or straight from your linked WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Demo Ingestion Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in-snappy">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="size-3" />
                  UniCRM Live Desk
                </span>
                <h3 className="font-bold text-base text-foreground">
                  Inquire with {activeTab.bizName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Offering: <strong>{activeModalItem.title}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {demoMessageSent ? (
              <div className="py-6 text-center space-y-3 animate-in-snappy">
                <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Inquiry Received by UniCRM!</h4>
                  <p className="text-xs text-muted-foreground">
                    This lead was ingested into the service provider&apos;s UniCRM Inbox. The team receives an instant notification and will reply via their Unified Inbox or WhatsApp.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveModalItem(null)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl mt-2 text-xs"
                >
                  Close Preview
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDemoMessageSent(true);
                }}
                className="space-y-3 pt-1"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue="Rajesh Sharma"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    defaultValue="+91 98765 43210"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Message / Question
                  </label>
                  <textarea
                    rows={2}
                    defaultValue={activeModalItem.prefill}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Send className="size-3.5" />
                    Send Inquiry to {activeTab.bizName}
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Direct desk ingestion • No spam calls • 100% data privacy
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
