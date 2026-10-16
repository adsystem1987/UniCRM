'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  dedupeByPhone,
  isUniqueViolation,
  normalizeKey,
} from '@/lib/contacts/dedupe';
import {
  parseContactCsv,
  type ParsedContactRow,
} from '@/lib/contacts/parse-contact-csv';
import {
  assignImportedContactTags,
  resolveImportTagIds,
  type ContactTagAssignment,
} from '@/lib/contacts/resolve-import-tags';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Tag,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const DEFAULT_TAG_COLOR = '#3b82f6';
const PREVIEW_LIMIT = 5;
export const MAX_IMPORT_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB free tier safety limit
export const MAX_IMPORT_ROWS_PER_BATCH = 5000; // 5,000 contacts per batch limit

function truncateFilename(name: string, max = 48): string {
  if (name.length <= max) return name;
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const base = name.slice(0, name.length - ext.length);
  const keep = max - ext.length - 1;
  return `${base.slice(0, Math.max(keep, 12))}…${ext}`;
}

function PreviewCell({
  value,
  mono,
  maxWidth = 'max-w-[9rem]',
}: {
  value: string;
  mono?: boolean;
  maxWidth?: string;
}) {
  return (
    <span
      className={cn(
        'block truncate',
        maxWidth,
        mono && 'font-mono text-[11px]'
      )}
      title={value}
    >
      {value}
    </span>
  );
}

