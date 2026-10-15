"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerSlots } from "@/lib/scarcity";

export function ScarcityTopBanner() {
  const slots = useServerSlots();

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
      </span>
      <span>
        ⚡ Limited Server Capacity: Free signups are capped at {slots.total} businesses per batch to preserve database & AI speed. Only {slots.remaining} free lifetime spots remaining!
      </span>
    </div>
  );
}

export function ScarcityHeroPill() {
  const slots = useServerSlots();

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 mb-6 shadow-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <span>
        High Demand Alert: {slots.percentage}% Free Server Slots Claimed • Only {slots.remaining} Left in Current Batch
      </span>
    </div>
  );
}

export function ScarcityCtaButton() {
  const slots = useServerSlots();

  return (
    <Link href="/signup">
      <Button
        size="lg"
        className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base gap-2 shadow-lg shadow-emerald-600/25"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Claim Free Account ({slots.remaining} Spots Left)</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
}

export function ScarcityAllocationBar() {
  const slots = useServerSlots();

  return (
    <div className="my-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1.5 text-xs">
      <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-400">
        <span>Server Capacity Allocation</span>
        <span>
          {slots.claimed} / {slots.total} Claimed
        </span>
      </div>
      <div className="w-full bg-amber-500/20 rounded-full h-2 overflow-hidden">
        <div
          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${slots.percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Free lifetime accounts are batch-restricted to guarantee lightning-fast database & AI speeds for active teams. Only {slots.remaining} slots remain!
      </p>
    </div>
  );
}
