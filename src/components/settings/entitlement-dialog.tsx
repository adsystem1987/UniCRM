'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Key,
  Calendar,
  CheckCircle2,
  Clock,
  Save,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface EntitlementData {
  id?: string;
  account_id: string;
  ai_pro_active: boolean;
  ai_pro_expires_at: string | null;
  ai_provider: string;
  ai_api_key_encrypted?: string;
  ai_model: string;
  lead_credits_balance: number;
  lead_scraper_token_encrypted?: string;
  lead_credits_total_granted: number;
  notes?: string;
}

interface EntitlementDialogProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
  accountName: string;
  ownerEmail: string;
}

export function EntitlementDialog({
  open,
  onClose,
  accountId,
  accountName,
  ownerEmail,
}: EntitlementDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<EntitlementData | null>(null);

  // Form states
  const [aiProActive, setAiProActive] = useState(false);
  const [aiMonthsToAdd, setAiMonthsToAdd] = useState<number>(0);
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState('omniroute');
  const [leadCreditsToAdd, setLeadCreditsToAdd] = useState<number>(0);
  const [leadScraperToken, setLeadScraperToken] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchEntitlements() {
      if (!open || !accountId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/entitlements?accountId=${accountId}`);
        const json = await res.json();
        if (json.entitlement) {
          setData(json.entitlement);
          setAiProActive(json.entitlement.ai_pro_active ?? false);
          setAiProvider(json.entitlement.ai_provider || 'omniroute');
          setNotes(json.entitlement.notes || '');
        } else {
          setData(null);
          setAiProActive(false);
          setAiProvider('omniroute');
          setNotes('');
        }
      } catch (err) {
        console.error('Failed to load entitlements:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEntitlements();
  }, [open, accountId]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/entitlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          aiProActive,
          aiMonthsToAdd: aiMonthsToAdd > 0 ? aiMonthsToAdd : undefined,
          aiApiKey: aiApiKey.trim() || undefined,
          aiProvider,
          leadCreditsToAdd: leadCreditsToAdd !== 0 ? leadCreditsToAdd : undefined,
          leadScraperToken: leadScraperToken.trim() || undefined,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update entitlements');

      toast.success(`Entitlements updated for ${accountName}`);
      setData(json.entitlement);
      setAiMonthsToAdd(0);
      setLeadCreditsToAdd(0);
      setAiApiKey('');
      setLeadScraperToken('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error updating entitlements');
    } finally {
      setSaving(false);
    }
  };

  const expiresDate = data?.ai_pro_expires_at ? new Date(data.ai_pro_expires_at) : null;
  const isExpired = expiresDate ? expiresDate < new Date() : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              Client Provisioning Desk
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Workspace: <strong className="text-foreground">{accountName}</strong> ({ownerEmail})
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="size-8">
            <X className="size-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="size-5 animate-spin" />
            <p className="text-xs">Fetching client entitlements...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Quick 1-Click Provisioning Preset for ₹1,000 3-Month Pro UniCRM */}
            <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-emerald-500" />
                    1-Click Bundle: 3-Month Pro UniCRM (₹1,000 Setup)
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Instantly activates AI Pro Squads (+3 Months) &amp; grants 1,000 Lead Finder credits.
                  </p>
                </div>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => {
                    setAiProActive(true);
                    setAiMonthsToAdd(3);
                    setLeadCreditsToAdd(1000);
                    toast.success('Applied 3-Month Pro UniCRM package preset! Click Save below to confirm.');
                  }}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-xs"
                >
                  Apply 3-Month Pro
                </Button>
              </div>
            </div>

            {/* 1. Smart AI Auto-Reply (3 Months Promotion / Paid) */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <Sparkles className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Smart AI Auto-Reply Access
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      {data?.ai_pro_active && expiresDate && !isExpired
                        ? `Active until ${expiresDate.toLocaleDateString()}`
                        : 'Inactive / Not Provisioned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {aiProActive ? 'Active' : 'Disabled'}
                  </span>
                  <Switch checked={aiProActive} onCheckedChange={setAiProActive} />
                </div>
              </div>

              {/* 1-Click +3 Months Button */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground">Quick Add Time:</span>
                <button
                  type="button"
                  onClick={() => setAiMonthsToAdd(3)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                    aiMonthsToAdd === 3
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  +3 Months (₹1,000 Setup Offer)
                </button>
                <button
                  type="button"
                  onClick={() => setAiMonthsToAdd(12)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                    aiMonthsToAdd === 12
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  +1 Year
                </button>
              </div>

              {/* Dedicated OmniRoute Key */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="size-3 text-muted-foreground" />
                    Dedicated OmniRoute / LLM API Key
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    Encrypted Backend
                  </span>
                </Label>
                <Input
                  type="password"
                  placeholder={data?.ai_api_key_encrypted ? '•••••••••••••••••••• (Active Dedicated Key)' : 'Paste dedicated OmniRoute API key (sk-...)'}
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  className="text-xs font-mono bg-background"
                />
                <p className="text-[10px] text-muted-foreground">
                  The client NEVER sees this key. It is strictly encrypted and used by UniCRM's AI router to power this client's WhatsApp auto-replies.
                </p>
              </div>
            </div>

            {/* 2. Smart Lead Discovery Credits */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <Target className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Smart Lead Discovery Credits
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Current Balance: {data?.lead_credits_balance || 0} credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Add Credits */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground">Add Pack:</span>
                <button
                  type="button"
                  onClick={() => setLeadCreditsToAdd(500)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                    leadCreditsToAdd === 500
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  +500 Credits (₹499)
                </button>
                <button
                  type="button"
                  onClick={() => setLeadCreditsToAdd(1000)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                    leadCreditsToAdd === 1000
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  +1,000 Credits (₹999)
                </button>
              </div>

              {/* Dedicated Scraper Runner Token */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="size-3 text-muted-foreground" />
                    Dedicated Scraper Token (e.g. Apify Token)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Per-Client Allocation
                  </span>
                </Label>
                <Input
                  type="password"
                  placeholder={data?.lead_scraper_token_encrypted ? '•••••••••••••••••••• (Configured Dedicated Token)' : 'Paste client Apify token (apify_api_...)'}
                  value={leadScraperToken}
                  onChange={(e) => setLeadScraperToken(e.target.value)}
                  className="text-xs font-mono bg-background"
                />
                <p className="text-[10px] text-muted-foreground">
                  When specified, all Lead Finder searches for this client will route directly through their dedicated runner token. If left blank, it falls back to the master shared pool.
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold">Admin Notes (Order reference / UTR)</Label>
              <Input
                placeholder="e.g. UPI Order #48291, paid ₹1,000 on 26 Oct"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs bg-background"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || loading}
            className="text-xs font-bold bg-primary text-primary-foreground gap-1.5"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save &amp; Activate Entitlements
          </Button>
        </div>
      </div>
    </div>
  );
}
