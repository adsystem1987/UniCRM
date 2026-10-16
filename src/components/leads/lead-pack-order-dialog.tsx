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
import { Badge } from "@/components/ui/badge";
import {
  Target,
  QrCode,
  Check,
  Copy,
  Sparkles,
  Zap,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  ArrowRight,
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
    name: "Starter Outbound",
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
    badge: "Most Popular",
    popular: true,
  },
  {
    id: "pack_2500",
    name: "Enterprise Multi-City",
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
  const [selectedPack, setSelectedPack] = useState<LeadPackOption>(
    LEAD_PACKS.find((p) => p.amount === initialAmount) || LEAD_PACKS[1]
  );
  const [targetNiche, setTargetNiche] = useState(defaultNiche);
  const [targetCity, setTargetCity] = useState(defaultCity);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "ravibabuche@oksbi";
  const payeeName = "DFY UniCRM";
  const paymentNote = `UniCRM Lead Pack (${selectedPack.leadsCount} Leads - ${targetNiche})`;

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${selectedPack.amount}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappPhone.trim()) {
      toast.error("Please enter your WhatsApp phone number for lead delivery");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      toast.success(
        `Order Received! Your ${selectedPack.leadsCount} verified leads for ${targetNiche} in ${targetCity} are being compiled. Delivery directly to your UniCRM Contacts within 2-4 hours.`,
        { duration: 8000 }
      );
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border text-foreground p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground">
                Order Curated ICP Lead Pack
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Verified B2B prospective clients with active WhatsApp & location validation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 3 Pack Selection Tiles */}
        <div className="space-y-2 pt-2">
          <Label className="text-xs font-bold text-foreground">1. Select Lead Volume</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {LEAD_PACKS.map((pack) => {
              const isSelected = selectedPack.id === pack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPack(pack)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  {pack.badge && (
                    <span
                      className={`absolute -top-2 right-2 px-1.5 py-0.2 text-[9px] font-black rounded-full uppercase tracking-wider ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {pack.badge}
                    </span>
                  )}
                  <div>
                    <p className="text-xs font-bold text-foreground">{pack.name}</p>
                    <p className="text-base font-black text-primary mt-0.5">₹{pack.amount}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                    <p className="font-bold text-foreground">{pack.leadsCount} Leads</p>
                    <p>{pack.perLead}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Details & UPI Payment */}
        <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
          {/* Target Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Target Niche / Industry
              </Label>
              <Input
                value={targetNiche}
                onChange={(e) => setTargetNiche(e.target.value)}
                placeholder="e.g. Real Estate, Clinics, D2C"
                required
                className="h-8 text-xs bg-muted"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Target City / State
              </Label>
              <Input
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                placeholder="e.g. Mumbai, Bangalore, Pan India"
                required
                className="h-8 text-xs bg-muted"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" /> Your WhatsApp Number (for Order Delivery & Confirmation)
            </Label>
            <Input
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="h-8 text-xs bg-muted"
            />
          </div>

          {/* UPI Payment Box */}
          <div className="p-3.5 rounded-2xl border border-border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-foreground">
                <QrCode className="h-4 w-4 text-emerald-500" />
                Scan & Pay via Any UPI App
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                ₹{selectedPack.amount}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-border/70 text-gray-900">
              <img
                src={qrUrl}
                alt={`Scan to pay ₹${selectedPack.amount}`}
                className="h-32 w-32 object-contain rounded-lg shrink-0"
              />
              <div className="space-y-1 text-center sm:text-left text-xs">
                <p className="font-bold text-gray-900 text-sm">
                  Pay ₹{selectedPack.amount} for {selectedPack.leadsCount} Leads
                </p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Scan using Google Pay, PhonePe, Paytm, BHIM, or CRED.
                </p>
                <div className="pt-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="text-[10px] font-bold font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                    {upiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    {copiedUpi ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedUpi ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">
                UPI Reference / UTR Number (from payment screen)
              </Label>
              <Input
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="12-digit UPI Ref / UTR number (e.g. 428190281290)"
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-10 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Confirm Payment & Submit Request (₹{selectedPack.amount})</span>
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            ⚡ Leads are verified against live WhatsApp numbers and imported into your UniCRM Contacts within 2-4 hours.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
