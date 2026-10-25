"use client";

import Link from "next/link";
import { X, Check, ArrowRight, Zap, ShieldAlert, Sparkles, HardDrive, Target, Compass, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMPARISON_ROWS = [
  {
    feature: "Monthly Software Subscriptions",
    oldWay: "₹15,000–₹35,000 / month across 4 different tools",
    uniWay: "100% Free Core Software • Zero monthly subscription fees",
  },
  {
    feature: "Team Member & Agent Seats",
    oldWay: "₹1,500 to ₹3,000 charged for every additional agent",
    uniWay: "Unlimited Team Seats • Invite sales, support & ops with zero fees",
  },
  {
    feature: "Customer Photos, Audio & Document Storage",
    oldWay: "Strict 1 GB server caps or expensive cloud storage add-ons",
    uniWay: "Bring-Your-Own-Storage: 15 GB Free directly in your Google Drive",
  },
  {
    feature: "CRM Onboarding & Pipeline Setup",
    oldWay: "Blank empty software — takes 3 to 7 days of manual setup",
    uniWay: "1-Click Industry Setup: Ready in 10 seconds with pre-built stages & scripts",
  },
  {
    feature: "Finding New Paying Customers",
    oldWay: "Buying expensive dirty CSV lists with fake numbers & spam bans",
    uniWay: "Smart Lead Finder: Pre-verified WhatsApp numbers with tailored icebreakers",
  },
  {
    feature: "Customer Memory & Context",
    oldWay: "Scattered notes across WhatsApp chats and memory lapses",
    uniWay: "gbrain AI Dossiers: Remembers every customer's budget & preferences",
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
              <div className="text-sm font-black text-foreground">The Old Fragmented Stack</div>
              <div className="text-[11px] text-muted-foreground">Wati + Zendesk + Apollo + Apollo add-ons</div>
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
        <div className="rounded-2xl border-2 border-primary/40 bg-primary/[0.02] dark:bg-primary/[0.05] p-5 sm:p-6 space-y-4 shadow-sm relative">
          <div className="flex items-center justify-between pb-3 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-black text-foreground">The UniCRM Way</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">100% Free Core &bull; Community Funded</div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Zero Lock-In
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
