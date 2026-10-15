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
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactButton } from "@/components/contact/contact-buttons";
import { ModeToggle } from "@/components/layout/mode-toggle";

export const metadata = {
  title: "DFY UniCRM — 100% Free Forever WhatsApp CRM with Paid Pro Support",
  description:
    "Indian business friendly WhatsApp CRM. Zero platform subscriptions, instant QR code connection or official Meta Cloud API, free AI options, and optional ₹1,000/mo Done-For-You Pro technical support.",
};

export default function LandingPage() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
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

      {/* Top Banner: Indian Community Friendly */}
      <div className="bg-emerald-600/10 border-b border-emerald-500/20 px-4 py-2 text-center text-xs font-medium text-emerald-500">
        🇮🇳 Tailored for Indian Businesses, D2C Brands & Agencies • Zero Per-Seat Charges • Direct Meta & UPI-Friendly Support
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/apple-touch-icon.png"
              alt="DFY UniCRM"
              className="h-9 w-9 rounded-xl object-contain shadow-xs"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-foreground">DFY UniCRM</span>
              <span className="rounded-md bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-primary">
                Free Core
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">What You Get</a>
            <a href="#support-plan" className="hover:text-foreground transition-colors">Optional Pro Help (₹1,000/mo)</a>
            <a href="#faq" className="hover:text-foreground transition-colors">Common Doubts</a>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5">
                Start Free in 1 Minute
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-secondary border border-border text-foreground mb-6 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>100% Free Forever • No Hidden Software Charges</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.15] max-w-4xl mx-auto">
              Handle all your WhatsApp chats, leads & team in one place. <span className="text-emerald-500">Zero software fees.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Why pay ₹5,000 to ₹15,000 every month for tools like Wati or Interakt? Just scan a QR code from your phone like WhatsApp Web, connect your sales staff, and let free AI draft your customer replies.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base gap-2 shadow-lg shadow-emerald-600/20">
                  <MessageCircle className="h-5 w-5" />
                  Try It Free Right Now
                </Button>
              </Link>
              <ContactButton
                variant="outline"
                size="lg"
                className="h-12 px-7 rounded-xl font-bold text-base shadow-xs"
                icon="headphones"
                defaultTopic="General Inquiry"
              >
                Contact Support Desk
              </ContactButton>
            </div>


            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Zero Per-Seat Costs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Instant QR Code or Official Meta API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Free UniCRM AI Gateway Included</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Voice Calling & WhatsApp IVR</span>
              </div>
            </div>
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
                Replace 5 Expensive SaaS Subscriptions
              </h2>
              <p className="mt-3 text-muted-foreground text-base md:text-lg font-medium">
                Engineered for Indian businesses, agencies, and high-growth teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Dual WhatsApp Gateways</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Connect instantly by scanning a QR code with your mobile phone (Evolution API, 100% free), or plug in your Meta Cloud API for high-volume enterprise campaigns.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-emerald-500">
                  Zero setup friction
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 mb-6">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Free AI Gateway & Autoreply</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Powered by internal OmniRoute proxy routing. Get smart draft suggestions and automated replies across Gemini, Groq, and DeepSeek without paying \$20/seat.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-purple-400">
                  Token-compressed & fast
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 mb-6">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">WhatsApp Voice & IVR Calls</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Make and receive WhatsApp voice calls directly inside your browser. Record calls, track durations, and route callers through interactive DTMF menus.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-blue-400">
                  Built-in Whatomate engine
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
                    Turn WhatsApp chats into sales pipelines. Move deals across stages, link contact values, and track revenue in INR (₹) or USD ($).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-teal-400">
                  Drag & drop pipeline
                </div>
              </div>

              {/* Feature 5 */}
              <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6">
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
                    Invite your entire sales and customer support staff. Assign granular roles (Admin, Agent, Viewer) with real-time agent presence tracking.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-rose-400">
                  No per-agent penalties
                </div>
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
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-foreground">
                      Self-Serve Community
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">Free Forever</span>
                  </div>
                  <h3 className="text-2xl font-black text-foreground">DFY UniCRM Core</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-black text-foreground">₹0</span>
                    <span className="text-sm text-muted-foreground font-semibold">/ lifetime</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Complete access to the entire CRM software. No trial period, no card required.
                  </p>

                  <ul className="mt-6 space-y-3 text-sm text-foreground/90">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Unlimited contacts & conversation history</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Unlimited team agent accounts</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Evolution API (QR Code) & Meta Cloud API</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>UniCRM Free AI Gateway</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Pipelines & Deals Kanban</span>
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
              <div className="relative rounded-3xl border-2 border-emerald-500 bg-card p-8 flex flex-col justify-between shadow-xl shadow-emerald-500/10">
                <div className="absolute -top-3.5 right-8 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                  100% Optional Service
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                      Completely Optional Help
                    </span>
                    <span className="text-xs font-semibold text-emerald-500">Stop Anytime</span>
                  </div>
                  <h3 className="text-2xl font-black text-foreground">Optional Done-For-You Pro Help</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-black text-foreground">₹1,000</span>
                    <span className="text-sm text-muted-foreground font-semibold">/ month</span>
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
                      <span>We connect your WhatsApp & Meta API for you</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Dedicated technical desk whenever you need assistance</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>We help write and get your WhatsApp templates approved by Meta</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Priority Support with rapid response times</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border/40">
                  <ContactButton
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    defaultTopic="Optional Pro Support (₹1,000/mo)"
                    icon="message"
                  >
                    Request Optional Pro Setup (₹1,000/mo)
                  </ContactButton>
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
                <h4 className="font-bold text-foreground">Is the Done-For-You Pro Support mandatory?</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  No, not at all! It is 100% optional. The entire software is free to use on your own. You only choose Pro support if you prefer our team to handle your Meta verification and WhatsApp number setup for you.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h4 className="font-bold text-foreground">What is the difference between QR Code and Official Meta API?</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  With QR Code, you link your regular WhatsApp or WhatsApp Business phone in 10 seconds just like opening WhatsApp Web on your laptop. It's completely free. The Official Meta API is used if you want verified green tick badges and massive broadcasts through Meta directly. Both work inside UniCRM!
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h4 className="font-bold text-foreground">How do I reach support if I need help?</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Click the Contact Support button or write to ravibabuche@dfydude.online. We respond to every inquiry directly.
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
            <span>A Community-Powered Project</span>
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
              Contact Support: ravibabuche@dfydude.online
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
