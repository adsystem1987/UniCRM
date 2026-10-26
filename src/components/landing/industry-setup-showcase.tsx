"use client";

import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  Home,
  Landmark,
  Building,
  Wrench,
  Stethoscope,
  Car,
  Plane,
  Scale,
  Sparkles,
  Globe,
  GitBranch,
  Tags,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PRESET_INDUSTRIES = [
  {
    icon: Home,
    title: "Interior Design & Architecture",
    stages: "Site Visit ➔ 3D Render ➔ Advance Paid",
    tags: ["2BHK", "Villa Fitout", "Modular Kitchen"],
    regionNote: "India, UAE, US & Global terms",
  },
  {
    icon: Landmark,
    title: "Loan Providers & Mortgage (DSA)",
    stages: "Doc Intake ➔ Bank Logged ➔ Sanctioned",
    tags: ["Home Loan", "High CIBIL", "Business Loan"],
    regionNote: "Direct banking UTR & KYC",
  },
  {
    icon: Building,
    title: "Real Estate Developers & Brokers",
    stages: "Inquiry ➔ Site Tour ➔ Token Booking",
    tags: ["Buyer", "Investor", "Ready to Move"],
    regionNote: "Brochure PDFs & Location pins",
  },
  {
    icon: Stethoscope,
    title: "Clinics, Dental & Aesthetics",
    stages: "Consultation ➔ Plan Sent ➔ Treatment Paid",
    tags: ["Aligners", "Skin VIP", "Recall Due"],
    regionNote: "Pre-consult photos & appointment alerts",
  },
  {
    icon: Wrench,
    title: "Solar Rooftop & Contractors",
    stages: "Roof Audit ➔ Estimate ➔ Installed",
    tags: ["Govt Subsidy", "Commercial", "Residential"],
    regionNote: "Instant cost & subsidy calculations",
  },
  {
    icon: Car,
    title: "Automotive & Car Dealerships",
    stages: "Test Drive ➔ Valuation ➔ Keys Handover",
    tags: ["SUV", "Luxury", "Trade-in Exchange"],
    regionNote: "RC/Mulkiya transfer & spec sheets",
  },
];

export function IndustrySetupShowcase() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          Zero Setup Friction
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Your Entire CRM Configured in 1 Click
        </h2>
        <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
          Don&apos;t waste days creating empty pipeline stages or writing cold message templates. Choose your industry, and UniCRM instantly builds your workspace.
        </p>
      </div>

      {/* Grid of Industry Packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRESET_INDUSTRIES.map((ind) => {
          const Icon = ind.icon;
          return (
            <div
              key={ind.title}
              className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/20 p-6 space-y-4 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle top card glow */}
              <div className="absolute -top-12 -right-12 size-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />

              <div className="space-y-3.5 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary py-0.5 px-2.5 rounded-full">
                    ⚡ 1-Click Ready
                  </Badge>
                </div>

                <div>
                  <h4 className="font-black text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {ind.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{ind.regionNote}</p>
                </div>

                {/* Pipeline Stages Mini Flow */}
                <div className="rounded-xl bg-background/80 backdrop-blur-xs p-3 border border-border/80 text-[11px] space-y-1.5 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5 text-primary" />
                    Built-in Pipeline Blueprint
                  </div>
                  <div className="font-mono text-foreground font-semibold text-[11px] leading-snug">
                    {ind.stages}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {ind.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-muted/60 border border-border/60 text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs relative z-10">
                <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
                  <Sparkles className="size-3 text-emerald-500" />
                  Pre-loaded templates
                </span>
                <Link
                  href="/signup"
                  className="font-bold text-xs text-primary hover:text-primary/80 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Apply in 1-Click
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Regional Callout */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-6 md:p-8 shadow-xl shadow-black/5 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-surface border border-border flex items-center justify-center text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Works Across India, UAE, USA, UK &amp; 40+ Countries
            </h4>
            <p className="text-xs text-muted-foreground">
              Smart regional adaptation speaks the language of your customers — whether INR, AED, USD, or GBP.
            </p>
          </div>
        </div>

        <Link href="/signup" className="shrink-0">
          <Button className="h-9 px-4 text-xs font-bold rounded-full bg-primary text-primary-foreground gap-1.5 shadow-xs">
            <span>Explore All 12 Blueprints</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
