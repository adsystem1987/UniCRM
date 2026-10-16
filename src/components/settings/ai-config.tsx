'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, CheckCircle2, Trash2, Eye, EyeOff, Zap, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { canEditSettings } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingsPanelHead } from './settings-panel-head';
import { AiKnowledgeCard } from './ai-knowledge';
import { AI_PROVIDER_DEFAULT_MODEL } from '@/lib/ai/defaults';
import type { AiProvider } from '@/lib/ai/types';
import type { AccountMember } from '@/types';
import { fetchAccountMembers, memberLabel } from '@/lib/account/members';
import { useTranslations } from 'next-intl';

const MASKED_KEY = '••••••••••••••••';

const BUILTIN_ROUTER_URL = process.env.NEXT_PUBLIC_AI_ROUTER_URL || 'https://omniroute.dfydude.online/v1';
const BUILTIN_ROUTER_KEY = 'sk-e7737b4e5f7146bd-c1f145-945a0bc2';
const BUILTIN_ROUTER_MODEL = process.env.NEXT_PUBLIC_AI_ROUTER_MODEL || 'auto/best-free';
const GEMINI_FREE_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
const GEMINI_FREE_MODEL = 'gemini-1.5-flash';

// Radix Select can't use an empty-string item value, so the "leave
// unassigned" choice gets a sentinel that maps to null in the payload.
const HANDOFF_QUEUE = '__queue__';

const PROVIDER_LABEL: Record<Exclude<AiProvider, 'openai_compatible'>, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
};

const KEY_PLACEHOLDER: Record<AiProvider, string> = {
  openai: 'sk-...',
  anthropic: 'sk-ant-...',
  openai_compatible: 'your-api-key',
};

type PresetMode = 'builtin' | 'gemini_free' | 'custom';

