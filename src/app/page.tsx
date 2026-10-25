import Link from "next/link";
import Script from "next/script";
import {
  MessageSquare,
  Sparkles,
  Check,
  ArrowRight,
  Zap,
  Users,
  QrCode,
  Headphones,
  MessageCircle,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  GitBranch,
  Mail,
  Camera,
  Share2,
  HardDrive,
  ShieldCheck,
  Play,
  Volume2,
  Sliders,
  CheckCircle2,
  Compass,
  Target,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactButton } from "@/components/contact/contact-buttons";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { WebsiteWhatsAppWidget } from "@/components/layout/website-whatsapp-widget";
import {
  ScarcityTopBanner,
  ScarcityHeroPill,
  ScarcityCtaButton,
  ScarcityAllocationBar,
} from "@/components/landing/server-scarcity";
import { LeadFinderShowcase } from "@/components/landing/lead-finder-showcase";
import { IndustrySetupShowcase } from "@/components/landing/industry-setup-showcase";
import { ComparisonBanner } from "@/components/landing/comparison-banner";

export const metadata = {
  title: "DFY UniCRM — All-in-One Omnichannel CRM, WhatsApp Calling & Support Inbox",
  description:
    "Single-click omnichannel CRM for Indian businesses and global teams. Connect WhatsApp, Instagram, Facebook, Support Email Inboxes, and WhatsApp Calling with node-based IVR & Google Drive storage. Zero software subscriptions.",
  alternates: {
    canonical: "https://dfyunicrm.com",
  },
  openGraph: {
    title: "DFY UniCRM — All-in-One Omnichannel CRM, WhatsApp Calling & Support Inbox",
    description:
      "Single-click omnichannel CRM for Indian businesses and global teams. Zero software subscriptions.",
    url: "https://dfyunicrm.com",
    siteName: "DFY UniCRM",
    type: "website",
  },
};

