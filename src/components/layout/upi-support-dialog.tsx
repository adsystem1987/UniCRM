"use client";

import { useState } from "react";
import {
  Heart,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Gift,
  Coffee,
  Rocket,
  Award,
  Sparkles,
  MessageSquare,
  Mail,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Smile,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UpiSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upiId?: string;
}

interface PresetOption {
  amount: string;
  label: string;
  sublabel: string;
  badge?: string;
  icon: typeof Coffee;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    amount: "29",
    label: "₹29/mo",
    sublabel: "Community Supporter ☕",
    badge: "Free Mission",
    icon: Coffee,
  },
  {
    amount: "59",
    label: "₹59/mo",
    sublabel: "AI Smart Router Pro ⚡",
    badge: "Most Popular",
    icon: Sparkles,
  },
  {
    amount: "149",
    label: "₹149/mo",
    sublabel: "24/7 Cloud Gateway 🚀",
    badge: "Full Power",
    icon: Rocket,
  },
];

const SAMPLE_TEMPLATES = [
  {
    category: "Lead Follow-Up & Qualification",
    text: "Hi {{1}}, thank you for reaching out to {{2}}! We received your inquiry regarding {{3}}. Would you like a quick 5-minute demo or shall we share our pricing catalog here?",
  },
  {
    category: "Instant Payment Reminder (UPI)",
    text: "Dear {{1}}, gentle reminder regarding invoice #{{2}} of ₹{{3}}. You can complete the payment in seconds via UPI: {{4}}. Reply with 'DONE' once paid!",
  },
  {
    category: "Cart Recovery & Special Offer",
    text: "Hey {{1}}! You left {{2}} in your cart. We've reserved it for the next 2 hours with an extra 10% discount using code SAVE10: {{3}}",
  },
  {
    category: "5-Star Review & Feedback Request",
    text: "Hi {{1}}, thanks for choosing {{2}}! How was your experience? If you enjoyed our service, could you take 20 seconds to rate us on Google? {{3}}",
  },
];

