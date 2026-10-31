'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  QrCode, 
  UserPlus, 
  Users, 
  ChevronRight, 
  X,
  ArrowRight,
  Zap,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Step {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof QrCode;
  actionText: string;
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 'whatsapp',
    title: 'Connect WhatsApp (Free or Official)',
    description: 'Scan a QR code with your phone (Instant WhatsApp QR) or enter your Meta Cloud API keys.',
    href: '/settings?tab=whatsapp',
    icon: QrCode,
    actionText: 'Connect Channel',
  },
  {
    id: 'ai',
    title: 'Enable Free AI (Optional)',
    description: 'Activate free lifetime Google Gemini auto-replies and smart drafts in 1-click.',
    href: '/settings?tab=ai',
    icon: Sparkles,
    actionText: 'Activate AI',
  },
  {
    id: 'contact',
    title: 'Add or Import First Contact',
    description: 'Import existing customers via CSV or create a test contact to start messaging.',
    href: '/contacts',
    icon: UserPlus,
    actionText: 'Add Contact',
  },
  {
    id: 'team',
    title: 'Invite Your Team Members',
    description: 'Bring your agents and collaborators with role-based permissions.',
    href: '/settings?tab=members',
    icon: Users,
    actionText: 'Invite Staff',
  },
];

const STORAGE_KEY = 'unicrm_onboarding_dismissed';

export function OnboardingChecklist() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [deployingStarters, setDeployingStarters] = useState(false);
  const [startersDeployed, setStartersDeployed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setDismissed(isDismissed);

    // Read saved progress
    const saved = localStorage.getItem('unicrm_completed_steps');
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const handleDeployStarters = async () => {
    setDeployingStarters(true);
    try {
      const res = await fetch('/api/onboarding/deploy-starters', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deploy starter kit');
      }
      setStartersDeployed(true);
      toast.success(
        `DFY Starter Kit active! ${data.templatesSubmitted || 0} templates submitted to Meta, and ${data.automationsCreated || 0} drip automations ready.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error deploying starter kit');
    } finally {
      setDeployingStarters(false);
    }
  };

  const toggleStep = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = completedSteps.includes(id)
      ? completedSteps.filter((s) => s !== id)
      : [...completedSteps, id];
    setCompletedSteps(next);
    localStorage.setItem('unicrm_completed_steps', JSON.stringify(next));
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (dismissed) return null;

  const progressPercent = Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100);

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm animate-in-snappy">
      {/* Top Banner */}
      <div className="flex items-start justify-between border-b border-border/60 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h3 className="font-semibold text-base text-foreground">Welcome to UniCRM! Let's get you set up</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Complete these 4 simple steps to start messaging customers with zero platform fees.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-primary">{progressPercent}% Completed</span>
            <div className="mt-1 h-1.5 w-24 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss checklist"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Step items */}
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* 1-Click DFY Starter Banner */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-white">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </span>
              <h4 className="text-sm font-semibold text-foreground">
                Want a Done-For-You (DFY) Quickstart?
              </h4>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                1-Click Ready
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically submit 5 pre-approved WhatsApp message templates to Meta and activate instant lead drip automations for your account.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleDeployStarters}
            disabled={deployingStarters || startersDeployed}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all text-xs h-8"
          >
            {deployingStarters ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Setting Up...
              </>
            ) : startersDeployed ? (
              <>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                DFY Pack Active
              </>
            ) : (
              <>
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Deploy Starter Kit
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ONBOARDING_STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 pressable ${
                  isDone 
                    ? 'border-border/40 bg-muted/20 opacity-80' 
                    : 'border-border bg-card/80 hover:border-primary/40 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isDone ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h4 className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {step.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleStep(step.id, e)}
                      title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {step.actionText}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  {isDone && (
                    <span className="text-[11px] font-medium text-emerald-500">Done</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
