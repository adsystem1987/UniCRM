"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScarcityTopBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-center text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
      <span className="relative flex h-2 w-2">
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
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 mb-6 shadow-xs">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span>
        Funded by You &amp; Our Community • 100% Free Forever • Unlimited Team Seats
      </span>
    </div>
  );
}

export function ScarcityCtaButton() {
  return (
    <Link href="/signup">
      <Button
        size="lg"
        className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base gap-2 shadow-lg shadow-emerald-600/25"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Start Free Forever</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
}

export function ScarcityAllocationBar() {
  return (
    <div className="my-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1 text-xs">
      <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        Funded by You &amp; Our Community
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Kept alive and 100% free for everyone by voluntary community supporters and optional Done-For-You technical setup. Zero software subscriptions.
      </p>
    </div>
  );
}
