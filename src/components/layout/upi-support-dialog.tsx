"use client";

import { useState } from "react";
import { Heart, QrCode, Copy, Check, ExternalLink } from "lucide-react";
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

export function UpiSupportDialog({
  open,
  onOpenChange,
  upiId = process.env.NEXT_PUBLIC_UPI_ID || "9880238015@upi",
}: UpiSupportDialogProps) {
  const [copied, setCopied] = useState(false);

  const amount = "99";
  const note = "Support DFY UniCRM";
  const payeeName = "DFY UniCRM";
  
  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Heart className="h-6 w-6 fill-rose-500" />
          </div>
          <DialogTitle className="text-xl font-black">Support DFY UniCRM</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
            UniCRM is 100% free and open for everyone. Your voluntary ₹99 contribution helps keep our servers running!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-2 space-y-4">
          {/* Amount Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-bold">
            <span>Voluntary Support:</span>
            <span className="text-base font-black">₹99</span>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-border">
            <img
              src={qrUrl}
              alt="Scan to pay ₹99 via UPI"
              className="h-44 w-44 object-contain rounded-lg"
            />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <QrCode className="h-3.5 w-3.5" />
            Scan with Google Pay, PhonePe, Paytm, or BHIM
          </p>

          {/* UPI ID Row */}
          <div className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border bg-muted/40">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                UPI ID
              </p>
              <p className="text-xs font-mono font-bold truncate text-foreground">
                {upiId}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 px-2.5 text-xs font-bold gap-1 shrink-0"
            >
              {copied ? (
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

          {/* Direct UPI App intent button (Works directly on mobile) */}
          <a href={upiUri} className="w-full">
            <Button className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <ExternalLink className="h-4 w-4" />
              Pay ₹99 via UPI App
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UpiSupportCard({ upiId }: { upiId?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-auto mb-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          <span>Support DFY UniCRM</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          UniCRM is 100% free forever. Support our server and maintenance with a small ₹99 donation.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 text-white py-1.5 text-center text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
        >
          Pay ₹99 via UPI 🇮🇳
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
