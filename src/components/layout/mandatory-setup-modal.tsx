"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Database,
  HardDrive,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Headphones,
  Copy,
  Check,
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
import { UpiSupportDialog } from "@/components/layout/upi-support-dialog";

interface MandatorySetupModalProps {
  open: boolean;
  googleDriveConnected: boolean;
  supabaseConnected: boolean;
  onRefresh: () => void;
}

export function MandatorySetupModal({
  open,
  googleDriveConnected,
  supabaseConnected,
  onRefresh,
}: MandatorySetupModalProps) {
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          className="w-full sm:max-w-xl p-6 bg-card border-border shadow-2xl [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Action Required: Connect Storage &amp; Database
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              To ensure <strong>100% data ownership</strong>, zero vendor lock-in, and reliable performance, UniCRM requires connecting your own free Google Drive and Supabase database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            {/* Step 1: Google Drive */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                googleDriveConnected
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      googleDriveConnected
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Step 1: Connect Google Drive (Storage)
                      </span>
                      {googleDriveConnected && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Stores client WhatsApp voice notes, media, and attachments in your free Google Drive (15 GB).
                    </p>
                  </div>
                </div>

                {!googleDriveConnected && (
                  <Link href="/settings?tab=integrations">
                    <Button size="sm" variant="outline" className="text-xs font-bold h-8">
                      Connect Drive <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Step 2: Supabase BYOD */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                supabaseConnected
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      supabaseConnected
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-indigo-500/10 text-indigo-500"
                    }`}
                  >
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Step 2: Connect Personal Supabase (Database)
                      </span>
                      {supabaseConnected && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Connect your free Supabase PostgreSQL project. Keeps your contact lists, messages, and leads 100% private to you.
                    </p>
                  </div>
                </div>

                {!supabaseConnected && (
                  <Link href="/settings?tab=integrations">
                    <Button size="sm" variant="outline" className="text-xs font-bold h-8">
                      Connect DB <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* DFY Assistance Banner (₹1,000 One-time Setup) */}
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-amber-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-foreground">
                    Need Help? Get 1-on-1 DFY Setup
                  </span>
                </div>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  ₹1,000 One-Time
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Don’t have time or technical knowledge? Our engineers will join you on Google Meet and complete your Google Drive + Supabase + WhatsApp setup for you.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hi Ravi & UniCRM team! I want assistance with the One-Time DFY Technical Setup (₹1,000) for Google Drive + Supabase Database.\n\nMy Business Name:\nEmail:`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="sm"
                    className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs h-8 gap-1.5 shadow-xs"
                  >
                    <Headphones className="h-3.5 w-3.5" />
                    Contact Support for ₹1,000 Setup
                  </Button>
                </a>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRefresh}
                  className="text-xs text-muted-foreground hover:text-foreground h-8"
                >
                  Check Status Again
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UpiSupportDialog
        open={supportDialogOpen}
        onOpenChange={setSupportDialogOpen}
        preselectedTab="dfy"
      />
    </>
  );
}
