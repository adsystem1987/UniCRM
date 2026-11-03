"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  MessageCircle,
  PhoneCall,
  Camera,
  Mail,
  Share2,
  HardDrive,
  Target,
  Compass,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Banknote,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactButton } from "@/components/contact/contact-buttons";

export function MotionHeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 md:pt-20 md:pb-28 border-b border-border/40">
      <div
        aria-hidden="true"
        className="mkt-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_55%_at_50%_40%,black,transparent)]"
      />

      {/* Floating Animated Ambient Glows */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Scarcity Pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-foreground mb-6 shadow-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">
            Community Funded &bull; Zero Subscription Tax &bull; Unlimited Team Seats
          </span>
        </motion.div>

        {/* Floating Live Signal Badges (Desktop Viewport) */}
        <div className="hidden lg:block relative pointer-events-none">
          {/* Badge 1: Live Loan Approval */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [-6, 6, -6],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.2 },
              x: { duration: 0.6, delay: 0.2 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -top-4 -left-2 xl:left-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-card/90 border border-emerald-500/30 backdrop-blur-md shadow-xl text-left pointer-events-auto"
          >
            <div className="size-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
              <Banknote className="size-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <span>₹25L Working Capital</span>
                <span className="size-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[9px] text-muted-foreground">Approved for Surat Textile MSME</div>
            </div>
          </motion.div>

          {/* Badge 2: Live Inbound WhatsApp Lead */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [6, -6, 6],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.3 },
              x: { duration: 0.6, delay: 0.3 },
              y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -top-4 -right-2 xl:right-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-card/90 border border-primary/30 backdrop-blur-md shadow-xl text-left pointer-events-auto"
          >
            <div className="size-8 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0">
              <MessageCircle className="size-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <span>Direct WhatsApp Lead</span>
                <span className="size-1.5 rounded-full bg-[#25D366] animate-pulse" />
              </div>
              <div className="text-[9px] text-muted-foreground">Auto-saved to PostgreSQL Desk</div>
            </div>
          </motion.div>
        </div>

        {/* Main Emotional Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-foreground text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08]"
        >
          Stop paying rent on customer relationships.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Every WhatsApp chat, incoming voice call, Instagram DM, and support ticket — centralized in your own database. Zero per-seat fees, zero middleman cuts, zero SaaS extortion.
        </motion.p>

        {/* Staggered Channels Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-5 sm:mt-6 flex sm:flex-wrap items-center sm:justify-center gap-2 max-w-3xl mx-auto overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 px-2 sm:px-0 no-scrollbar"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-semibold bg-surface text-foreground border border-border shrink-0 shadow-xs">
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> WhatsApp Messaging
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-semibold bg-surface text-foreground border border-border shrink-0 shadow-xs">
            <PhoneCall className="h-3.5 w-3.5 text-[#25D366]" /> WhatsApp Calling & IVR
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-semibold bg-surface text-foreground border border-border shrink-0 shadow-xs">
            <Camera className="h-3.5 w-3.5 text-[#E4405F]" /> Instagram DMs
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-semibold bg-surface text-foreground border border-border shrink-0 shadow-xs">
            <Mail className="h-3.5 w-3.5 text-[#EA4335]" /> Support Email Inbox
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border shrink-0">
            <Share2 className="h-3.5 w-3.5 text-[#1877F2]" /> Facebook Messenger
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border shrink-0">
            <HardDrive className="h-3.5 w-3.5 text-[#4285F4]" /> Cloud Drive Pool (15–45GB+)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border shrink-0">
            <Target className="h-3.5 w-3.5 text-primary" /> Smart Lead Finder
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-medium bg-surface text-foreground border border-border shrink-0">
            <Compass className="h-3.5 w-3.5 text-purple-500" /> 1-Click Industry Setup
          </span>
        </motion.div>

        {/* Action Buttons: High-Contrast High-CTR with Spring Tap Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto block">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 rounded-full btn-gold-gradient font-black text-sm sm:text-base gap-2.5 shadow-xl hover:shadow-primary/25 transition-all whitespace-nowrap"
                >
                  <MessageCircle className="h-5 w-5 shrink-0" />
                  <span>Claim Your Free Workplace</span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <ContactButton
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-13 px-6 rounded-full font-semibold text-sm sm:text-base border-border bg-card/60 backdrop-blur-md hover:border-primary/50 hover:bg-card transition-all"
              >
                <Headphones className="h-4 w-4 mr-2 text-primary" />
                <span>Talk with Founders</span>
              </ContactButton>
            </motion.div>
          </div>

          <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-2 text-center px-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>No credit card &bull; Instant 60-second QR setup &bull; Keep 100% data ownership</span>
          </p>
        </motion.div>

        {/* Value Proof Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 sm:mt-10 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-x-8 sm:gap-y-3 text-xs sm:text-sm font-medium text-muted-foreground"
        >
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="size-1.5 rounded-full bg-[#25D366]" />
            <span>Zero Per-Seat Costs</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="size-1.5 rounded-full bg-[#25D366]" />
            <span>Instant QR Connect</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="size-1.5 rounded-full bg-[#25D366]" />
            <span>Free AI Gateway</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="size-1.5 rounded-full bg-[#25D366]" />
            <span>WhatsApp Calling</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
