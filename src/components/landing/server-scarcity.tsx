"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScarcityTopBanner() {
  return (
    <div className="bg-surface border-b border-border px-4 py-2 text-center text-xs font-medium text-muted-foreground flex items-center justify-center gap-2">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
      </span>
      <span>
        Funded by our business community • 100% Free forever for everyone • Zero software fees
      </span>
    </div>
  );
}

export function ScarcityHeroPill() {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface border border-border text-foreground mb-6 shadow-xs">
      <span className="h-2 w-2 rounded-full bg-[#25D366] shrink-0" />
      <span>
        Live &amp; Community Funded • 100% Free Forever • Unlimited Team Seats
      </span>
    </div>
  );
}

export function ScarcityCtaButton() {
  return (
    <Link href="/signup" className="w-full sm:w-auto">
      <Button
        size="lg"
        className="w-full sm:w-auto h-12 sm:h-11 px-6 rounded-full btn-gold-gradient font-bold text-sm sm:text-base gap-2 shadow-md whitespace-nowrap"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>Get Instant Access</span>
        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </Link>
  );
}

export function ScarcityAllocationBar() {
  return (
    <div className="my-4 p-3.5 rounded-2xl border border-border bg-surface text-xs">
      <p className="font-semibold text-foreground flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#25D366] shrink-0" />
        Funded by You &amp; Our Community
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
        Kept alive and 100% free for everyone by voluntary community supporters and optional Done-For-You technical setup. Zero software subscriptions.
      </p>
    </div>
  );
}