function ImportPreviewTags({
  tagNames,
  tagColorByKey,
}: {
  tagNames: string[];
  tagColorByKey: Map<string, string>;
}) {
  const t = useTranslations('Contacts.importModal');

  if (tagNames.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex min-w-[4.5rem] flex-wrap gap-1">
      {tagNames.map((name) => {
        const color =
          tagColorByKey.get(name.trim().toLowerCase()) ?? DEFAULT_TAG_COLOR;
        const isKnown = tagColorByKey.has(name.trim().toLowerCase());
        return (
          <span
            key={name}
            className="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] leading-none font-medium"
            style={{
              backgroundColor: `${color}18`,
              color,
              border: `1px solid ${color}${isKnown ? '55' : '30'}`,
            }}
            title={isKnown ? name : t('willBeCreated', { name })}
          >
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="truncate">{name}</span>
          </span>
        );
      })}
    </div>
  );
}

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export function ImportModal({
  open,
  onOpenChange,
  onImported,
}: ImportModalProps) {
  const t = useTranslations('Contacts.importModal');
  const supabase = createClient();
  const { accountId, canEditSettings } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedContactRow[]>([]);
  const [hasTagsColumn, setHasTagsColumn] = useState(false);
  const [hasCompanyColumn, setHasCompanyColumn] = useState(false);
  const [tagColorByKey, setTagColorByKey] = useState<Map<string, string>>(
    new Map()
  );
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    invalidPhone: number;
    failed: number;
    failedDetails: { phone: string; name?: string; reason: string }[];
    tagsAssigned: number;
  } | null>(null);

  const [importSource, setImportSource] = useState<'csv' | 'sheets'>('csv');
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [userSheets, setUserSheets] = useState<{ id: string; name: string }[]>([]);
  const [driveConnected, setDriveConnected] = useState(false);

  const fetchUserSheets = async () => {
    try {
      const res = await fetch('/api/integrations/google-sheets');
      const data = await res.json();
      if (data.connected && Array.isArray(data.sheets)) {
        setDriveConnected(true);
        setUserSheets(data.sheets);
      } else {
        setDriveConnected(false);
      }
    } catch {
      setDriveConnected(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUserSheets();
    }
  }, [open]);

  const handleLoadGoogleSheet = async (urlOrIdToLoad?: string) => {
    const target = urlOrIdToLoad || sheetUrl;
    if (!target.trim()) {
      toast.error('Please enter a Google Sheet URL or select one from your Drive');
      return;
    }

    setSheetLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/integrations/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrlOrId: target.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Google Sheet');
      }

      const {
        rows,
        hasTagsColumn: csvHasTags,
        hasCompanyColumn: csvHasCompany,
      } = parseContactCsv(data.csvText);

      if (rows.length === 0) {
        toast.error('No contacts with a valid "phone" column found in this Google Sheet.');
        setParsedRows([]);
        return;
      }

      if (rows.length > MAX_IMPORT_ROWS_PER_BATCH) {
        toast.error(
          `Sheet contains ${rows.length.toLocaleString()} contacts, which exceeds the limit of ${MAX_IMPORT_ROWS_PER_BATCH.toLocaleString()} contacts per batch. Please upload in smaller batches.`
        );
        setParsedRows([]);
        return;
      }

      setFile(new File([data.csvText], 'GoogleSheet_Live_Stream.csv', { type: 'text/csv' }));
      setParsedRows(rows);
      setHasTagsColumn(csvHasTags);
      setHasCompanyColumn(csvHasCompany);
      toast.success(`Successfully loaded ${rows.length.toLocaleString()} contacts from Google Sheet!`);

      if (csvHasTags && accountId) {
        const { data: tags } = await supabase
          .from('tags')
          .select('name, color')
          .eq('account_id', accountId);

        const colors = new Map<string, string>();
        for (const tag of tags ?? []) {
          const key = tag.name.trim().toLowerCase();
          if (!colors.has(key)) colors.set(key, tag.color);
        }
        setTagColorByKey(colors);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load Google Sheet';
      toast.error(msg);
    } finally {
      setSheetLoading(false);
    }
  };

  function reset() {
    setFile(null);
    setParsedRows([]);
    setHasTagsColumn(false);
    setHasCompanyColumn(false);
    setTagColorByKey(new Map());
    setResult(null);
    setSheetUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      const sizeMb = (selected.size / (1024 * 1024)).toFixed(2);
      toast.error(
        `File exceeds 1 MB free tier limit (${sizeMb} MB). Please split your CSV into smaller batches of up to 5,000 contacts.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
      setParsedRows([]);
      return;
    }

    setFile(selected);
    setResult(null);

    const text = await selected.text();
    const {
      rows,
      hasTagsColumn: csvHasTags,
      hasCompanyColumn: csvHasCompany,
    } = parseContactCsv(text);

    if (rows.length === 0) {
      toast.error(t('toastNoValidRows'));
      setParsedRows([]);
      setHasTagsColumn(false);
      setHasCompanyColumn(false);
      setTagColorByKey(new Map());
      return;
    }

    if (rows.length > MAX_IMPORT_ROWS_PER_BATCH) {
      toast.error(
        `File contains ${rows.length.toLocaleString()} contacts, which exceeds the limit of ${MAX_IMPORT_ROWS_PER_BATCH.toLocaleString()} contacts per batch. Please upload in smaller batches.`
      );
      setFile(null);
      setParsedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setParsedRows(rows);
    setHasTagsColumn(csvHasTags);
    setHasCompanyColumn(csvHasCompany);

    if (csvHasTags && accountId) {
      const { data: tags } = await supabase
        .from('tags')
        .select('name, color')
        .eq('account_id', accountId);

      const colors = new Map<string, string>();
      for (const tag of tags ?? []) {
        const key = tag.name.trim().toLowerCase();
        if (!colors.has(key)) colors.set(key, tag.color);
      }
      setTagColorByKey(colors);
    } else {
      setTagColorByKey(new Map());
    }
  }

  async function handleImport() {
    if (parsedRows.length === 0) return;
    setImporting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error(t('notAuthenticated'));
      if (!accountId)
        throw new Error(t('notLinkedToAccount'));

      let imported = 0;
      let skipped = 0;
      let failed = 0;
      const failedDetails: { phone: string; name?: string; reason: string }[] =
        [];

      // 1) De-dupe within the file by normalized phone (keep first).
      //    Rows with no usable phone at all are counted separately —
      //    they never duplicated anything, so lumping them into
      //    `skipped` would misreport them as dupes (see dedupeByPhone).
      const {
        unique,
        duplicates: inFileDupes,
        invalid: invalidPhone,
      } = dedupeByPhone(parsedRows);
      skipped += inFileDupes;

      // 2) Skip numbers already in this account. One read of the
      //    generated `phone_normalized` column (migration 022) → Set.
      const { data: existingRows } = await supabase
        .from('contacts')
        .select('phone_normalized')
        .eq('account_id', accountId);
      const existing = new Set(
        (existingRows ?? [])
          .map(
            (r) => (r as { phone_normalized: string | null }).phone_normalized
          )
          .filter((p): p is string => !!p)
      );

      const toInsert = unique.filter((row) => {
        if (existing.has(normalizeKey(row.phone))) {
          skipped++;
          return false;
        }
        return true;
      });

      // 3) Resolve tag names → ids (admin+ may auto-create missing tags).
      //    Skip the round-trip when the import carries no tag names.
      const allTagNames = toInsert.flatMap((row) => row.tagNames);
      let tagIdByKey = new Map<string, string>();
      let skippedNames: string[] = [];
      if (allTagNames.length > 0) {
        ({ tagIdByKey, skippedNames } = await resolveImportTagIds(supabase, {
          accountId,
          userId: user.id,
          tagNames: allTagNames,
          canCreateTags: canEditSettings,
        }));
      }

      const tagAssignments: ContactTagAssignment[] = [];

      // 4) Batch insert the genuinely-new rows in chunks of 50. The DB
      //    unique index is the backstop: a 23505 (race, or a format
      //    that normalizes equal) counts as skipped, not failed.
      const chunkSize = 50;

      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        const rows = chunk.map((row) => ({
          user_id: user.id,
          account_id: accountId,
          phone: row.phone,
          name: row.name || null,
          email: row.email || null,
          company: row.company || null,
        }));

        const { data, error } = await supabase
          .from('contacts')
          .insert(rows)
          .select('id');

        if (error) {
          // Retry individually so one bad/duplicate row doesn't sink
          // the whole chunk.
          for (let j = 0; j < rows.length; j++) {
            const row = rows[j];
            const source = chunk[j];
            const { data: singleData, error: singleErr } = await supabase
              .from('contacts')
              .insert(row)
              .select('id')
              .single();

            if (!singleErr && singleData) {
              imported++;
              if (source.tagNames.length > 0) {
                tagAssignments.push({
                  contactId: singleData.id,
                  tagNames: source.tagNames,
                });
              }
            } else if (isUniqueViolation(singleErr)) {
              skipped++;
            } else {
              failed++;
              // Keep the actual DB error instead of discarding it —
              // "N contacts failed" with no reason attached left no
              // way to tell an RLS/constraint failure from a fluke,
              // let alone which contact it was.
              console.error(
                '[contacts import] insert failed for',
                row.phone,
                singleErr
              );
              failedDetails.push({
                phone: row.phone,
                name: row.name ?? undefined,
                reason:
                  (singleErr as { message?: string } | null)?.message ||
                  t('unknownReason'),
              });
            }
          }
        } else {
          const inserted = data ?? [];
          imported += inserted.length;
          // inserted[j] ↔ chunk[j] only holds because a single INSERT
          // preserves RETURNING order. If this path is ever split into
          // parallel inserts, zip by phone or returned id instead.
          for (let j = 0; j < inserted.length; j++) {
            const source = chunk[j];
            if (!source || source.tagNames.length === 0) continue;
            tagAssignments.push({
              contactId: inserted[j].id,
              tagNames: source.tagNames,
            });
          }
        }
      }

      // 5) Wire tags onto the contacts we just created. Failure here must
      //    not mask a successful contact import.
      let tagsAssigned = 0;
      try {
        tagsAssigned = await assignImportedContactTags(
          supabase,
          tagAssignments,
          tagIdByKey
        );
      } catch {
        toast.warning(t('toastTagsWarning'));
      }

      setResult({
        imported,
        skipped,
        invalidPhone,
        failed,
        failedDetails,
        tagsAssigned,
      });
      if (imported > 0) {
        toast.success(t('toastImported', { count: imported }));
        onImported();
      }
      if (tagsAssigned > 0) {
        toast.success(t('toastTagsAssigned', { count: tagsAssigned }));
      }
      if (skippedNames.length > 0) {
        const sample = skippedNames.slice(0, 3).join(', ');
        const more =
          skippedNames.length > 3 ? t('toastTagsSkippedMore', { count: skippedNames.length - 3 }) : '';
        toast.info(t('toastTagsSkipped', { sample, more }));
      }
      if (skipped > 0) {
        toast.info(t('toastSkipped', { count: skipped }));
      }
      if (invalidPhone > 0) {
        toast.warning(t('toastInvalidPhone', { count: invalidPhone }));
      }
      if (failed > 0) {
        toast.error(t('toastFailed', { count: failed }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('toastError');
      toast.error(message);
    } finally {
      setImporting(false);
    }
  }

  const preview = parsedRows.slice(0, PREVIEW_LIMIT);
  // Tags: OR — show when the CSV declares a column or preview rows carry
  // values, so an all-empty tags column still renders for validation.
  const previewHasTags =
    hasTagsColumn || preview.some((row) => row.tagNames.length > 0);
  // Company: AND — hide unless the CSV declares it and preview has data,
  // avoiding an all-dash column that wastes horizontal space.
  const previewHasCompany =
    hasCompanyColumn && preview.some((row) => row.company?.trim());

  const tagStats = useMemo(() => {
    const names = new Set<string>();
    let rowsWithTags = 0;
    for (const row of parsedRows) {
      if (row.tagNames.length === 0) continue;
      rowsWithTags++;
      for (const name of row.tagNames) names.add(name.trim().toLowerCase());
    }
    return { unique: names.size, rowsWithTags };
  }, [parsedRows]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden border-border/80 bg-popover p-0 text-popover-foreground sm:max-w-2xl">
        <div className="shrink-0 space-y-4 border-b border-border/80 px-6 pt-6 pb-5">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-lg text-popover-foreground">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: t.markup('desc', {
                  phoneCode: (chunks) => `<code class="rounded bg-muted px-1 py-0.5 text-[11px] text-muted-foreground">${chunks}</code>`,
                  nameCode: (chunks) => `<code class="rounded bg-muted px-1 py-0.5 text-[11px] text-muted-foreground">${chunks}</code>`,
                  emailCode: (chunks) => `<code class="rounded bg-muted px-1 py-0.5 text-[11px] text-muted-foreground">${chunks}</code>`,
                  companyCode: (chunks) => `<code class="rounded bg-muted px-1 py-0.5 text-[11px] text-muted-foreground">${chunks}</code>`,
                  tagsCode: (chunks) => `<code class="rounded bg-muted px-1 py-0.5 text-[11px] text-muted-foreground">${chunks}</code>`,
                })
              }}
            />
          </DialogHeader>

          {/* Source Tabs: CSV Upload vs 1-Click Google Sheet */}
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <button
              type="button"
              onClick={() => setImportSource('csv')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                importSource === 'csv'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Upload className="size-3.5" />
              Upload CSV File
            </button>
            <button
              type="button"
              onClick={() => setImportSource('sheets')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                importSource === 'sheets'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <FileSpreadsheet className="size-3.5" />
              1-Click Google Sheets Sync
              <span className="text-[10px] bg-emerald-500/20 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                BYOS
              </span>
            </button>
          </div>

          {importSource === 'sheets' ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileSpreadsheet className="size-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Stream from Google Sheets</h5>
                    <p className="text-[11px] text-muted-foreground">
                      Reads live contacts directly from your Google Drive into memory. 0 bytes saved on our server.
                    </p>
                  </div>
                </div>
                {driveConnected && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Drive Connected
                  </span>
                )}
              </div>

              {/* If user has Google Sheets in their connected Drive, show quick dropdown */}
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

              {/* Paste any Google Sheet URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Or paste any Google Sheet Link:
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
                <p className="text-[10px] text-muted-foreground">
                  💡 Works with private sheets in your connected Google Drive or public sheets (&ldquo;Anyone with link can view&rdquo;).
                </p>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  fileInputRef.current?.click();
              }}
              className={cn(
                'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-5 transition-all',
                file
                  ? 'border-primary/35 bg-primary/[0.04]'
                  : 'hover:border-primary/40 border-border/80 bg-background/40 hover:bg-background/70'
              )}
            >
              {file ? (
                <>
                  <div className="bg-primary/15 ring-primary/25 flex size-10 items-center justify-center rounded-lg ring-1">
                    <FileText className="text-primary size-5" />
                  </div>
                  <p
                    className="max-w-full truncate px-2 text-sm font-medium text-popover-foreground"
                    title={file.name}
                  >
                    {truncateFilename(file.name)}
                  </p>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {t('rowsReady', { count: parsedRows.length })}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted/80 ring-1 ring-border/80 transition-colors group-hover:bg-muted">
                    <Upload className="size-5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('uploadDropzone')}
                  </p>
                  <div className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground">
                    <p>{t('uploadHint')}</p>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                      Free Tier Safe Limit: Max 1 MB (up to 5,000 contacts / batch)
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {preview.length > 0 && !result && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {t('preview', { count: preview.length })}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tagStats.rowsWithTags > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted/90 px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Tag className="text-primary/80 size-3" />
                      {t('previewTags', { tags: tagStats.unique, contacts: tagStats.rowsWithTags })}
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-border ring-1 ring-border/50">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[32rem] text-xs">
                    <thead>
                      <tr className="border-b border-border bg-background/60">
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap text-muted-foreground">
                          {t('columns.phone')}
                        </th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap text-muted-foreground">
                          {t('columns.name')}
                        </th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap text-muted-foreground">
                          {t('columns.email')}
                        </th>
                        {previewHasCompany && (
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap text-muted-foreground">
                            {t('columns.company')}
                          </th>
                        )}
                        {previewHasTags && (
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap text-muted-foreground">
                            {t('columns.tags')}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {preview.map((row, i) => (
                        <tr
                          key={i}
                          className="bg-popover/40 transition-colors hover:bg-muted/30"
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                            <PreviewCell
                              value={row.phone}
                              mono
                              maxWidth="max-w-[7.5rem]"
                            />
                          </td>
                          <td className="px-3 py-2 text-popover-foreground">
                            <PreviewCell
                              value={row.name || '—'}
                              maxWidth="max-w-[8.5rem]"
                            />
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            <PreviewCell
                              value={row.email || '—'}
                              maxWidth="max-w-[10rem]"
                            />
                          </td>
                          {previewHasCompany && (
                            <td className="px-3 py-2 text-muted-foreground">
                              <PreviewCell
                                value={row.company || '—'}
                                maxWidth="max-w-[7rem]"
                              />
                            </td>
                          )}
                          {previewHasTags && (
                            <td className="px-3 py-2 align-top">
                              <ImportPreviewTags
                                tagNames={row.tagNames}
                                tagColorByKey={tagColorByKey}
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {parsedRows.length > PREVIEW_LIMIT && (
                <p className="text-center text-[11px] text-muted-foreground">
                  {t('moreRows', { count: parsedRows.length - PREVIEW_LIMIT })}
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="text-sm font-medium text-popover-foreground">{t('importComplete')}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {result.imported > 0 && (
                  <div className="text-primary flex items-center gap-1.5 text-sm">
                    <CheckCircle className="size-4 shrink-0" />
                    {t('resultImported', { count: result.imported })}
                  </div>
                )}
                {result.tagsAssigned > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-cyan-400">
                    <CheckCircle className="size-4 shrink-0" />
                    {t('resultTags', { count: result.tagsAssigned })}
                  </div>
                )}
                {result.skipped > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-amber-400">
                    <AlertTriangle className="size-4 shrink-0" />
                    {t('resultSkipped', { count: result.skipped })}
                  </div>
                )}
                {result.invalidPhone > 0 && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-sm text-amber-400">
                      <AlertTriangle className="size-4 shrink-0" />
                      {t('resultInvalidPhone', { count: result.invalidPhone })}
                    </div>
                    <p className="pl-[1.375rem] text-xs text-muted-foreground">
                      {t('invalidPhoneHint')}
                    </p>
                  </div>
                )}
                {result.failed > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-red-400">
                    <XCircle className="size-4 shrink-0" />
                    {t('resultFailed', { count: result.failed })}
                  </div>
                )}
              </div>

              {result.failedDetails.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-border/80 pt-3">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {t('failedRowsHeading')}
                  </p>
                  <ul className="max-h-32 space-y-1 overflow-y-auto text-xs">
                    {result.failedDetails.map((row, i) => (
                      <li
                        key={i}
                        className="flex items-baseline gap-2 text-muted-foreground"
                      >
                        <span className="shrink-0 font-mono text-popover-foreground">
                          {row.name ? `${row.name} (${row.phone})` : row.phone}
                        </span>
                        <span className="truncate">{row.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-0 shrink-0 gap-2 border-t border-border/80 bg-background/50 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            {result ? t('close') : t('cancel')}
          </Button>
          {!result && (
            <Button
              type="button"
              disabled={parsedRows.length === 0 || importing}
              onClick={handleImport}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {importing && <Loader2 className="size-4 animate-spin" />}
              {parsedRows.length > 0 ? t('importBtn', { count: parsedRows.length }) : t('importBtn', { count: 0 })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
