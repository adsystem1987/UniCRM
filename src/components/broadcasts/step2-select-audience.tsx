'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { countAudience } from '@/lib/broadcast-audience';
import { parseBroadcastCsv } from '@/lib/broadcast-csv';
import { CustomField, Tag } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Users,
  Tags,
  Filter,
  Upload,
  FileText,
  Loader2,
  ArrowRight,
  ArrowLeft,
  X,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

type AudienceType = 'all' | 'tags' | 'custom_field' | 'csv';
type CustomFieldOperator = 'is' | 'is_not' | 'contains';

interface CustomFieldFilter {
  fieldId: string;
  operator: CustomFieldOperator;
  value: string;
}

interface AudienceConfig {
  type: AudienceType;
  tagIds?: string[];
  customField?: CustomFieldFilter;
  csvContacts?: { phone: string; name?: string }[];
  excludeTagIds?: string[];
}

interface Step2Props {
  audience: AudienceConfig;
  onUpdate: (audience: AudienceConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2SelectAudience({
  audience,
  onUpdate,
  onNext,
  onBack,
}: Step2Props) {
  const t = useTranslations('Broadcasts.wizard');

  const OPERATOR_OPTIONS = useMemo<{ value: CustomFieldOperator; label: string }[]>(() => [
    { value: 'is', label: t('selectAudience.operatorIs') },
    { value: 'is_not', label: t('selectAudience.operatorIsNot') },
    { value: 'contains', label: t('selectAudience.operatorContains') },
  ], [t]);

  const audienceOptions = useMemo<{
    type: AudienceType;
    label: string;
    description: string;
    icon: typeof Users;
  }[]>(() => [
    {
      type: 'all',
      label: t('selectAudience.method.all'),
      description: t('selectAudience.allDescLoading'),
      icon: Users,
    },
    {
      type: 'tags',
      label: t('selectAudience.method.tags'),
      description: t('selectAudience.tagDesc'),
      icon: Tags,
    },
    {
      type: 'custom_field',
      label: t('selectAudience.method.customField'),
      description: t('selectAudience.customFieldDesc'),
      icon: Filter,
    },
    {
      type: 'csv',
      label: t('selectAudience.method.csv'),
      description: t('selectAudience.csvDesc'),
      icon: Upload,
    },
  ], [t]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  // The picked file's name, shown back to the user. The parsed rows
  // themselves live on `audience.csvContacts` (owned by the wizard) so
  // they survive stepping forward and back.
  const [pickedCsvName, setPickedCsvName] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const csvCount = audience.csvContacts?.length ?? 0;
  // Only meaningful while the rows it produced are still in play —
  // picking another audience type wipes `csvContacts`.
  const csvFileName = csvCount > 0 ? pickedCsvName : null;

  const [csvSource, setCsvSource] = useState<'upload' | 'sheets'>('upload');
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [userSheets, setUserSheets] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadSheets() {
      try {
        const res = await fetch('/api/integrations/google-sheets');
        const data = await res.json();
        if (data.connected && Array.isArray(data.sheets)) {
          setUserSheets(data.sheets);
        }
      } catch {
        // ignore
      }
    }
    loadSheets();
  }, []);

  const handleLoadGoogleSheet = async (urlOrId?: string) => {
    const target = urlOrId || sheetUrl;
    if (!target.trim()) {
      toast.error('Please enter a Google Sheet URL or select one from your Drive');
      return;
    }

    setSheetLoading(true);
    try {
      const res = await fetch('/api/integrations/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrlOrId: target.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to stream Google Sheet');
      }

      const result = parseBroadcastCsv(data.csvText);
      if (!result.ok) {
        toast.error(
          result.error === 'missing_phone_column'
            ? t('selectAudience.errorCsvMissingPhone')
            : t('selectAudience.errorCsvParse')
        );
        onUpdate({ ...audience, csvContacts: undefined });
        return;
      }

      if (result.invalid > 0) {
        toast.warning(t('selectAudience.csvInvalidPhones', { count: result.invalid }));
      }

      setPickedCsvName(`Google Sheet (${result.contacts.length} recipients)`);
      onUpdate({ ...audience, csvContacts: result.contacts });
      toast.success(`Loaded ${result.contacts.length} recipients directly from Google Sheet!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Google Sheet');
    } finally {
      setSheetLoading(false);
    }
  };

  // Tags are used both by the primary "Filter by Tags" audience type
  // AND by the exclude-list below — so always load once on mount.
  useEffect(() => {
    async function fetchTags() {
      setLoadingTags(true);
      try {
        const supabase = createClient();
        const { data } = await supabase.from('tags').select('*').order('name');
        setTags(data ?? []);
      } finally {
        setLoadingTags(false);
      }
    }
    fetchTags();
  }, []);

  // Lazy-load custom fields only when that audience type is active.
  useEffect(() => {
    if (audience.type !== 'custom_field') return;
    async function fetchFields() {
      setLoadingFields(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('custom_fields')
          .select('*')
          .order('field_name');
        setCustomFields(data ?? []);
      } finally {
        setLoadingFields(false);
      }
    }
    fetchFields();
  }, [audience.type]);

  const fetchEstimatedCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      setEstimatedCount(
        await countAudience(createClient(), {
          type: audience.type,
          tagIds: audience.tagIds,
          customField: audience.customField,
          csvContacts: audience.csvContacts,
          excludeTagIds: audience.excludeTagIds,
        }),
      );
    } catch {
      setEstimatedCount(null);
    } finally {
      setLoadingCount(false);
    }
  }, [
    audience.type,
    audience.tagIds,
    audience.customField,
    audience.csvContacts,
    audience.excludeTagIds,
  ]);

  useEffect(() => {
    fetchEstimatedCount();
  }, [fetchEstimatedCount]);

  async function handleCsvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 1 * 1024 * 1024) {
      const sizeMb = (selected.size / (1024 * 1024)).toFixed(2);
      toast.error(`CSV file exceeds 1 MB limit (${sizeMb} MB). Please upload a file under 1 MB.`);
      e.target.value = '';
      setPickedCsvName(null);
      return;
    }

    const result = parseBroadcastCsv(await selected.text());

    if (!result.ok) {
      toast.error(
        result.error === 'missing_phone_column'
          ? t('selectAudience.errorCsvMissingPhone')
          : t('selectAudience.errorCsvParse'),
      );
      // Clear the input so re-picking the same corrected file still
      // fires `change` (the browser suppresses it for an identical value).
      e.target.value = '';
      setPickedCsvName(null);
      onUpdate({ ...audience, csvContacts: undefined });
      return;
    }

    // Rows without a leading `+` and country code were refused (issue
    // #586). Say so, or a spreadsheet export that stripped the `+` looks
    // like a mysteriously smaller audience.
    if (result.invalid > 0) {
      toast.warning(
        t('selectAudience.csvInvalidPhones', { count: result.invalid }),
      );
    }

    setPickedCsvName(selected.name);
    onUpdate({ ...audience, csvContacts: result.contacts });
  }

  function toggleTag(tagId: string) {
    const current = audience.tagIds ?? [];
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    onUpdate({ ...audience, tagIds: updated });
  }

  function toggleExcludeTag(tagId: string) {
    const current = audience.excludeTagIds ?? [];
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    onUpdate({ ...audience, excludeTagIds: updated });
  }

  function updateCustomField(patch: Partial<CustomFieldFilter>) {
    const prev = audience.customField ?? {
      fieldId: '',
      operator: 'is' as CustomFieldOperator,
      value: '',
    };
    onUpdate({ ...audience, customField: { ...prev, ...patch } });
  }

  const isValid =
    audience.type === 'all' ||
    (audience.type === 'tags' && audience.tagIds && audience.tagIds.length > 0) ||
    (audience.type === 'custom_field' &&
      !!audience.customField?.fieldId &&
      audience.customField.value.length > 0) ||
    (audience.type === 'csv' &&
      audience.csvContacts &&
      audience.csvContacts.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('selectAudience.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('selectAudience.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {audienceOptions.map((option: { type: AudienceType; label: string; description: string; icon: typeof Users }) => {
          const isSelected = audience.type === option.type;
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              onClick={() =>
                onUpdate({
                  ...audience,
                  type: option.type,
                  // Wipe shape fields from other types to avoid stale
                  // config leaking across selections.
                  tagIds: option.type === 'tags' ? audience.tagIds : undefined,
                  customField:
                    option.type === 'custom_field'
                      ? audience.customField
                      : undefined,
                  csvContacts:
                    option.type === 'csv' ? audience.csvContacts : undefined,
                })
              }
              className={`group/card flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 active:translate-y-px ${
                isSelected
                  ? 'border-foreground bg-surface shadow-xs ring-1 ring-border'
                  : 'border-border bg-card hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-hover/40'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-surface border-border text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {audience.type === 'tags' && (
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <p className="mb-3 text-sm font-medium text-foreground">{t('selectAudience.selectTags')}</p>
          {loadingTags ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : tags.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t('selectAudience.noTagsFound')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = audience.tagIds?.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-muted text-muted-foreground hover:border-border'
                    }`}
                  >
                    <span
                      className="mr-1.5 h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {audience.type === 'custom_field' && (
        <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4">
          <p className="text-sm font-medium text-foreground">{t('selectAudience.method.customField')}</p>
          {loadingFields ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : customFields.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t('selectAudience.errorLoadFields')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)]">
              <select
                value={audience.customField?.fieldId ?? ''}
                onChange={(e) => updateCustomField({ fieldId: e.target.value })}
                className="h-9 rounded-lg border border-border bg-muted px-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">{t('selectAudience.selectField')}</option>
                {customFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.field_name}
                  </option>
                ))}
              </select>
              <select
                value={audience.customField?.operator ?? 'is'}
                onChange={(e) =>
                  updateCustomField({
                    operator: e.target.value as CustomFieldOperator,
                  })
                }
                className="h-9 rounded-lg border border-border bg-muted px-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {OPERATOR_OPTIONS.map((op: { value: CustomFieldOperator; label: string }) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={audience.customField?.value ?? ''}
                onChange={(e) => updateCustomField({ value: e.target.value })}
                placeholder={t('selectAudience.valuePlaceholder')}
                className="h-9 rounded-lg border border-border bg-muted px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>
      )}

      {audience.type === 'csv' && (
        <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              External Audience (Zero Server Storage)
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Broadcast directly to contacts from a CSV or Google Sheet without storing them in the CRM database.
            </p>
          </div>

          {/* Switcher: File Upload vs Google Sheet */}
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <button
              type="button"
              onClick={() => setCsvSource('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                csvSource === 'upload'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Upload className="size-3.5" />
              Upload CSV File
            </button>
            <button
              type="button"
              onClick={() => setCsvSource('sheets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                csvSource === 'sheets'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <FileSpreadsheet className="size-3.5" />
              Stream from Google Sheet
              <span className="text-[10px] bg-emerald-500/20 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                BYOS
              </span>
            </button>
          </div>

          {csvSource === 'sheets' ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="size-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-foreground">1-Click Google Sheet Broadcast</h5>
                  <p className="text-[11px] text-muted-foreground">
                    Streams recipients directly from your Google Drive into memory. 0 contacts saved in database.
                  </p>
                </div>
              </div>

              {userSheets.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Pick a Sheet from your Google Drive:
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setSheetUrl(e.target.value);
                        handleLoadGoogleSheet(e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="w-full h-8 text-xs bg-muted/60 rounded-lg px-2.5 border border-border text-foreground"
                  >
                    <option value="" disabled>
                      -- Select from your Google Drive Spreadsheets --
                    </option>
                    {userSheets.map((s) => (
                      <option key={s.id} value={s.id}>
                        📄 {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Or paste Google Sheet Link:
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={sheetLoading || !sheetUrl.trim()}
                    onClick={() => handleLoadGoogleSheet()}
                    className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  >
                    {sheetLoading ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="size-3.5" />
                    )}
                    Load Sheet
                  </Button>
                </div>
              </div>

              {csvCount > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <span className="font-semibold">✓ {csvFileName}</span>
                  <span className="font-bold">{csvCount.toLocaleString()} recipients loaded</span>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className="group flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground">
                {csvFileName ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <p className="text-sm text-foreground">
                {csvFileName ?? t('selectAudience.uploadCsv')}
              </p>
              {csvCount > 0 && (
                <p className="text-xs text-primary font-bold">
                  {t('selectAudience.csvContactsFound', { count: csvCount })}
                </p>
              )}
              <span className="text-[10px] text-muted-foreground">
                Max 1 MB file size
              </span>
            </button>
          )}

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvChange}
            className="hidden"
          />
        </div>
      )}

      {/* Exclude list — applies regardless of audience type */}
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <X className="h-4 w-4 text-red-400" />
          <p className="text-sm font-medium text-foreground">
            {t('selectAudience.excludeTags')}
          </p>
        </div>
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t('selectAudience.noTagsFound')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isExcluded = audience.excludeTagIds?.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleExcludeTag(tag.id)}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    isExcluded
                      ? 'border-red-500/30 bg-red-500/10 text-red-300'
                      : 'border-border bg-muted text-muted-foreground hover:border-border'
                  }`}
                >
                  <span
                    className="mr-1.5 h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Audience Summary */}
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <p className="mb-2 text-sm font-medium text-foreground">{t('selectAudience.audienceSummary')}</p>
        {loadingCount ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">{t('selectAudience.calculating')}</span>
          </div>
        ) : estimatedCount !== null ? (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">
              {estimatedCount.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">{t('selectAudience.estimatedRecipients')}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t('selectAudience.selectTypeForEstimate')}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-border text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {t('next')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