export function UpiSupportDialog({
  open,
  onOpenChange,
  upiId = process.env.NEXT_PUBLIC_UPI_ID || "ravibabuche@oksbi",
}: UpiSupportDialogProps) {
  const [activeTab, setActiveTab] = useState<"pay" | "dfy" | "perks" | "thanks">("pay");
  const [selectedAmount, setSelectedAmount] = useState<string>("59");
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);
  const [hasPaid, setHasPaid] = useState(false);

  const effectiveAmount = isCustom
    ? Math.max(1, parseInt(customAmount || "0", 10) || 29).toString()
    : selectedAmount;

  const payeeName = "DFY UniCRM";
  const note = `Support DFY UniCRM Monthly (₹${effectiveAmount}/mo)`;

  // Standard UPI URI format compatible with Google Pay, PhonePe, Paytm, BHIM, etc.
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedId(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyTemplate = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateIdx(index);
    toast.success("Template copied to clipboard!");
    setTimeout(() => setCopiedTemplateIdx(null), 2000);
  };

  const claimWhatsAppUri = `https://wa.me/?text=${encodeURIComponent(
    `Hi DFY UniCRM team! I just contributed ₹${effectiveAmount}/month via UPI to support the project (UPI ID: ${upiId}).\n\nMy Payment Ref/UTR:\nPlease send me the 50+ WhatsApp Business Templates & Automation Pack! 🙌`
  )}`;

  const claimEmailUri = `mailto:help@dfyunicrm.com?subject=${encodeURIComponent(
    `DFY UniCRM Monthly Supporter Perks Claim (₹${effectiveAmount}/mo)`
  )}&body=${encodeURIComponent(
    `Hi Ravi,\n\nI just contributed ₹${effectiveAmount}/month via UPI to support DFY UniCRM!\n\nPayee UPI ID: ${upiId}\nMy UPI Transaction ID / UTR:\n\nPlease send the 50+ WhatsApp Business Templates and 3 Automation Flows to this email address.\n\nThank you!`
  )}`;

  const handleConfirmPayment = () => {
    setHasPaid(true);
    setActiveTab("thanks");
    toast.success("Thank you for backing UniCRM! 🎉", {
      description: "You've helped keep this platform 100% free for everyone.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-emerald-500/15 border border-indigo-500/30 text-indigo-500 shadow-sm">
            <HeartHandshake className="h-6 w-6 text-indigo-500" />
          </div>
          <DialogTitle className="text-xl font-black">Support DFY UniCRM</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-sm mx-auto">
            UniCRM is 100% free forever. Support from ₹29/month to help fund cloud servers, AI infrastructure & maintenance to keep UniCRM free for every community member!
          </DialogDescription>
        </DialogHeader>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-muted p-1 text-xs font-bold gap-1 mt-1">
          <button
            type="button"
            onClick={() => setActiveTab("pay")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === "pay"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Support (₹{effectiveAmount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dfy")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === "dfy"
                ? "bg-background text-foreground shadow-xs ring-1 ring-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>DFY Setup 🛠️</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("perks")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === "perks"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gift className="h-3.5 w-3.5 text-amber-500" />
            <span>Perks 🎁</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("thanks")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === "thanks"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
            <span>Thank You ❤️</span>
          </button>
        </div>

        {activeTab === "pay" ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            {/* Multiple Amount Selector */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold px-0.5">
                <span className="text-muted-foreground">Select Monthly Support Tier:</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Perks included with all tiers!
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PRESET_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = !isCustom && selectedAmount === opt.amount;
                  return (
                    <button
                      key={opt.amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(opt.amount);
                        setIsCustom(false);
                      }}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10 text-foreground ring-2 ring-indigo-500/30 shadow-xs"
                          : "border-border bg-card hover:bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {opt.badge && (
                        <span
                          className={`absolute -top-2 px-1.5 py-0.2 text-[9px] font-black rounded-full uppercase tracking-wider ${
                            isSelected
                              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1 font-black text-base text-foreground mt-0.5">
                        <Icon className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {opt.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom amount toggle */}
              <div className="pt-1">
                {isCustom ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-indigo-500/50 bg-indigo-500/5">
                    <span className="text-sm font-bold pl-2 text-foreground">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount (e.g. 500)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-bold focus:outline-none text-foreground placeholder:text-muted-foreground/50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustom(false);
                        setSelectedAmount("99");
                      }}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className="w-full text-center text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:underline py-0.5"
                  >
                    Want to contribute another amount? Click to enter custom ₹
                  </button>
                )}
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt={`Scan to pay ₹${effectiveAmount} via UPI`}
                className="h-44 w-44 object-contain rounded-lg"
              />
              <span className="mt-2 text-[11px] font-bold text-gray-800">
                Amount: ₹{effectiveAmount}
              </span>
            </div>

            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5 text-primary" />
              Scan with Google Pay, PhonePe, Paytm, BHIM, or CRED
            </p>

            {/* UPI ID Row */}
            <div className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Payee UPI ID
                </p>
                <p className="text-xs font-mono font-bold truncate text-foreground">
                  {upiId}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUpiId}
                className="h-8 px-2.5 text-xs font-bold gap-1 shrink-0"
              >
                {copiedId ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Direct UPI App intent button */}
            <a href={upiUri} className="w-full">
              <Button className="w-full h-11 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white gap-2 shadow-sm border border-emerald-400/20 active:scale-[0.98]">
                <ExternalLink className="h-4 w-4" />
                Pay ₹{effectiveAmount} via UPI App
              </Button>
            </a>

            {/* Payment Done Confirmation */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfirmPayment}
              className="w-full text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              I&apos;ve already sent ₹{effectiveAmount} via UPI
            </Button>

            {/* Free Perks Callout Preview */}
            <div className="w-full rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-400">
                  <Sparkles className="h-4 w-4 fill-amber-500" />
                  <span>Free Supporter Perks Included:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("perks")}
                  className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  View Details & Claim →
                </button>
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-1 pl-4 list-disc">
                <li>
                  <strong className="text-foreground">50+ Pre-Tested WhatsApp Business Templates</strong> (Sales, recovery, payment links)
                </li>
                <li>
                  <strong className="text-foreground">3 Ready-to-Import Automation Flows</strong> (Instant lead welcome & tagging)
                </li>
                <li>
                  <strong className="text-foreground">Community Supporter Badge</strong> + Direct WhatsApp delivery
                </li>
              </ul>
            </div>
          </div>
        ) : activeTab === "dfy" ? (
          /* Done-For-You (DFY) Team Onboarding & Setup Tab */
          <div className="py-2 space-y-4 text-left">
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-indigo-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Sparkles className="h-3 w-3" />
                  High-Touch Agency Service
                </span>
                <span className="text-sm font-black text-foreground bg-background/80 px-2.5 py-0.5 rounded-lg border border-border">
                  ₹1,999 <span className="text-[10px] text-muted-foreground font-normal">one-time</span>
                </span>
              </div>
              <h4 className="font-black text-foreground text-base">
                Done-For-You (DFY) Team Setup &amp; Onboarding
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Skip technical hurdles. Our engineering team gets UniCRM fully configured, tailored to your sales process, and working seamlessly for your team in under 24 hours.
              </p>
            </div>

            {/* Deliverables List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Everything Included in Your ₹1,999 DFY Package:</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="text-base">🎯</span>
                    <span>30-Min 1-on-1 Google Meet</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Live call with you &amp; your sales reps to map your pipeline stages, custom tags &amp; team roles.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="text-base">📱</span>
                    <span>WhatsApp Web Gateway Pairing</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    End-to-end QR pairing, webhook verification, and 24/7 cloud auto-reconnect guarantee.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="text-base">👥</span>
                    <span>Contact &amp; Lead CSV Migration</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    We clean, format &amp; import up to 5,000 existing leads from Excel/CSV with custom fields.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="text-base">⚡</span>
                    <span>3 Custom Automation Flows</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Instant welcome reply, inbound lead qualifier, and automated payment/quote follow-ups.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="text-base">🤖</span>
                    <span>1-Month AI Smart Router Pro Included (Free)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Instant zero-config AI reply drafts, automated lead qualification &amp; priority triage included for 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* UPI & Booking Action Card */}
            <div className="rounded-xl border border-indigo-500/25 bg-muted/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Pay ₹1,999 via UPI to Book:</span>
                <span className="font-mono text-[11px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                  {upiId}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("DFY UniCRM Onboarding")}&am=1999&cu=INR&tn=${encodeURIComponent("UniCRM DFY Team Onboarding (₹1,999)")}`}
                  className="flex-1"
                >
                  <Button className="w-full h-10 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white gap-2 shadow-xs text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Pay ₹1,999 via UPI
                  </Button>
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hi DFY UniCRM team! I want to book the Done-For-You (DFY) Team Onboarding & Setup (₹1,999).\n\nMy Business Name:\nTeam Size:\nPreferred Time for Google Meet:\nPayment UTR (if already sent via UPI):`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full h-10 font-bold text-xs gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Schedule via WhatsApp
                  </Button>
                </a>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                <span>Questions before booking?</span>
                <a
                  href="mailto:help@dfyunicrm.com?subject=UniCRM%20DFY%20Setup%20Inquiry"
                  className="font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  Email our team
                </a>
              </div>
            </div>
          </div>
        ) : activeTab === "perks" ? (
          /* Perks / Goodies Tab */
          <div className="py-2 space-y-4">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                <Gift className="h-4 w-4 text-indigo-500" />
                <span>What Every Monthly Supporter Gets (From ₹29/mo)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As a heartfelt thank you for helping keep UniCRM free and reliable for every community member, you get instant access to our curated WhatsApp marketing vault to boost your business revenue:
              </p>
            </div>

            {/* 3 Core Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-xl border border-border p-2.5 bg-card space-y-1">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>AI Smart Router Pro</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Zero-config AI for automatic WhatsApp reply drafts & incoming lead qualification (₹59/mo).
                </p>
              </div>

              <div className="rounded-xl border border-border p-2.5 bg-card space-y-1">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>50+ Templates & Flows</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  High-converting copy for follow-ups, flash sales, festive campaigns & importable flows.
                </p>
              </div>

              <div className="rounded-xl border border-border p-2.5 bg-card space-y-1">
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold text-xs">
                  <Award className="h-3.5 w-3.5" />
                  <span>Supporter Role</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Supporter badge, priority bug triage & early preview access to upcoming CRM updates.
                </p>
              </div>
            </div>

            {/* Sample Templates Preview */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span>Sample Templates (Copy & Use Anytime):</span>
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                  <div
                    key={tmpl.category}
                    className="p-2.5 rounded-xl border border-border bg-muted/40 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-foreground">
                        {tmpl.category}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyTemplate(tmpl.text, idx)}
                        className="h-6 px-2 text-[10px] font-bold gap-1 text-muted-foreground hover:text-foreground"
                      >
                        {copiedTemplateIdx === idx ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono bg-background/60 p-2 rounded-lg border border-border/50">
                      {tmpl.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Claim Section */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2.5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  How to Receive the Full Pack:
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Send your UPI UTR / Transaction ID after payment. We will deliver the complete ZIP bundle and importable automation JSON immediately.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={claimWhatsAppUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs font-bold gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Claim on WhatsApp
                  </Button>
                </a>

                <a href={claimEmailUri} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs font-bold gap-1.5 border-border hover:bg-muted"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Claim via Email
                  </Button>
                </a>
              </div>
            </div>

            <Button
              variant="default"
              onClick={() => setActiveTab("pay")}
              className="w-full font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
            >
              Back to Support (from ₹29/month)
            </Button>
          </div>
        ) : (
          /* Dedicated Thank You & Community Impact Tab */
          <div className="py-2 space-y-4 text-left">
            <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/15 text-pink-500">
                  <Heart className="h-5 w-5 fill-pink-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Thank You for Backing UniCRM!</h4>
                  <p className="text-[11px] text-muted-foreground">Every monthly contribution keeps our software open & free.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                UniCRM has <strong className="text-foreground">zero subscription fees</strong>, <strong className="text-foreground">no per-user commissions</strong>, and <strong className="text-foreground">no artificial paywalls</strong>. Your voluntary monthly support keeps UniCRM running reliably for everyone, and empowers us to keep building and releasing more useful free tools, templates & automations for all business owners!
              </p>
            </div>

            {/* Impact Highlights */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>What Your Monthly Contribution Powers:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <span className="text-lg">🆓</span>
                  <p className="text-xs font-bold text-foreground">100% Free Forever</p>
                  <p className="text-[10px] text-muted-foreground">
                    Keeps the platform free for thousands of micro-businesses across India.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <span className="text-lg">⚡</span>
                  <p className="text-xs font-bold text-foreground">Cloud Servers & AI</p>
                  <p className="text-[10px] text-muted-foreground">
                    Funds reliable cloud servers, AI bills & real-time WhatsApp message gateways.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <span className="text-lg">🚀</span>
                  <p className="text-xs font-bold text-foreground">Active Maintenance</p>
                  <p className="text-[10px] text-muted-foreground">
                    Enables regular maintenance, fixes, and community-requested features.
                  </p>
                </div>
              </div>
            </div>

            {/* Claim Perks button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={claimWhatsAppUri}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Claim 50+ Templates on WhatsApp
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={() => setActiveTab("pay")}
                className="w-full h-9 text-xs font-bold"
              >
                Back to Supporter Tiers
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function UpiSupportBanner({ upiId }: { upiId?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-emerald-500/10 p-4 sm:p-5 shadow-xs transition-all hover:border-indigo-500/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 font-black text-sm text-foreground">
                <HeartHandshake className="h-4 w-4 text-indigo-500" />
                <span>Support DFY UniCRM</span>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                From ₹29/mo
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Gift className="h-3 w-3" />
                ₹29/mo Supporter • ₹59/mo AI Pro • ₹149/mo Gateway • ₹1,999 DFY Setup
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              UniCRM is 100% free forever. Support from <strong className="text-foreground">₹29/month</strong> or get our <strong className="text-foreground">Done-For-You (DFY) Team Onboarding (₹1,999)</strong> to get your pipeline, WhatsApp gateway &amp; automations configured live with zero headaches!
            </p>

            <p className="text-[11px] text-muted-foreground/85 flex items-center gap-1 pt-0.5">
              <Heart className="h-3 w-3 fill-pink-500 text-pink-500 inline shrink-0" />
              <span>Every supporter keeps UniCRM running for everyone &amp; fuels more useful free tools for all business owners!</span>
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white px-5 py-2.5 text-center text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10 group cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Support &amp; DFY Setup</span>
              <span className="text-[11px] opacity-85 font-normal">(UPI 🇮🇳)</span>
            </button>
          </div>
        </div>
      </div>

      <UpiSupportDialog
        open={open}
        onOpenChange={setOpen}
        upiId={upiId}
      />
    </>
  );
}

export function UpiSupportCard({ upiId }: { upiId?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-auto mb-2 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/5 p-3 text-xs space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <HeartHandshake className="h-4 w-4 text-indigo-500" />
            <span>Support DFY UniCRM</span>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            From ₹29/mo
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          UniCRM is 100% free forever. Support from <strong className="text-foreground">₹29/month</strong> or get our <strong className="text-foreground">DFY Team Setup (₹1,999)</strong> to fast-track your launch!
        </p>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium pt-0.5">
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <Gift className="h-3 w-3" />
            Supporter Perks
          </span>
          <span className="font-bold text-foreground">₹29 • ₹59 • ₹149 • ₹1,999 DFY</span>
        </div>

        {/* Cool, vibrant, modern button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white py-2 text-center text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center gap-1.5 border border-white/10 group cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span>Support &amp; DFY Setup</span>
          <span className="text-[10px] opacity-85 font-normal">(UPI 🇮🇳)</span>
        </button>

        {/* Community Gratitude Note */}
        <div className="pt-0.5 border-t border-border/40 text-center">
          <p className="text-[10px] text-muted-foreground/85 leading-snug flex items-center justify-center gap-1">
            <Heart className="h-2.5 w-2.5 fill-pink-500 text-pink-500 inline shrink-0" />
            <span>Every supporter keeps UniCRM running for everyone & fuels more useful free tools for all business owners!</span>
          </p>
        </div>
      </div>

      <UpiSupportDialog
        open={open}
        onOpenChange={setOpen}
        upiId={upiId}
      />
    </>
  );
}
