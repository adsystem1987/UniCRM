"use client";

import { useState } from "react";
import {
  Heart,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UpiSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upiId?: string;
  payeeName?: string;
}

const SUPPORT_TIERS = [
  { amount: "29", label: "₹29", desc: "Keep it free" },
  { amount: "59", label: "₹59", desc: "AI Pro features" },
  { amount: "149", label: "₹149", desc: "Priority support" },
];

export function UpiSupportDialog({
  open,
  onOpenChange,
  upiId = "dfydude@axl",
  payeeName = "DFY UniCRM Community",
}: UpiSupportDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<string>("29");
  const [isDfySelected, setIsDfySelected] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState(false);

  const effectiveAmount = isDfySelected ? "1000" : selectedAmount;

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${encodeURIComponent(effectiveAmount)}&cu=INR&tn=${encodeURIComponent(
    isDfySelected ? "UniCRM DFY 1-on-1 Setup" : `UniCRM Support ₹${effectiveAmount}`
  )}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiUri
  )}&margin=10`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedId(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleConfirmPayment = () => {
    onOpenChange(false);
    toast.success("Thank you for supporting UniCRM! ❤️", {
      description: "Your support keeps UniCRM 100% free and open for everyone.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="text-center sm:text-center space-y-1">
          <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
            <Heart className="h-5 w-5 fill-pink-500" />
          </div>
          <DialogTitle className="text-lg font-black text-foreground">
            Thank You for Supporting UniCRM
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            UniCRM is 100% free forever for all business owners. Small contributions help cover our cloud servers, APIs, and maintenance to keep it free for everyone like you!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick Amount Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Choose Support Amount:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORT_TIERS.map((tier) => {
                const isSelected = !isDfySelected && selectedAmount === tier.amount;
                return (
                  <button
                    key={tier.amount}
                    type="button"
                    onClick={() => {
                      setIsDfySelected(false);
                      setSelectedAmount(tier.amount);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                        : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <span className="text-sm font-black text-foreground">{tier.label}/mo</span>
                    <span className="text-[10px] text-muted-foreground">{tier.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional DFY Setup Card */}
          <button
            type="button"
            onClick={() => setIsDfySelected(!isDfySelected)}
            className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
              isDfySelected
                ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold text-foreground">Optional: 1-on-1 DFY Setup</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Need hands-on technical help? Our team joins a live Google Meet to set up your Google Drive + Supabase + WhatsApp completely.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                ₹1,000
              </span>
              <span className="block text-[9px] text-muted-foreground font-medium mt-0.5">one-time</span>
            </div>
          </button>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`Scan to pay ₹${effectiveAmount} via UPI`}
              className="h-36 w-36 object-contain rounded"
            />
            <span className="mt-1 text-[11px] font-bold text-gray-800">
              Total: ₹{effectiveAmount} {isDfySelected ? "(One-Time Setup)" : "(Monthly Support)"}
            </span>
          </div>

          <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
            <QrCode className="h-3.5 w-3.5 text-primary" />
            Scan with GPay, PhonePe, Paytm, or BHIM
          </p>

          {/* UPI ID Row */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-border bg-muted/40">
            <div className="min-w-0 flex-1 pl-1">
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
              className="h-7 px-2 text-xs font-bold gap-1 shrink-0"
            >
              {copiedId ? (
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

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <a href={upiUri} className="w-full block">
              <Button className="w-full h-10 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs active:scale-[0.98]">
                <ExternalLink className="h-3.5 w-3.5" />
                Pay ₹{effectiveAmount} via UPI App
              </Button>
            </a>

            {isDfySelected && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hi Ravi & UniCRM team! I'm booking the 1-on-1 DFY Setup (₹1,000). Please share meeting slots.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <Button
                  variant="outline"
                  className="w-full h-9 text-xs font-bold gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  Schedule Setup on WhatsApp
                </Button>
              </a>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleConfirmPayment}
              className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-1" />
              I have already sent ₹{effectiveAmount}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UpiSupportBanner({ upiId }: { upiId?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
              <h4 className="font-bold text-sm text-foreground">Support DFY UniCRM</h4>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                From ₹29/mo
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              UniCRM is 100% free forever for all business owners. Support from ₹29/mo to keep servers free for everyone, or choose optional 1-on-1 DFY setup (₹1,000).
            </p>
          </div>

          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="shrink-0 font-bold bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Support &amp; DFY Setup (UPI)
          </Button>
        </div>
      </div>

      <UpiSupportDialog open={open} onOpenChange={setOpen} upiId={upiId} />
    </>
  );
}

export function UpiSupportCard({ upiId }: { upiId?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-auto mb-2 rounded-2xl border border-border bg-card p-3 text-xs space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
            <span>Support DFY UniCRM</span>
          </div>
          <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            From ₹29/mo
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Help keep UniCRM 100% free for everyone like you, or get our optional ₹1,000 DFY setup.
        </p>

        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="w-full h-8 font-bold text-xs gap-1.5"
        >
          <Sparkles className="h-3 w-3 text-amber-300" />
          Support &amp; DFY Setup
        </Button>
      </div>

      <UpiSupportDialog open={open} onOpenChange={setOpen} upiId={upiId} />
    </>
  );
}
