"use client";

import Link from "next/link";
import { X, Check, ArrowRight, Zap, ShieldAlert, Sparkles, HardDrive, Target, Compass, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMPARISON_ROWS = [
  {
    feature: "Booking Commissions & Middleman Cuts",
    oldWay: "Aggregators & portals take 15% to 30% of your hard-earned booking money",
    uniWay: "0% Commission Forever: Keep 100% of your earnings directly in your bank account",
  },
  {
    feature: "Client Numbers & Repeat Retention",
    oldWay: "Portals mask client phone numbers so you can never contact them again for repeat business",
    uniWay: "Direct WhatsApp Client Ownership: Every customer is saved into your CRM for lifetime repeat orders",
  },
  {
    feature: "Cancellations, Fake Inquiries & Wrong Pins",
    oldWay: "Casual one-click cancellations, fake bot leads shared with 10 competitors, wrong GPS map pins",
    uniWay: "Direct Human Reality: Live GPS location sharing on WhatsApp, verified human intent, zero bot leads",
  },
  {
    feature: "Monthly Software Subscriptions",
    oldWay: "₹15,000–₹35,000 / month across 4 different disjointed tools",
    uniWay: "100% Free Core Software • Zero monthly subscription fees or seat penalties",
  },
  {
    feature: "Business Website & Catalog",
    oldWay: "₹20,000+ to build a website, plus hosting, SSL and developers just to show your cars, rooms or packages",
    uniWay: "Instant Mobile Micro-Page & Catalog: Launch in 60s like an Instagram post with printable QR code",
  },
  {
    feature: "CRM Onboarding & Pipeline Setup",
    oldWay: "Blank empty software — takes 3 to 7 days of manual setup and training",
    uniWay: "1-Click Industry Setup: Pre-built stages, WhatsApp scripts & tags ready in 10 seconds",
  },
];

export function ComparisonBanner() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          The Honest Comparison
        </span>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
          Why Modern Businesses Are Replacing Their Legacy SaaS Stack
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          See the side-by-side difference between juggling expensive fragmented tools versus running everything on UniCRM.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* The Old Way */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.02] dark:bg-red-500/[0.04] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-red-500/15">
            <div className="h-7 w-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs shrink-0">
              <X className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-black text-foreground">The Old Way: Portals &amp; Legacy CRMs</div>
              <div className="text-[11px] text-muted-foreground">High commissions, masked numbers, fake portal leads</div>
            </div>
          </div>

          <div className="space-y-3.5">
            {COMPARISON_ROWS.map((row, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {row.feature}
                </div>
                <div className="flex items-start gap-2 text-xs text-foreground/80 font-medium">
                  <X className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{row.oldWay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The UniCRM Way */}
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05] p-5 sm:p-6 space-y-4 shadow-sm relative">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-black text-foreground">The UniCRM Direct Way</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">0% Commission &bull; 100% Direct WhatsApp</div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Direct Connection
            </span>
          </div>

          <div className="space-y-3.5">
            {COMPARISON_ROWS.map((row, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {row.feature}
                </div>
                <div className="flex items-start gap-2 text-xs font-semibold text-foreground">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{row.uniWay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="pt-2 text-center">
        <Link href="/signup">
          <Button size="lg" className="h-11 px-6 rounded-full font-bold text-sm bg-primary text-primary-foreground gap-2 hover:opacity-90 active:opacity-80 shadow-xs">
            <span>Switch to UniCRM for Free</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-[11px] text-muted-foreground mt-2">
          No credit card needed &bull; Instant setup &bull; Keep your existing phone number
        </p>
      </div>
    </div>
  );
}