export function AiConfig() {
  const { accountId, accountRole, profileLoading } = useAuth();
  const canEdit = accountRole ? canEditSettings(accountRole) : false;
  const t = useTranslations('Settings.aiConfig');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [presetMode, setPresetMode] = useState<PresetMode>('builtin');
  const [showAdvancedBuiltin, setShowAdvancedBuiltin] = useState(false);

  const [configured, setConfigured] = useState(false);
  const [provider, setProvider] = useState<AiProvider>('openai_compatible');
  const [model, setModel] = useState(BUILTIN_ROUTER_MODEL);
  const [baseUrl, setBaseUrl] = useState(BUILTIN_ROUTER_URL);
  const [apiKey, setApiKey] = useState(BUILTIN_ROUTER_KEY);
  const [keyEdited, setKeyEdited] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [embeddingsKey, setEmbeddingsKey] = useState('');
  const [embeddingsKeyEdited, setEmbeddingsKeyEdited] = useState(false);
  const [hasStoredEmbeddingsKey, setHasStoredEmbeddingsKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [maxPerConversation, setMaxPerConversation] = useState(3);
  // Empty string = leave unassigned (shared queue).
  const [handoffAgentId, setHandoffAgentId] = useState('');
  const [members, setMembers] = useState<AccountMember[]>([]);

  // Guard keyed on the account (not a bare boolean) so an in-place
  // account switch — ownership transfer, multi-account membership —
  // refetches instead of showing the previous account's config. Mirrors
  // the loadedAccountIdRef pattern in whatsapp-config.tsx.
  const loadedAccountIdRef = useRef<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/config');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t('loadFailed'));
        return;
      }
      if (data.configured) {
        setConfigured(true);
        setProvider(data.provider);
        setModel(data.model);
        setBaseUrl(data.base_url ?? '');
        setSystemPrompt(data.system_prompt ?? '');
        setIsActive(data.is_active);
        setAutoReplyEnabled(data.auto_reply_enabled);
        setMaxPerConversation(data.auto_reply_max_per_conversation ?? 3);
        setHandoffAgentId(data.handoff_agent_id ?? '');
        setHasStoredKey(Boolean(data.has_key));
        setApiKey(data.has_key ? MASKED_KEY : '');
        setKeyEdited(false);
        setHasStoredEmbeddingsKey(Boolean(data.has_embeddings_key));
        setEmbeddingsKey(data.has_embeddings_key ? MASKED_KEY : '');
        setEmbeddingsKeyEdited(false);

        // Detect active preset mode
        if (data.base_url?.includes('localhost:21128') || data.base_url?.includes('omniroute')) {
          setPresetMode('builtin');
        } else if (data.base_url?.includes('generativelanguage.googleapis.com')) {
          setPresetMode('gemini_free');
        } else {
          setPresetMode('custom');
        }
      } else {
        // Default to UniCRM Smart Router with zero-setup built-in tier
        setPresetMode('builtin');
        setProvider('openai_compatible');
        setBaseUrl(BUILTIN_ROUTER_URL);
        setModel(BUILTIN_ROUTER_MODEL);
        setApiKey(BUILTIN_ROUTER_KEY);
        setKeyEdited(true);
        setIsActive(true);
      }
    } catch {
      toast.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBuiltinPreset = () => {
    setPresetMode('builtin');
    setProvider('openai_compatible');
    setBaseUrl(BUILTIN_ROUTER_URL);
    setModel(BUILTIN_ROUTER_MODEL);
    setApiKey(BUILTIN_ROUTER_KEY);
    setKeyEdited(true);
    setIsActive(true);
  };

  const selectGeminiPreset = () => {
    setPresetMode('gemini_free');
    setProvider('openai_compatible');
    setBaseUrl(GEMINI_FREE_BASE_URL);
    setModel(GEMINI_FREE_MODEL);
    if (apiKey === BUILTIN_ROUTER_KEY) {
      setApiKey('');
      setKeyEdited(false);
    }
    setIsActive(true);
  };

  const selectCustomPreset = () => {
    setPresetMode('custom');
    if (baseUrl === BUILTIN_ROUTER_URL || baseUrl.includes('generativelanguage')) {
      setBaseUrl('');
      setModel(AI_PROVIDER_DEFAULT_MODEL[provider]);
      if (apiKey === BUILTIN_ROUTER_KEY) {
        setApiKey('');
        setKeyEdited(false);
      }
    }
  };

  useEffect(() => {
    if (!accountId || loadedAccountIdRef.current === accountId) return;
    loadedAccountIdRef.current = accountId;
    void fetchConfig();
    // Members populate the handoff-target picker. Best-effort — on an
    // older deployment without the endpoint the picker just shows the
    // queue option.
    void fetchAccountMembers().then(setMembers);
  }, [accountId, fetchConfig]);

  // Swap the model default when the provider changes, unless the user
  // typed a custom model.
  const handleProviderChange = (next: AiProvider) => {
    setProvider(next);
    const isDefaultModel =
      model === AI_PROVIDER_DEFAULT_MODEL.openai ||
      model === AI_PROVIDER_DEFAULT_MODEL.anthropic ||
      model === AI_PROVIDER_DEFAULT_MODEL.openai_compatible ||
      model.trim() === '';
    if (isDefaultModel) setModel(next === 'openai_compatible' ? '' : AI_PROVIDER_DEFAULT_MODEL[next]);
  };

  const keyPayload = () => (keyEdited ? apiKey.trim() : undefined);

  // undefined = leave unchanged; '' typed = null (clear); text = set.
  const embeddingsKeyPayload = () =>
    embeddingsKeyEdited ? embeddingsKey.trim() || null : undefined;

  const buildBody = () => ({
    provider,
    model: model.trim(),
    base_url: provider === 'openai_compatible' ? baseUrl.trim() : null,
    api_key: keyPayload(),
    embeddings_api_key: embeddingsKeyPayload(),
    system_prompt: systemPrompt.trim() || null,
    is_active: isActive,
    auto_reply_enabled: autoReplyEnabled,
    auto_reply_max_per_conversation: maxPerConversation,
    handoff_agent_id: handoffAgentId || null,
  });

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model: model.trim(),
          base_url: provider === 'openai_compatible' ? baseUrl.trim() : null,
          api_key: keyPayload(),
        }),
      });
      const data = await res.json();
      if (res.ok) toast.success(t('testSuccess'));
      else toast.error(data.error ?? t('testRejected'));
    } catch {
      toast.error(t('testNetworkError'));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!model.trim()) {
      toast.error(t('missingModel'));
      return;
    }
    if (provider === 'openai_compatible' && !baseUrl.trim()) {
      toast.error(t('missingBaseUrl'));
      return;
    }
    if (!configured && !keyEdited) {
      toast.error(t('missingApiKey'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody()),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t('saveSuccess'));
        await fetchConfig();
      } else {
        toast.error(data.error ?? t('saveFailed'));
      }
    } catch {
      toast.error(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch('/api/ai/config', { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('removeSuccess'));
        setConfigured(false);
        setBaseUrl('');
        setHasStoredKey(false);
        setApiKey('');
        setKeyEdited(false);
        setIsActive(false);
        setAutoReplyEnabled(false);
        setSystemPrompt('');
        setHandoffAgentId('');
      } else {
        const data = await res.json();
        toast.error(data.error ?? t('removeFailed'));
      }
    } catch {
      toast.error(t('removeFailed'));
    } finally {
      setRemoving(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Loading AI configuration...
      </div>
    );
  }

  const disabled = !canEdit || saving;

  return (
    <div>
      <SettingsPanelHead
        title={t('title')}
        description={t('description')}
      />

      {!canEdit && (
        <p className="mb-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {t('adminOnlyConfig')}
        </p>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> {t('providerAndKey')}
            </CardTitle>
            <CardDescription>
              {t('encryptionNotice')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 3 Preset Modes */}
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Preset 1: Built-in Smart AI */}
              <button
                type="button"
                onClick={selectBuiltinPreset}
                disabled={disabled}
                className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                  presetMode === 'builtin'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border hover:border-border/80 bg-card hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    UniCRM Smart Router Pro
                  </span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pre-configured smart multi-model AI routing with zero setup. High-speed intelligent responses with no external API key needed.
                </p>
              </button>

              {/* Preset 2: Google Gemini Free */}
              <button
                type="button"
                onClick={selectGeminiPreset}
                disabled={disabled}
                className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                  presetMode === 'gemini_free'
                    ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-border hover:border-border/80 bg-card hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    Google Gemini Free
                  </span>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                    100% Free
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Official Google Gemini 1.5 Flash. 15 requests/min free with zero credit card required.
                </p>
              </button>

              {/* Preset 3: Custom / BYO Key */}
              <button
                type="button"
                onClick={selectCustomPreset}
                disabled={disabled}
                className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                  presetMode === 'custom'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                    : 'border-border hover:border-border/80 bg-card hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    Custom / BYO Key
                  </span>
                  <span className="rounded-full bg-muted border border-border px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
                    Custom
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Use your own OpenAI (GPT-4o), Anthropic Claude, or custom proxy endpoint.
                </p>
              </button>
            </div>

            {/* Mode 1: Built-in Smart Router View */}
            {presetMode === 'builtin' && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">UniCRM Smart Router Pro</h4>
                      <p className="text-[11px] text-muted-foreground">Auto / Best Model from Smart Router Pro</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    Active & Ready
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your AI assistant is connected to UniCRM&apos;s Smart Router Pro. Draft replies, lead qualification, and automated responses use intelligent multi-model routing with zero configuration.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTest}
                    disabled={disabled || testing}
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    Test Smart Router
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={disabled || saving}
                    className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Save & Activate Agent
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedBuiltin(!showAdvancedBuiltin)}
                    className="text-[11px] text-muted-foreground hover:text-foreground ml-auto underline decoration-dotted"
                  >
                    {showAdvancedBuiltin ? 'Hide Details' : 'Advanced Details'}
                  </button>
                </div>

                {showAdvancedBuiltin && (
                  <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-muted-foreground space-y-1">
                    <div>Routing Gateway: <code className="text-foreground">UniCRM Smart Router Pro</code></div>
                    <div>Model Engine: <code className="text-foreground">Auto / Best Model from Smart Router Pro</code></div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Google Gemini Free */}
            {presetMode === 'gemini_free' && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <Zap className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Google Gemini 1.5 Flash (100% Free Lifetime)</h4>
                      <p className="text-[11px] text-muted-foreground">Generous official Google AI Studio free tier</p>
                    </div>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Get Free Gemini Key ↗
                  </a>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 bg-background/50 p-3 rounded-lg border border-border/60">
                  <p className="font-semibold text-foreground">How to get your free key in 30 seconds:</p>
                  <p>1. Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a> (opens in new tab)</p>
                  <p>2. Sign in with any Google account & click <strong>Create API Key</strong></p>
                  <p>3. Paste your key below — 100% free with 15 requests/minute & zero credit card needed!</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="ai-key-gemini" className="text-xs font-medium">Google Gemini API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="ai-key-gemini"
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setKeyEdited(true);
                        }}
                        onFocus={() => {
                          if (!keyEdited && hasStoredKey) {
                            setApiKey('');
                            setKeyEdited(true);
                          }
                        }}
                        placeholder="AIzaSy... (Paste your Google Gemini API key)"
                        disabled={disabled}
                        autoComplete="off"
                        className="h-9 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTest}
                      disabled={disabled || testing}
                      className="h-9 text-xs font-semibold gap-1.5"
                    >
                      {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      Test
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={disabled || saving}
                      className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Save & Activate
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Custom BYO Form */}
            {presetMode === 'custom' && (
              <div className="space-y-4 pt-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('provider')}</Label>
                    <Select
                      value={provider}
                      onValueChange={(v) => handleProviderChange(v as AiProvider)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">{PROVIDER_LABEL.openai}</SelectItem>
                        <SelectItem value="anthropic">
                          {PROVIDER_LABEL.anthropic}
                        </SelectItem>
                        <SelectItem value="openai_compatible">
                          {t('providerOpenAiCompatible')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-model">{t('model')}</Label>
                    <Input
                      id="ai-model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={AI_PROVIDER_DEFAULT_MODEL[provider]}
                      disabled={disabled}
                    />
                  </div>

                  {provider === 'openai_compatible' && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="ai-base-url">{t('baseUrl')}</Label>
                      <Input
                        id="ai-base-url"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://api.your-provider.com/v1"
                        disabled={disabled}
                        autoComplete="off"
                      />
                      <p className="text-xs text-muted-foreground">{t('baseUrlHint')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-key">{t('apiKey')}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="ai-key"
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setKeyEdited(true);
                        }}
                        onFocus={() => {
                          if (!keyEdited && hasStoredKey) {
                            setApiKey('');
                            setKeyEdited(true);
                          }
                        }}
                        placeholder={KEY_PLACEHOLDER[provider]}
                        disabled={disabled}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleTest}
                      disabled={disabled || testing}
                    >
                      {testing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      {t('testKey')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Embeddings Key (always available at bottom of card) */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Label htmlFor="ai-embeddings-key">
                {t('embeddingsKey')}{' '}
                <span className="font-normal text-muted-foreground">
                  {t('optionalSemanticSearch')}
                </span>
              </Label>
              <Input
                id="ai-embeddings-key"
                type="password"
                value={embeddingsKey}
                onChange={(e) => {
                  setEmbeddingsKey(e.target.value);
                  setEmbeddingsKeyEdited(true);
                }}
                onFocus={() => {
                  if (!embeddingsKeyEdited && hasStoredEmbeddingsKey) {
                    setEmbeddingsKey('');
                    setEmbeddingsKeyEdited(true);
                  }
                }}
                placeholder="sk-... (OpenAI)"
                disabled={disabled}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                {t('embeddingsHint', {
                  sameKeyText: provider === 'openai' ? t('sameKeyText') : '',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('behaviour')}</CardTitle>
            <CardDescription>
              {t('behaviourDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">{t('businessContext')}</Label>
              <Textarea
                id="ai-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={t('promptPlaceholder')}
                rows={5}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t('enableAssistant')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('enableAssistantDesc')}
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t('autoReply')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('autoReplyDesc')}
                </p>
              </div>
              <Switch
                checked={autoReplyEnabled}
                onCheckedChange={setAutoReplyEnabled}
                disabled={disabled || !isActive}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="ai-max">{t('maxAutoReplies')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('maxAutoRepliesDesc')}
                </p>
              </div>
              <Input
                id="ai-max"
                type="number"
                min={1}
                max={20}
                value={maxPerConversation}
                onChange={(e) =>
                  setMaxPerConversation(
                    Math.min(20, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                disabled={disabled || !autoReplyEnabled}
                className="w-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-handoff">{t('handoffTo')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('handoffToDesc')}
              </p>
              <Select
                value={handoffAgentId || HANDOFF_QUEUE}
                onValueChange={(v) =>
                  setHandoffAgentId(!v || v === HANDOFF_QUEUE ? '' : v)
                }
                disabled={disabled || !autoReplyEnabled}
              >
                <SelectTrigger id="ai-handoff">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HANDOFF_QUEUE}>
                    {t('handoffQueue')}
                  </SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {memberLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <AiKnowledgeCard
          accountId={accountId}
          canEdit={canEdit}
          hasEmbeddingsKey={
            embeddingsKeyEdited
              ? embeddingsKey.trim().length > 0
              : hasStoredEmbeddingsKey
          }
        />

        <div className="flex items-center justify-between">
          {configured ? (
            <Button
              variant="ghost"
              onClick={handleRemove}
              disabled={!canEdit || removing}
              className="text-destructive hover:text-destructive"
            >
              {removing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t('remove')}
            </Button>
          ) : (
            <span />
          )}

          <Button onClick={handleSave} disabled={disabled}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
