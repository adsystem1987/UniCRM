"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QuickReply } from "@/types";
import { interactivePayloadPreviewText } from "@/lib/whatsapp/interactive";

interface QuickReplyPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (qr: QuickReply) => void;
}

/**
 * Lists the account's saved quick replies for insertion into the
 * composer. Text snippets fill the textarea; interactive snippets open
 * the builder pre-filled (handled by the caller's `onPick`).
 */
export function QuickReplyPicker({
  open,
  onOpenChange,
  onPick,
}: QuickReplyPickerProps) {
  const t = useTranslations("Inbox.composer");
  const [items, setItems] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/quick-replies", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) {
          setItems((data.quick_replies as QuickReply[]) ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const [query, setQuery] = useState("");

  const filtered = items.filter((qr) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().replace(/^\/+/, '');
    const titleMatch = qr.title.toLowerCase().includes(q);
    const shortcutMatch = qr.shortcut?.toLowerCase().includes(q);
    const contentMatch = qr.content_text?.toLowerCase().includes(q);
    return titleMatch || shortcutMatch || contentMatch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>{t("quickReplies")}</DialogTitle>
          <a
            href="/settings"
            className="text-xs text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Manage
          </a>
        </DialogHeader>

        <div className="relative mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or /shortcut..."
            className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query.trim() ? "No matching quick replies found." : t("quickRepliesEmpty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {filtered.map((qr) => (
                <li key={qr.id}>
                  <button
                    type="button"
                    onClick={() => onPick(qr)}
                    className="flex w-full items-start gap-2 rounded-md border border-border bg-muted/40 p-2.5 text-left hover:border-primary/50 hover:bg-muted"
                  >
                    {qr.kind === "interactive" ? (
                      <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {qr.title}
                        </span>
                        {qr.shortcut && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-mono text-primary">
                            /{qr.shortcut}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {qr.kind === "interactive" && qr.interactive_payload
                          ? interactivePayloadPreviewText(qr.interactive_payload)
                          : qr.content_text}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
