'use client';

import { useEffect, useState } from 'react';
import { countAudience, type AudienceConfig } from '@/lib/broadcast-audience';
import { createClient } from '@/lib/supabase/client';
import { MessageTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
import { ArrowLeft, Send, Loader2, Users, Save, ShieldCheck, Zap, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ThrottleConfig } from '@/hooks/use-broadcast-sending';

interface Step4Props {
  name: string;
  onNameChange: (name: string) => void;
  template: MessageTemplate;
  audience: AudienceConfig;
  throttle: ThrottleConfig;
  onThrottleChange: (throttle: ThrottleConfig) => void;
  onSend: () => void;
  onSaveDraft?: () => void;
  onBack: () => void;
  isProcessing: boolean;
  progress: number;
}

function getEstimatedTime(reach: number, throttle: ThrottleConfig): string {
  if (reach <= 0) return '0 sec';
  const avgDelayMs = (throttle.minDelayMs + throttle.maxDelayMs) / 2;
  const batches = Math.ceil(reach / throttle.batchSize);
  const totalSeconds = Math.ceil((batches * avgDelayMs) / 1000);
  if (totalSeconds < 60) return `~${totalSeconds} sec`;
  const minutes = Math.ceil(totalSeconds / 60);
  if (minutes < 60) return `~${minutes} min${minutes > 1 ? 's' : ''}`;
  const hours = (totalSeconds / 3600).toFixed(1);
  return `~${hours} hrs`;
}

export function Step4ScheduleSend({
  name,
  onNameChange,
  template,
  audience,
  throttle,
  onThrottleChange,
  onSend,
  onSaveDraft,
  onBack,
  isProcessing,
  progress,
}: Step4Props) {
  const t = useTranslations('Broadcasts.wizard');
  const [showConfirm, setShowConfirm] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState<number>(0);
  const [loadingReach, setLoadingReach] = useState(true);

  useEffect(() => {
    async function calculateReach() {
      setLoadingReach(true);
      try {
        setEstimatedReach((await countAudience(createClient(), audience)) ?? 0);
      } catch {
        setEstimatedReach(0);
      } finally {
        setLoadingReach(false);
      }
    }

    calculateReach();
  }, [audience]);

  const audienceLabel =
    audience.type === 'all'
      ? t('scheduleSend.audienceAll')
      : audience.type === 'tags'
        ? t('scheduleSend.audienceTags')
        : audience.type === 'csv'
          ? t('scheduleSend.audienceCsv')
          : t('scheduleSend.audienceField');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('scheduleSend.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('scheduleSend.subtitle')}
        </p>
      </div>

      {/* Broadcast Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t('scheduleSend.broadcastName')}</label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('scheduleSend.broadcastNamePlaceholder')}
          className="border-border bg-muted text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Summary Card */}
      <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">{t('scheduleSend.summary')}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">{t('scheduleSend.template')}</p>
            <p className="text-foreground">{template.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('scheduleSend.audience')}</p>
            <p className="text-foreground">{audienceLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('scheduleSend.estimatedReach')}</p>
            <div className="flex items-center gap-1.5">
              {loadingReach ? (
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              ) : (
                <>
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <p className="font-medium text-foreground">{estimatedReach.toLocaleString()}</p>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('scheduleSend.language')}</p>
            <p className="text-foreground">{template.language ?? 'en_US'}</p>
          </div>
        </div>
      </div>

      {/* Anti-Ban & Delivery Speed Card */}
      <div className="rounded-xl border border-border bg-card/50 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-medium text-foreground">Anti-Ban Pacing & Delivery Rate</p>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            Est. completion: <strong className="text-foreground">{getEstimatedTime(estimatedReach, throttle)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Standard */}
          <button
            type="button"
            onClick={() =>
              onThrottleChange({
                mode: 'standard',
                minDelayMs: 1000,
                maxDelayMs: 2000,
                batchSize: 10,
              })
            }
            className={cn(
              'flex flex-col items-start rounded-lg border p-3 text-left transition-all',
              throttle.mode === 'standard'
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-muted'
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Standard
              </span>
              <span className="text-[10px] text-muted-foreground">1-2s delay</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Fast batching. Recommended for official Meta Cloud API WABA numbers.
            </p>
          </button>

          {/* Safe Mode */}
          <button
            type="button"
            onClick={() =>
              onThrottleChange({
                mode: 'safe',
                minDelayMs: 4000,
                maxDelayMs: 8000,
                batchSize: 1,
              })
            }
            className={cn(
              'flex flex-col items-start rounded-lg border p-3 text-left transition-all',
              throttle.mode === 'safe'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-emerald-500/40 hover:bg-muted'
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Safe Mode (Recommended)
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">4-8s jitter</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Random human delay. Protects against bans on WhatsApp Web / Evolution QR.
            </p>
          </button>

          {/* Ultra Safe */}
          <button
            type="button"
            onClick={() =>
              onThrottleChange({
                mode: 'ultra_safe',
                minDelayMs: 12000,
                maxDelayMs: 25000,
                batchSize: 1,
              })
            }
            className={cn(
              'flex flex-col items-start rounded-lg border p-3 text-left transition-all',
              throttle.mode === 'ultra_safe'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-sm'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-cyan-500/40 hover:bg-muted'
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                Ultra Safe
              </span>
              <span className="text-[10px] text-cyan-400 font-medium">12-25s delay</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Deep pacing for newly paired numbers or cold contact lists.
            </p>
          </button>
        </div>
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">{t('scheduleSend.sending')}</p>
            </div>
            <span className="text-xs font-medium text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="border-border text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Button>

        <div className="flex items-center gap-2">
          {onSaveDraft && (
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={!name.trim() || isProcessing}
              className="border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {t('scheduleSend.saveDraft')}
            </Button>
          )}

          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogTrigger
            render={
              <Button
                disabled={!name.trim() || isProcessing}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              />
            }
          >
            <Send className="h-4 w-4" />
            {t('scheduleSend.sendNow')}
          </DialogTrigger>
          <DialogContent className="border-border bg-popover sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-popover-foreground">{t('scheduleSend.confirmTitle')}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t.rich('scheduleSend.confirmDesc', {
                  count: estimatedReach,
                  template: template.name,
                  b: (chunks) => (
                    <span className="font-medium text-popover-foreground">{chunks}</span>
                  ),
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="border-border text-muted-foreground"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => {
                  setShowConfirm(false);
                  onSend();
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                {t('scheduleSend.sendNow')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}