export default function LandingPage() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://dfyunicrm.com/#organization",
        "name": "DFY UniCRM",
        "url": "https://dfyunicrm.com",
        "email": "help@dfyunicrm.com",
        "description": "Done-For-You Omnichannel CRM, WhatsApp Calling & Unified Support Inbox with zero subscription fees."
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://dfyunicrm.com/#software",
        "name": "DFY UniCRM",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, Cloud, Self-Hosted",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Single-click omnichannel CRM for Indian businesses and global teams. Connect WhatsApp, Instagram, Facebook, Support Email Inboxes, and WhatsApp Calling with node-based IVR."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Structured Schema Data for SEO, GEO & AI Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Optional Google Tag Manager (GTM) */}
      {gtmId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Dynamic Top Banner */}
      <ScarcityTopBanner />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xs border-b border-border/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
            <img
              src="/logo.png"
              alt="DFY UniCRM"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0"
            />
            <span className="text-lg sm:text-xl font-black tracking-tight text-foreground truncate">DFY UniCRM</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-muted-foreground">
            <a href="#leads" className="hover:text-foreground transition-colors font-semibold text-primary">Find Leads</a>
            <a href="#industries" className="hover:text-foreground transition-colors">Industry Setup</a>
            <a href="#channels" className="hover:text-foreground transition-colors">Channels</a>
            <a href="#calling" className="hover:text-foreground transition-colors">Calling &amp; IVR</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#why-free" className="hover:text-foreground transition-colors">Why 100% Free?</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ModeToggle className="h-9 w-9" />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground px-3 text-sm rounded-full">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground font-medium gap-1.5 px-3.5 text-sm rounded-full hover:opacity-90 active:opacity-80 active:translate-y-px">
                <span>Start for free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
          <div aria-hidden="true" className="mkt-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_55%_at_50%_40%,black,transparent)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Urgency Capacity Pill */}
            <ScarcityHeroPill />

            <h1 className="type-display max-w-5xl mx-auto text-foreground animate-slide-blur-up">
              All your WhatsApp chats, calls, social DMs & support emails. <span className="text-muted-foreground font-normal">In one single CRM.</span>
            </h1>

            <p className="type-body-muted mt-6 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Why pay ₹15,000 every month juggling Wati, Zendesk, and call center tools? Handle your WhatsApp messaging, WhatsApp voice calls, Instagram DMs, Facebook messages, and support emails with zero per-seat fees.
            </p>

            {/* Channels Strip */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border hover:border-border-strong transition-colors">
                <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> WhatsApp Messaging
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border hover:border-border-strong transition-colors">
                <PhoneCall className="h-3.5 w-3.5 text-[#25D366]" /> WhatsApp Calling & IVR
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border hover:border-border-strong transition-colors">
                <Camera className="h-3.5 w-3.5 text-[#E4405F]" /> Instagram DMs
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border hover:border-border-strong transition-colors">
                <Share2 className="h-3.5 w-3.5 text-[#1877F2]" /> Facebook Messenger
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border hover:border-border-strong transition-colors">
                <Mail className="h-3.5 w-3.5 text-[#EA4335]" /> Support Email Inbox
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border hover:border-border-strong transition-colors">
                <HardDrive className="h-3.5 w-3.5 text-[#4285F4]" /> Google Drive Storage &amp; Receipts
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border hover:border-border-strong transition-colors">
                <Target className="h-3.5 w-3.5 text-primary" /> Smart Lead Finder
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border hover:border-border-strong transition-colors">
                <Compass className="h-3.5 w-3.5 text-purple-500" /> 1-Click Industry Setup
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-2.5">
              <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                <ScarcityCtaButton />
                <ContactButton
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-11 px-5 rounded-full font-medium text-base border-border hover:border-border-strong hover:bg-surface-hover active:bg-surface-active active:translate-y-px"
                >
                  <Headphones className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Talk to Founders</span>
                </ContactButton>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#25D366]" />
                Funded by our community • 100% Free forever for everyone • Zero credit card required
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#25D366]" />
                <span>Zero Per-Seat Costs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#25D366]" />
                <span>Instant QR Code & Meta Cloud API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#25D366]" />
                <span>Free Multi-Model AI Gateway</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#25D366]" />
                <span>Inbound & Outbound Voice Calling</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: OLD WAY VS UNICRM COMPARISON BANNER */}
        <section id="comparison" className="py-12 md:py-16 border-b border-border/40 bg-muted/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ComparisonBanner />
          </div>
        </section>

        {/* SECTION: WHATSAPP CALLING & NODE-BASED IVR SHOWCASE */}
        <section id="calling" className="py-16 md:py-24 border-b border-border/40 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-surface text-foreground border border-border mb-3">
                Industry First • WhatsApp Voice Stack
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                WhatsApp Calling & Node-Based IVR
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg font-medium">
                Powered by UniCRM Real-Time Voice Gateway &amp; Distributed Media Engine with zero per-minute platform markups.
              </p>
            </div>

            {/* 3 Interactive Feature Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Feature 01: Inbound & Outbound Calling */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-border-strong transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-foreground font-mono text-sm border border-border">
                      01
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-surface border border-border px-2 py-0.5 rounded-full">
                      Live Calling
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Inbound & Outbound Calling</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Receive customer calls on your WhatsApp number and place outbound calls from the dashboard or a single API request.
                  </p>

                  {/* Real Call Log Visual Preview */}
                  <div className="mt-5 space-y-2 rounded-2xl border border-border bg-muted/40 p-3 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                          <PhoneIncoming className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Jane Smith</p>
                          <p className="text-[10px] text-muted-foreground">+1 555 0142</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-bold text-emerald-600">02:14</span>
                        <p className="text-[9px] uppercase font-bold text-emerald-500">answered</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center">
                          <PhoneOutgoing className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Outbound Call</p>
                          <p className="text-[10px] text-muted-foreground">+1 555 0197</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-bold text-blue-600">00:42</span>
                        <p className="text-[9px] uppercase font-bold text-blue-500">completed</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/60">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-rose-500/15 text-rose-600 flex items-center justify-center">
                          <PhoneMissed className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">TechBuild Inc</p>
                          <p className="text-[10px] text-muted-foreground">+44 20 7946</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">—</span>
                        <p className="text-[9px] uppercase font-bold text-rose-500">missed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Instant Browser Calling &bull; Zero Extra Apps
                </div>
              </div>

              {/* Feature 02: Routing Node-Based IVR */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-border-strong transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-foreground font-mono text-sm border border-border">
                      02
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-surface border border-border px-2 py-0.5 rounded-full">
                      Visual Routing
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Node-Based IVR Builder</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Drag, drop, and wire nodes on a canvas. Greet, capture input, branch, hit your API mid-call, route to agent teams, schedule by business hours — all visual.
                  </p>

                  {/* Visual Node Flow Preview */}
                  <div className="mt-5 space-y-2 rounded-2xl border border-border bg-muted/40 p-4 text-xs font-bold">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                      Live Call Logic Canvas:
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        Greet 🎵
                      </span>
                      <span className="text-muted-foreground font-mono">➔</span>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                        Branch 🔀
                      </span>
                      <span className="text-muted-foreground font-mono">➔</span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                        Gather ⌨️
                      </span>
                      <span className="text-muted-foreground font-mono">➔</span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                        Transfer 📞
                      </span>
                      <span className="text-muted-foreground font-mono">➔</span>
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                        Hangup 🛑
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground font-normal pt-2">
                      Automatically route VIP callers directly to senior agents based on CRM tags or deals pipeline status.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> No-Code Visual Flow Editor
                </div>
              </div>

              {/* Feature 03: Encrypted Recordings */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-border-strong transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-black text-sm">
                      03
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                      Storage
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Recordings → S3 & Google Drive</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Every recording is encrypted and streamed straight to the S3-compatible or Google Drive bucket you configure. You set retention. You own the keys.
                  </p>

                  {/* Audio Player Card Preview */}
                  <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-600 flex items-center justify-center">
                          <Play className="h-4 w-4 fill-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">call_recording_0482.wav</p>
                          <p className="text-[10px] text-muted-foreground">02:14 • 128 kbps • Encrypted AES-256</p>
                        </div>
                      </div>
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-500 h-1.5 rounded-full w-2/3" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>Streamed to Private Storage</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold">0 MB Server Storage Used</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-teal-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> End-to-End Private Encryption
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: OMNICHANNEL CHANNELS & BYOS */}
        <section id="channels" className="py-16 md:py-24 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-surface text-foreground border border-border mb-3">
                Unified Omnichannel Inbox
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                All Your Channels, Zero App-Switching
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg font-medium">
                Your support, sales, and marketing agents respond from one central dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* WhatsApp */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-foreground">WhatsApp Messaging</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect via QR code in 10 seconds or through official Meta Cloud API. Send broadcasts, buttons, and catalogs.
                </p>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Instant QR or Official API
                </div>
              </div>

              {/* Instagram */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Camera className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-foreground">Instagram Direct</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Turn Instagram DMs, story mentions, and product inquiries into closed deals without leaving the CRM.
                </p>
                <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  100% Free Meta Messaging
                </div>
              </div>

              {/* Facebook */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                  <Share2 className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-foreground">Facebook Messenger</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sync all customer inquiries from your Facebook Business Pages into your agents' shared inbox timeline.
                </p>
                <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  Zero Message Surcharges
                </div>
              </div>

              {/* Support Email */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Mail className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-foreground">Support Email Inboxes</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect company email via Gmail OAuth, IMAP/SMTP (Zoho/Outlook), or smart inbound forwarding.
                </p>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  Integrated Ticket Threads
                </div>
              </div>
            </div>

            {/* Google Drive BYOS Banner */}
            <div className="mt-8 rounded-3xl border border-border bg-gradient-to-r from-emerald-500/10 via-background to-teal-500/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <HardDrive className="h-3.5 w-3.5" />
                  Bring Your Own Storage (BYOS)
                </div>
                <h3 className="text-xl md:text-2xl font-black text-foreground">
                  Connect Google Drive — 15 GB Free Storage &amp; Auto-Receipts
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  By connecting your personal or business Google Drive (15 GB free), UniCRM streams all customer photos, voice notes, PDFs, call audio, and automated payment receipts into your own cloud folder. Zero storage limits on your CRM server!
                </p>
              </div>

              <Link href="/signup" className="shrink-0">
                <Button className="h-11 px-6 font-bold bg-primary hover:opacity-90 active:opacity-80 text-primary-foreground rounded-full gap-2">
                  Connect in 1 Click
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION: SMART LEAD FINDER SHOWCASE */}
        <section id="leads" className="py-16 md:py-24 border-b border-border/40 bg-card/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LeadFinderShowcase />
          </div>
        </section>

        {/* Feature Grid: What Makes DFY UniCRM Superior */}
        <section id="features" className="py-16 md:py-24 border-b border-border/40 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-3">
                Full-Stack Customer Operations
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                Replace 6 Expensive SaaS Subscriptions
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg font-medium">
                Engineered for Indian businesses, agencies, and high-growth teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1: Instant Business Micro-Page */}
              <div className="rounded-3xl border border-emerald-500/40 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-[10px] font-black uppercase tracking-wider text-slate-950 rounded-bl-xl">
                  New
                </div>
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Instant Business Micro-Page</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    No website? Launch your mobile page and catalog in 60 seconds just like posting an Instagram story. Share your link on Google Maps, Facebook Ads, or print a QR code—inquiries land directly in UniCRM.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-emerald-500 flex items-center justify-between">
                  <span>Zero code &amp; hosting required</span>
                  <span className="font-mono text-[11px] opacity-80">/p/your-biz</span>
                </div>
              </div>

              {/* Feature 2: Dual WhatsApp Gateways */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-border flex items-center justify-center text-teal-500 mb-6">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Dual WhatsApp Gateways</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Connect instantly by scanning a QR code with your mobile phone (100% free WhatsApp Web Gateway), or plug in your official Meta Cloud API for high-volume enterprise campaigns.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-teal-400">
                  Zero setup friction
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-border flex items-center justify-center text-purple-500 mb-6">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Smart Client Memory &amp; Profiles</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Automatically remembers every client&apos;s budget, specific preferences, and past conversation history right in your WhatsApp chat sidebar so you always close deals with full context.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-purple-400">
                  Instant context on every chat
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-border flex items-center justify-center text-blue-500 mb-6">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">WhatsApp Voice & IVR Calls</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Make and receive WhatsApp voice calls directly inside your browser. Record calls, track durations, and route callers through visual DTMF menus.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-blue-400">
                  Built-in High-Concurrency Voice Engine
                </div>
              </div>

              {/* Feature 4 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500 mb-6">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Visual Deals Kanban</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Turn WhatsApp, Instagram, and email chats into sales pipelines. Move deals across stages, link contact values, and track revenue in INR (₹) or USD ($).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-teal-400">
                  Drag & drop pipeline
                </div>
              </div>

              {/* Feature 5 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-border flex items-center justify-center text-amber-500 mb-6">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">No-Code Flow Builder</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Canvas-based automations to welcome new leads, auto-assign chats to online agents, and send interactive buttons and lists automatically.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-amber-400">
                  Interactive node canvas
                </div>
              </div>

              {/* Feature 6 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Unlimited Team Members</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Invite your entire sales, marketing, and customer support staff. Assign granular roles (Admin, Agent, Viewer) with real-time presence tracking.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-rose-400">
                  No per-agent penalties
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: 1-CLICK INDUSTRY SETUP */}
        <section id="industries" className="py-16 md:py-24 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <IndustrySetupShowcase />
          </div>
        </section>

        {/* SECTION: WHY 100% FREE & HOW IT WORKS WITHOUT PAYING A SINGLE PENNY */}
        <section id="why-free" className="py-16 md:py-24 border-b border-border/40 bg-gradient-to-b from-background via-emerald-500/[0.03] to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-surface text-foreground border border-border mb-3">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                Our Community Promise
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                How Can UniCRM Be 100% Free Without Paying a Single Penny?
              </h2>
              <p className="mt-4 text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
                Traditional CRMs charge ₹15,000–₹25,000/month just for basic WhatsApp inboxes and per-seat fees. We built UniCRM on an open-architecture model so every business owner, agency &amp; creator can grow without burning a single rupee.
              </p>
            </div>

            {/* 4 Pillars of Zero Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs flex flex-col justify-between hover:border-border-strong transition-all">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black mb-4">
                    ₹0
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Zero Software Subscriptions</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    No 7-day trials, no artificial paywalls, and no &ldquo;Upgrade to unlock&rdquo; traps. All CRM modules, contact pipelines, and team accounts are 100% free forever.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Unlimited Team Seats
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs flex flex-col justify-between hover:border-border-strong transition-all">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black mb-4">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Zero-Cost WhatsApp Connection</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Connect via free QR Code scanning with your existing phone, or use Meta&rsquo;s Cloud API where Meta directly gives you 1,000 free service conversations every month.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  No Platform Markups
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs flex flex-col justify-between hover:border-border-strong transition-all">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black mb-4">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Pre-Configured Free AI Router</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Enjoy built-in smart AI customer service. UniCRM auto-routes to zero-cost AI models (Gemini Flash, Gemma, Llama) so you get instant auto-replies at ₹0 extra cost.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Free Multi-Model AI
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black mb-4">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">BYOS: 15GB Free Cloud Drive</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Bring Your Own Storage (BYOS). Connect your existing Google Drive for 15 GB of completely free file, invoice, and voice call audio recording storage.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Your Data Stays Yours
                </div>
              </div>
            </div>

            {/* Inspiring Bottom Banner: Transparent Community Model */}
            <div className="mt-10 max-w-4xl mx-auto rounded-3xl border border-border bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-purple-500/10 p-6 sm:p-8 text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Funded by You &amp; Our Community
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                Funded by You &amp; Our Community Members — Free for Everyone to Use
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                UniCRM has zero corporate overhead and no aggressive sales targets. Passionate community members voluntarily contribute micro-support (from ₹29/month) to fund shared cloud servers, while busy founders can optionally request hands-on Done-For-You onboarding. Every single business owner gets to use the full CRM 100% free forever.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" /> No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" /> Export Contacts Anytime
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" /> Active Community Uptime
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Business Model Section: Free Forever + ₹1,000/mo DFY Pro Support */}
        <section id="support-plan" className="py-16 md:py-24 border-b border-border/40 bg-card/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-3">
                Transparent Community Model
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                Free Forever Core Software.<br />Pay Only If You Need Handheld Support.
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg font-medium">
                Zero lock-in. Direct bills to Meta. Optional Done-For-You (DFY) Pro maintenance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* Plan 1: Free Forever */}
              <div className="rounded-3xl border border-border/70 bg-card p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface text-foreground border border-border">
                      Community-Funded
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">Free Forever</span>
                  </div>
                  <h3 className="text-2xl font-black text-foreground">DFY UniCRM Core</h3>
                  <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
                    <span className="text-5xl font-black text-foreground">₹0</span>
                    <span className="text-sm text-muted-foreground font-semibold">/ lifetime free</span>
                    <span className="rounded-full bg-emerald-500/15 border border-border px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Community Edition
                    </span>
                  </div>

                  {/* Dynamic Scarcity Allocation Bar */}
                  <ScarcityAllocationBar />

                  <p className="mt-2 text-sm text-muted-foreground">
                    Complete access to the entire omnichannel CRM software. No trial period, no card required.
                  </p>

                  <ul className="mt-6 space-y-3 text-sm text-foreground/90">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Unlimited contacts & conversation history</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>WhatsApp, Instagram, Facebook & Support Email</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>WhatsApp Inbound & Outbound Calling with IVR</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Google Drive BYOS (15 GB Free Storage)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Unlimited team agent accounts</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>UniCRM Free Multi-Model AI Gateway</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border/40">
                  <Link href="/signup" className="block w-full">
                    <Button variant="outline" className="w-full h-11 font-bold">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Plan 2: ₹1,000/mo Optional Done-For-You Pro Support */}
              <div className="relative rounded-3xl border-2 border-foreground bg-card p-8 flex flex-col justify-between shadow-xl shadow-emerald-500/10">
                <div className="absolute -top-3.5 right-8 rounded-full bg-foreground px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-background">
                  100% Optional Service
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                      Completely Optional Help
                    </span>
                    <span className="text-xs font-semibold text-emerald-500">One-Time Setup</span>
                  </div>
                  <h3 className="text-2xl font-black text-foreground">Optional Done-For-You Pro Help</h3>
                  <div className="mt-4 flex flex-wrap items-baseline gap-2">
                    <span className="text-5xl font-black text-foreground">₹1,000</span>
                    <span className="text-sm text-muted-foreground font-semibold">— one time cost per setup</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    The software is 100% free forever. This hands-on assistance is completely optional—only choose it if you want our experts to handle your Meta setup, phone number verification, and templates for you.
                  </p>

                  <ul className="mt-6 space-y-3 text-sm text-foreground/90">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Everything in Free Core</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>We connect your WhatsApp, Meta API & Social accounts</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Dedicated technical desk whenever you need assistance</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>We help write and get your WhatsApp templates approved</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Priority Support with rapid response times</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border/40 space-y-2">
                  <ContactButton
                    variant="cta"
                    className="w-full h-12 text-sm sm:text-base font-black rounded-xl tracking-tight"
                    defaultTopic="Optional Pro Setup (₹1,000 one-time)"
                    icon="message"
                  >
                    <span>Get ₹1,000 One-Time Setup</span>
                  </ContactButton>
                  <p className="text-[11px] text-center text-muted-foreground">
                    1-on-1 human technical onboarding &bull; Pay once, use forever
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 border-b border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-foreground">Got Questions? Simple Answers.</h2>
              <p className="mt-2 text-muted-foreground text-sm">Everything straightforward and clear, no corporate jargon.</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h4 className="font-bold text-foreground">Is the software really free forever?</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Yes, 100%. You can create an account, invite all your staff, and use the CRM without ever paying us a single rupee. We don't take commissions or mark up your WhatsApp messages.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h4 className="font-bold text-foreground">How does WhatsApp Calling work?</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  UniCRM incorporates a proprietary high-concurrency voice engine. You can receive inbound WhatsApp audio calls, dial outbound calls right from your computer, set up visual node-based IVR trees, and stream recordings directly to your private Google Drive storage.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h4 className="font-bold text-foreground">How does Google Drive save cloud server storage?</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  High-speed cloud databases are built for lightning-fast querying and search. When you connect your Google account (15 GB free), UniCRM offloads all heavy media (images, PDFs, voice notes, call recordings) straight into your private Google Drive folder, keeping your CRM server storage footprint ultra-lean and completely free of storage limits!
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h4 className="font-bold text-foreground">Is the Done-For-You Pro Support mandatory?</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  No, not at all! It is 100% optional. The entire software is free to use on your own. You only choose Pro support if you prefer our team to handle your Meta verification and WhatsApp number setup for you.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h4 className="font-bold text-foreground">How do I reach support if I need help?</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Click the Contact Support button or write to help@dfyunicrm.com. We respond to every inquiry directly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 px-4 py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">DFY UniCRM</span>
            <span>•</span>
            <span>A Community-Powered Omnichannel Project</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="text-emerald-500 font-medium hover:underline"
            >
              Contact Support: help@dfyunicrm.com
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Website WhatsApp Chat Widget */}
      <WebsiteWhatsAppWidget />
    </div>
  );
}
