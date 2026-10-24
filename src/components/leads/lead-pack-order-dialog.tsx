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
  Target,
  QrCode,
  Check,
  Copy,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface LeadPackOption {
  id: string;
  name: string;
  amount: number;
  leadsCount: number;
  perLead: string;
  badge?: string;
  popular?: boolean;
}

const LEAD_PACKS: LeadPackOption[] = [
  {
    id: "pack_250",
    name: "Starter",
    amount: 499,
    leadsCount: 250,
    perLead: "₹1.99 / lead",
  },
  {
    id: "pack_1000",
    name: "Growth Batch",
    amount: 999,
    leadsCount: 1000,
    perLead: "₹0.99 / lead",
    badge: "Popular",
    popular: true,
  },
  {
    id: "pack_2500",
    name: "Scale Batch",
    amount: 1999,
    leadsCount: 2500,
    perLead: "₹0.79 / lead",
    badge: "Best Value",
  },
];

interface LeadPackOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultNiche?: string;
  defaultCity?: string;
  initialAmount?: number;
}

export function LeadPackOrderDialog({
  open,
  onOpenChange,
  defaultNiche = "Real Estate",
  defaultCity = "All India",
  initialAmount = 999,
}: LeadPackOrderDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPack, setSelectedPack] = useState<LeadPackOption>(
    LEAD_PACKS.find((p) => p.amount === initialAmount) || LEAD_PACKS[1]
  );
  const [targetNiche, setTargetNiche] = useState(defaultNiche);
  const [targetCity, setTargetCity] = useState(defaultCity);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "ravibabuche@oksbi";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "UniCRM";
  const paymentNote = `UniCRM Lead Pack (${selectedPack.leadsCount} Leads - ${targetNiche})`;

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${selectedPack.amount}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;
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
      toast.error("Please enter your WhatsApp number for order delivery");
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
          itemName: `${selectedPack.name} (${selectedPack.leadsCount} Leads)`,
          amount: selectedPack.amount,
          whatsappPhone: whatsappPhone.trim(),
          utrNumber: utrNumber.trim() || null,
          orderType: "lead_pack",
          parameters: {
            niche: targetNiche.trim(),
            city: targetCity.trim(),
            leadsCount: selectedPack.leadsCount,
            packId: selectedPack.id,
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
        `Order ${data.orderNumber || ""} Received! We will verify your UPI payment (UTR: ${utrNumber || "N/A"}) and deliver your ${selectedPack.leadsCount} verified leads into UniCRM Contacts within 2-4 hours. Check "Orders & Billing" in Settings anytime.`,
        { duration: 10000 }
      );
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
              <Target className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold text-foreground truncate">
                {step === 1 ? "Curated ICP Lead Pack" : `Complete Payment (₹${selectedPack.amount})`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                {step === 1 ? "Verified prospective customers with active WhatsApp" : `${selectedPack.leadsCount} Verified Leads for ${targetNiche}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 1 ? (
          /* STEP 1: CONFIGURE PACK & TARGETING */
          <form onSubmit={handleProceedToPayment} className="space-y-4 pt-1">
            {/* Lead Pack Options */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Select Volume</Label>
              <div className="grid grid-cols-3 gap-2">
                {LEAD_PACKS.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all relative ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      {pack.badge && (
                        <span
                          className={`absolute -top-1.5 right-1.5 px-1.5 py-0.2 text-[8px] font-black rounded-full uppercase tracking-wider ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {pack.badge}
                        </span>
                      )}
                      <div>
                        <p className="text-[11px] font-bold text-foreground leading-tight">{pack.name}</p>
                        <p className="text-sm font-black text-primary mt-0.5">₹{pack.amount}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">
                        {pack.leadsCount} Leads
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Parameters */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Niche / Industry
                  </Label>
                  <Input
                    value={targetNiche}
                    onChange={(e) => setTargetNiche(e.target.value)}
                    placeholder="e.g. Real Estate"
                    required
                    className="h-9 text-xs bg-muted"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Target City
                  </Label>
                  <Input
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    required
                    className="h-9 text-xs bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Your WhatsApp Number (for Order Delivery)
                </Label>
                <Input
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="h-9 text-xs bg-muted"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-2"
            >
              <span>Continue to Payment (₹{selectedPack.amount})</span>
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
                <span>Pay ₹{selectedPack.amount} via UPI App</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>
              <p className="text-[10px] text-center text-muted-foreground mt-1">
                Tap to launch Google Pay, PhonePe, Paytm, or CRED directly
              </p>
            </div>

            {/* QR Code Container (Desktop & Secondary on Mobile) */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-white text-gray-900 shadow-xs relative">
              <div className="relative flex items-center justify-center min-h-[160px] w-full">
                <img
                  src={qrUrl}
                  alt={`Scan to pay ₹${selectedPack.amount}`}
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
                <span>Amount: ₹{selectedPack.amount}</span>
                <span className="text-gray-400">•</span>
                <span className="text-emerald-700">{selectedPack.leadsCount} Leads</span>
              </div>
            </div>

            {/* Payee UPI ID with 1-Click Copy */}
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
                <span>{submitting ? "Submitting..." : `Confirm Payment (₹${selectedPack.amount})`}</span>
              </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground leading-tight">
              ⚡ Delivered into your UniCRM Contacts within 2-4 hours.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
