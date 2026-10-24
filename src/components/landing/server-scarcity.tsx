"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScarcityTopBanner() {
  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-center text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-2">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>
        🌱 Funded by you and our community members — keeping UniCRM 100% free for everyone to use • Zero credit card required
      </span>
    </div>
  );
}

export function ScarcityHeroPill() {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 mb-6 shadow-xs">
      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
      <span>
        Funded by You &amp; Our Community • 100% Free Forever • Unlimited Team Seats
      </span>
    </div>
  );
}

export function ScarcityCtaButton() {
  return (
    <Link href="/signup" className="w-full sm:w-auto">
      <Button
        size="lg"
        className="w-full sm:w-auto h-11 px-5 rounded-full bg-primary text-primary-foreground font-medium text-base gap-2 hover:opacity-90 active:opacity-80 active:translate-y-px shadow-xs"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Start for free</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </Link>
  );
}

export function ScarcityAllocationBar() {
  return (
    <div className="my-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1 text-xs">
      <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        Funded by You &amp; Our Community
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Kept alive and 100% free for everyone by voluntary community supporters and optional Done-For-You technical setup. Zero software subscriptions.
      </p>
    </div>
  );
}
