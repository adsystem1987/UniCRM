'use client';

import { useState } from 'react';
import { Flame, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, Loader2, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CouncilMember {
  roaster: string;
  avatar: string;
  role: string;
  critique: string;
  score: number;
}

interface RoastResult {
  summary: string;
  overallScore: number;
  council: CouncilMember[];
  topActionItems: string[];
}

export function StrategyWarRoom() {
  const [proposal, setProposal] = useState('');
  const [category, setCategory] = useState<'campaign' | 'pricing' | 'whatsapp_copy'>('whatsapp_copy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);

  const sampleTemplates = [
    {
      title: 'WhatsApp Broadcast Offer',
      category: 'whatsapp_copy',
      text: 'Hey! We have a special festive sale: 30% discount on all digital marketing services if you pay today. Call us now or reply here!',
    },
    {
      title: 'High-Ticket Consultation',
      category: 'pricing',
      text: 'We are launching a 6-week business coaching program for ₹50,000 with weekly Zoom calls and WhatsApp Q&A support.',
    },
  ];

  const handleRoast = async () => {
    if (!proposal.trim() || proposal.trim().length < 10) {
      toast.error('Please enter at least a few sentences describing your strategy or copy.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/strategy-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal: proposal.trim(), category }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.data) {
        setResult(data.data);
        toast.success('Strategy roasted by the council!');
      } else {
        toast.error(data.error || 'Failed to roast proposal. Please verify your AI settings.');
      }
    } catch {
      toast.error('Network error during evaluation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-2xl border border-amber-500/30 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
            <Flame className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              The Strategy War Room & Roaster
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400">
                Multi-Agent Critique
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
              Stress-test your WhatsApp broadcast copy, pricing, or sales offers before sending them to real leads. Our 3-agent council pulls no punches.
            </p>
          </div>
        </div>
      </div>

      {/* Input Panel */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-foreground">
            What proposal, WhatsApp broadcast, or offer do you want to roast?
          </label>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setCategory('whatsapp_copy')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                category === 'whatsapp_copy' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              WhatsApp Copy
            </button>
            <button
              type="button"
              onClick={() => setCategory('pricing')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                category === 'pricing' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Pricing & Offers
            </button>
            <button
              type="button"
              onClick={() => setCategory('campaign')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                category === 'campaign' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              General Strategy
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder="Paste your WhatsApp broadcast message, pricing offer, or follow-up pitch here..."
          className="w-full text-xs bg-muted/40 border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Try sample:</span>
            {sampleTemplates.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProposal(item.text);
                  setCategory(item.category as any);
                }}
                className="hover:text-primary underline cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>

          <Button
            onClick={handleRoast}
            disabled={loading || !proposal.trim()}
            className="btn-gold-gradient font-bold h-9 px-5 rounded-full text-xs gap-1.5 shadow-sm"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Flame className="size-3.5" />}
            <span>{loading ? 'Council is Roasting...' : 'Convene Council & Roast'}</span>
          </Button>
        </div>
      </div>

      {/* Council Verdict Output */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Overall Score Banner */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Executive Verdict
              </span>
              <p className="text-sm font-semibold text-foreground">
                {result.summary}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-4 py-2 rounded-xl bg-muted/60 border border-border">
                <span className="block text-2xl font-black text-foreground">
                  {result.overallScore}<span className="text-xs text-muted-foreground font-normal">/100</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                  Readiness Score
                </span>
              </div>
            </div>
          </div>

          {/* Individual Roaster Perspectives */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.council.map((member, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2.5 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{member.avatar}</span>
                      <h4 className="text-xs font-bold text-foreground">{member.roaster}</h4>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                      {member.score}/100
                    </Badge>
                  </div>
                  <span className="text-[10px] text-primary font-medium block mb-2">
                    {member.role}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {member.critique}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Top Action Items to Fix */}
          {result.topActionItems && result.topActionItems.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2.5">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Council Recommendations Before Launching
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {result.topActionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
