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
    label: "₹29",
    sublabel: "Chai Supporter",
    badge: "Starter",
    icon: Coffee,
  },
  {
    amount: "99",
    label: "₹99",
    sublabel: "Server Backer",
    badge: "Popular",
    icon: Rocket,
  },
  {
    amount: "299",
    label: "₹299",
    sublabel: "Super Hero 🌟",
    badge: "Pro Community",
    icon: Award,
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
  const [activeTab, setActiveTab] = useState<"pay" | "perks">("pay");
  const [selectedAmount, setSelectedAmount] = useState<string>("99");
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);

  const effectiveAmount = isCustom
    ? Math.max(1, parseInt(customAmount || "0", 10) || 29).toString()
    : selectedAmount;

  const payeeName = "DFY UniCRM";
  const note = `Support DFY UniCRM (₹${effectiveAmount})`;

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
    `Hi DFY UniCRM team! I just contributed ₹${effectiveAmount} via UPI to support the project (UPI ID: ${upiId}).\n\nMy Payment Ref/UTR:\nPlease send me the 50+ WhatsApp Business Templates & Automation Pack! 🙌`
  )}`;

  const claimEmailUri = `mailto:ravibabuche@dfydude.online?subject=${encodeURIComponent(
    `DFY UniCRM Supporter Perks Claim (₹${effectiveAmount})`
  )}&body=${encodeURIComponent(
    `Hi Ravi,\n\nI just contributed ₹${effectiveAmount} via UPI to support DFY UniCRM!\n\nPayee UPI ID: ${upiId}\nMy UPI Transaction ID / UTR:\n\nPlease send the 50+ WhatsApp Business Templates and 3 Automation Flows to this email address.\n\nThank you!`
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Heart className="h-6 w-6 fill-rose-500" />
          </div>
          <DialogTitle className="text-xl font-black">Support DFY UniCRM</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-sm mx-auto">
            UniCRM is 100% free and open for every business. Contributions starting at ₹29 keep our servers running and unlock exclusive supporter perks!
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
            <span>Pay via UPI (₹{effectiveAmount})</span>
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
            <Gift className="h-3.5 w-3.5 text-rose-500" />
            <span>Supporter Perks 🎁</span>
          </button>
        </div>

        {activeTab === "pay" ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            {/* Multiple Amount Selector */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold px-0.5">
                <span className="text-muted-foreground">Select Contribution Amount:</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Perks included with any amount!
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
                          ? "border-rose-500 bg-rose-500/10 text-foreground ring-1 ring-rose-500 shadow-xs"
                          : "border-border bg-card hover:bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {opt.badge && (
                        <span
                          className={`absolute -top-2 px-1.5 py-0.2 text-[9px] font-black rounded-full uppercase tracking-wider ${
                            isSelected
                              ? "bg-rose-600 text-white"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1 font-black text-base text-foreground mt-0.5">
                        <Icon className="h-3.5 w-3.5 text-rose-500" />
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
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-rose-500/50 bg-rose-500/5">
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
              <QrCode className="h-3.5 w-3.5" />
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

            {/* Direct UPI App intent button (Works seamlessly on mobile devices) */}
            <a href={upiUri} className="w-full">
              <Button className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
                <ExternalLink className="h-4 w-4" />
                Pay ₹{effectiveAmount} via UPI App
              </Button>
            </a>

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
        ) : (
          /* Perks / Goodies Tab */
          <div className="py-2 space-y-4">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                <Gift className="h-4 w-4 text-rose-500" />
                <span>What Every Supporter Gets (From ₹29)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As a heartfelt thank you for supporting UniCRM, you get instant access to our curated WhatsApp marketing vault to boost your business revenue:
              </p>
            </div>

            {/* 3 Core Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-xl border border-border p-2.5 bg-card space-y-1">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>50+ Templates</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  High-converting copy for follow-ups, flash sales, festive campaigns & reviews.
                </p>
              </div>

              <div className="rounded-xl border border-border p-2.5 bg-card space-y-1">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <Rocket className="h-3.5 w-3.5" />
                  <span>3 Automations</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  1-click importable flows: Lead Welcome, Inactive Re-engagement & VIP Tagger.
                </p>
              </div>

              <div className="rounded-xl border border-border p-2.5 bg-card space-y-1">
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold text-xs">
                  <Award className="h-3.5 w-3.5" />
                  <span>Supporter Role</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Supporter badge, priority bug triage & early preview access to upcoming AI features.
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
                  How to Claim Your Complete 50+ Template & Automation Pack:
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Contributed ₹29 or more? Tap either option below to send your transaction screenshot or UTR number and get the full bundle delivered:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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
              className="w-full font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Back to Payment (from ₹29)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function UpiSupportCard({ upiId }: { upiId?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-auto mb-2 rounded-xl border border-rose-500/25 bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent p-3 text-xs space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>Support DFY UniCRM</span>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            From ₹29
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          UniCRM is 100% free. Support from <strong className="text-foreground">₹29</strong> & unlock <strong className="text-foreground">50+ WhatsApp templates</strong> + 3 automation flows!
        </p>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium pt-0.5">
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <Gift className="h-3 w-3" />
            Free Perks
          </span>
          <span className="font-bold text-foreground">₹29 • ₹99 • ₹299</span>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 text-white py-1.5 text-center text-xs font-bold transition-all shadow-xs active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <span>Support from ₹29</span>
          <span className="text-[10px] opacity-80">(UPI 🇮🇳)</span>
        </button>
      </div>

      <UpiSupportDialog
        open={open}
        onOpenChange={setOpen}
        upiId={upiId}
      />
    </>
  );
}
