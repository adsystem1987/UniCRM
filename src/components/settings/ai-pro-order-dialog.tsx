"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  QrCode,
  Check,
  Copy,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  ExternalLink,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface AiProOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AiProOrderDialog({
  open,
  onOpenChange,
  onSuccess,
}: AiProOrderDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  const amount = 59;
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "ravibabuche@oksbi";
  const payeeName = "DFY UniCRM";
  const paymentNote = "UniCRM AI Smart Router Pro (1 Month)";

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappPhone.trim()) {
      toast.error("Please enter your WhatsApp number");
      return;
    }
    setQrLoaded(false);
    setStep(2);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: "UniCRM Smart Router Pro (Monthly Plan)",
          amount,
          whatsappPhone: whatsappPhone.trim(),
          utrNumber: utrNumber.trim() || null,
          orderType: "ai_subscription",
          parameters: {
            plan: "smart_router_pro",
            duration: "30_days",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record order");
      }

      onOpenChange(false);
      setStep(1);
      setUtrNumber("");
      toast.success(
        `Order ${data.orderNumber || ""} Received! We will verify your UPI payment of ₹59 (UTR: ${utrNumber || "N/A"}). Check "Orders & Billing" in Settings anytime.`,
        { duration: 10000 }
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setStep(1);
    }}>
      <DialogContent className="w-[95vw] sm:max-w-md bg-card border-border text-foreground p-4 sm:p-6 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold text-foreground truncate">
                {step === 1 ? "Unlock UniCRM Smart Router Pro" : `Complete Payment (₹${amount})`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                {step === 1 ? "Zero-configuration intelligent AI agent for ₹59/month" : "Direct UPI payment with 0% gateway charges"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 1 ? (
          /* STEP 1: PLAN DETAILS & WHATSAPP PHONE */
          <form onSubmit={handleProceedToPayment} className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Pro Plan Includes:</span>
                <span className="text-sm font-black text-primary">₹59 / month</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Auto / Best multi-LLM model routing</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>No personal OpenAI/Anthropic API keys required</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Automated WhatsApp reply drafting &amp; lead qualification</span>
                </li>
              </ul>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> Your WhatsApp Number (for Activation Confirmation)
              </Label>
              <Input
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="h-9 text-xs bg-muted"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-2"
            >
              <span>Continue to Payment (₹{amount})</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          /* STEP 2: FAST UPI CHECKOUT */
          <form onSubmit={handleSubmitOrder} className="space-y-3.5 pt-1">
            {/* Mobile 1-Tap UPI Intent Link */}
            <div className="block sm:hidden">
              <a
                href={upiUri}
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-98 transition-all"
              >
                <Smartphone className="h-4 w-4" />
                <span>Pay ₹{amount} via UPI App</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>
              <p className="text-[10px] text-center text-muted-foreground mt-1">
                Tap to launch Google Pay, PhonePe, Paytm, or CRED directly
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-white text-gray-900 shadow-xs relative">
              <div className="relative flex items-center justify-center min-h-[160px] w-full">
                <img
                  src={qrUrl}
                  alt={`Scan to pay ₹${amount}`}
                  onLoad={() => setQrLoaded(true)}
                  className={`h-36 w-36 sm:h-40 sm:w-40 object-contain rounded-lg transition-opacity duration-200 ${
                    qrLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
                {!qrLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-medium">Generating UPI QR...</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <span>Amount: ₹{amount}</span>
                <span className="text-gray-400">•</span>
                <span className="text-indigo-700">1 Month AI Pro Router</span>
              </div>
            </div>

            {/* Payee UPI ID */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">UPI ID</p>
                <p className="text-xs font-mono font-bold truncate text-foreground">{upiId}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyUpiId}
                className="h-7 px-2 text-xs font-semibold gap-1 shrink-0"
              >
                {copiedUpi ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copiedUpi ? "Copied" : "Copy"}
              </Button>
            </div>

            {/* Reference / UTR Number Input */}
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">UPI Reference / UTR Number (from payment screen)</Label>
              <Input
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="12-digit UTR (e.g. 428190281290)"
                className="h-8 text-xs bg-muted"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="h-10 text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-10 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs text-xs"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{submitting ? "Submitting..." : `Confirm Payment (₹${amount})`}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
