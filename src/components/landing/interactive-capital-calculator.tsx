"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Banknote,
  TrendingUp,
  Percent,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoanOption {
  id: string;
  name: string;
  maxAmount: number;
  monthlyRate: number; // e.g. 1.05%
  minTenureMonths: number;
  maxTenureMonths: number;
  badge: string;
}

const LOAN_TRACKS: LoanOption[] = [
  {
    id: "business",
    name: "MSME Stock & Working Capital",
    maxAmount: 5000000, // 50L
    monthlyRate: 1.15,
    minTenureMonths: 12,
    maxTenureMonths: 36,
    badge: "Fast 48-Hour Disbursal",
  },
  {
    id: "lap",
    name: "Loan Against Property (LAP)",
    maxAmount: 50000000, // 5 Cr
    monthlyRate: 0.82,
    minTenureMonths: 24,
    maxTenureMonths: 180,
    badge: "Lowest Interest Rate",
  },
  {
    id: "machinery",
    name: "Factory Machinery & CGTMSE",
    maxAmount: 20000000, // 2 Cr
    monthlyRate: 0.95,
    minTenureMonths: 12,
    maxTenureMonths: 60,
    badge: "Subsidized Collateral-Free",
  },
];

export function InteractiveCapitalCalculator() {
  const [selectedTrack, setSelectedTrack] = useState<LoanOption>(LOAN_TRACKS[0]);
  const [amount, setAmount] = useState<number>(1500000); // 15L
  const [tenureMonths, setTenureMonths] = useState<number>(24);

  // EMI Formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
  const monthlyRateDecimal = selectedTrack.monthlyRate / 100;
  const emi = Math.round(
    (amount * monthlyRateDecimal * Math.pow(1 + monthlyRateDecimal, tenureMonths)) /
      (Math.pow(1 + monthlyRateDecimal, tenureMonths) - 1)
  );

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="w-full rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-card via-card/90 to-emerald-950/20 p-6 sm:p-9 md:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute -right-16 -bottom-16 size-72 rounded-full bg-emerald-500/10 pointer-events-none blur-3xl" />

      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-2.5">
            <Calculator className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Interactive Capital Desk &bull; Real-Time EMI Preview</span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Calculate your borrowing power in seconds.
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl">
            Zero impact on CIBIL. Instant eligibility check backed by 15+ private NBFCs and direct underwriting desks.
          </p>
        </div>

        {/* Track Selector Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {LOAN_TRACKS.map((track) => {
            const isSelected = selectedTrack.id === track.id;
            return (
              <motion.button
                key={track.id}
                onClick={() => {
                  setSelectedTrack(track);
                  if (amount > track.maxAmount) setAmount(track.maxAmount);
                  if (tenureMonths > track.maxTenureMonths) setTenureMonths(track.maxTenureMonths);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background/80 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeTrackPill"
                    className="absolute inset-0 rounded-xl bg-primary -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {track.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Sliders & Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Sliders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Amount Slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background/60 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Required Capital Amount
              </span>
              <motion.span
                key={amount}
                initial={{ opacity: 0.7, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono"
              >
                {formatLakhs(amount)}
              </motion.span>
            </div>
            <input
              type="range"
              min={200000}
              max={selectedTrack.maxAmount}
              step={100000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
              <span>Min: ₹2 Lakhs</span>
              <span>Max: {formatLakhs(selectedTrack.maxAmount)}</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background/60 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Repayment Tenure
              </span>
              <motion.span
                key={tenureMonths}
                initial={{ opacity: 0.7, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg sm:text-xl font-black text-foreground font-mono"
              >
                {tenureMonths} Months ({Math.round(tenureMonths / 12 * 10) / 10} Yrs)
              </motion.span>
            </div>
            <input
              type="range"
              min={selectedTrack.minTenureMonths}
              max={selectedTrack.maxTenureMonths}
              step={6}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
              <span>{selectedTrack.minTenureMonths} Months</span>
              <span>{selectedTrack.maxTenureMonths} Months</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live EMI Result Card */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-card to-background border border-border shadow-xl space-y-5 text-left relative">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Estimated Monthly EMI
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={emi}
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="text-3xl sm:text-4xl font-black text-foreground font-mono tracking-tight"
                >
                  ₹{emi.toLocaleString("en-IN")}
                </motion.span>
                <span className="text-xs text-muted-foreground font-medium">/month</span>
              </div>
            </div>

            {/* Micro Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border/60 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground text-[10px] block">Interest Track</span>
                <span className="font-bold text-foreground">From {selectedTrack.monthlyRate}%/mo</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground text-[10px] block">Processing Fee</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹0 Subsidized</span>
              </div>
            </div>

            {/* Direct CTA carrying the exact parameters to /loans */}
            <div className="pt-2">
              <Link
                href={`/signup?next=/loans&amount=${amount}&track=${selectedTrack.id}&tenure=${tenureMonths}&role=customer`}
                className="w-full block"
              >
                <Button className="w-full h-12 rounded-xl btn-gold-gradient font-black text-sm gap-2 shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all">
                  <Banknote className="h-4 w-4" />
                  <span>Lock In This Rate &bull; Underwrite</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Direct Underwriter Access &bull; Low CIBIL Accepted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
