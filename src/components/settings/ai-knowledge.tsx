'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Pencil, RefreshCw, BookOpen, Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface DocSummary {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  updated_at: string;
}

/** Editor target: 'new' when creating, a doc id when editing, null when closed. */
type EditTarget = 'new' | string | null;

export function AiKnowledgeCard({
  accountId,
  canEdit,
  hasEmbeddingsKey,
}: {
  accountId: string | null;
  canEdit: boolean;
  hasEmbeddingsKey: boolean;
}) {
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [saving, setSaving] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const loadedAccountIdRef = useRef<string | null>(null);
  const t = useTranslations('Settings.aiKnowledge');

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/knowledge');
      const data = await res.json();
      if (res.ok) setDocs(data.documents ?? []);
      else toast.error(data.error ?? t('loadFailed'));
    } catch {
      toast.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accountId || loadedAccountIdRef.current === accountId) return;
    loadedAccountIdRef.current = accountId;
    void fetchDocs();
  }, [accountId, fetchDocs]);

  const openNew = (defaultCat?: string) => {
    setEditing('new');
    setTitle('');
    setContent('');
    setCategory(defaultCat || 'General');
  };

  const openEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/knowledge/${id}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t('openFailed'));
        return;
      }
      setEditing(id);
      setTitle(data.title ?? '');
      setContent(data.content ?? '');
      setCategory(data.category ?? 'General');
    } catch {
      toast.error(t('openFailed'));
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setCategory('General');
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error(t('titleContentRequired'));
      return;
    }
    setSaving(true);
    try {
      const isNew = editing === 'new';
      const res = await fetch(
        isNew ? '/api/ai/knowledge' : `/api/ai/knowledge/${editing}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category: category.trim() || 'General',
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        // A 200 with `warning` means saved but indexing degraded.
        if (data.warning) toast.warning(data.warning);
        else toast.success(isNew ? t('saveSuccessNew') : t('saveSuccessUpdate'));
        cancelEdit();
        await fetchDocs();
      } else {
        toast.error(data.error ?? t('saveFailed'));
      }
    } catch {
      toast.error(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/knowledge/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('removeSuccess'));
        setDocs((d) => d.filter((x) => x.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error ?? t('removeFailed'));
      }
    } catch {
      toast.error(t('removeFailed'));
    }
  };

  const reindex = async () => {
    setReindexing(true);
    try {
      const res = await fetch('/api/ai/knowledge/reindex', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(t('reindexSuccess', { count: data.reindexed }));
      } else {
        toast.error(data.error ?? t('reindexFailed'));
      }
    } catch {
      toast.error(t('reindexFailed'));
    } finally {
      setReindexing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" /> {t('title')}
        </CardTitle>
        <CardDescription>
          {t('description', {
            searchType: hasEmbeddingsKey ? t('semanticSearchOn') : t('keywordSearchOn')
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center py-4 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('loading')}
          </div>
        ) : (
          <>
            {docs.length === 0 && editing === null && (
              <p className="text-sm text-muted-foreground">
                {t('noDocs')}
              </p>
            )}

            {docs.length > 0 && (
              <div className="space-y-4">
                {/* AppFlowy-style Category / Folder Tree */}
                {Array.from(new Set(docs.map((d) => d.category || 'General'))).map((catName) => {
                  const catDocs = docs.filter((d) => (d.category || 'General') === catName);
                  return (
                    <div key={catName} className="rounded-xl border border-border bg-card/60 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/60">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Folder className="size-3.5 text-primary" />
                          {catName}
                          <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1.5 ml-1">
                            {catDocs.length}
                          </Badge>
                        </span>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-primary gap-1"
                            onClick={() => openNew(catName)}
                          >
                            <Plus className="size-3" /> Add Doc
                          </Button>
                        )}
                      </div>

                      <ul className="divide-y divide-border/60">
                        {catDocs.map((doc) => (
                          <li
                            key={doc.id}
                            className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-muted/30 transition-colors"
                          >
                            <span className="flex items-center gap-2 min-w-0 truncate text-xs text-foreground font-medium">
                              <FileText className="size-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{doc.title}</span>
                            </span>
                            {canEdit && (
                              <span className="flex shrink-0 gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => void openEdit(doc.id)}
                                  title={t('editDoc')}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                                  onClick={() => void remove(doc.id)}
                                  title={t('deleteDoc')}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {editing !== null ? (
              <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="kb-title" className="text-xs font-semibold">{t('editDocTitle')}</Label>
                    <Input
                      id="kb-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('editDocTitlePlaceholder')}
                      className="text-xs"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kb-cat" className="text-xs font-semibold">Folder / Category</Label>
                    <Input
                      id="kb-cat"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Pricing, FAQs, Policies"
                      className="text-xs"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="kb-content" className="text-xs font-semibold">{t('editDocContent')}</Label>
                  <Textarea
                    id="kb-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t('editDocContentPlaceholder')}
                    rows={8}
                    className="text-xs font-mono"
                    disabled={saving}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving} className="text-xs h-8">
                    {t('cancel')}
                  </Button>
                  <Button size="sm" onClick={save} disabled={saving} className="text-xs h-8">
                    {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    {t('saveDoc')}
                  </Button>
                </div>
              </div>
            ) : (
              canEdit && (
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => openNew()} className="text-xs h-8">
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> {t('addDoc')}
                  </Button>
                  {hasEmbeddingsKey && docs.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={reindex}
                      disabled={reindexing}
                      title={t('reindexTooltip')}
                    >
                      {reindexing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      {t('reindex')}
                    </Button>
                  )}
                </div>
              )
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
