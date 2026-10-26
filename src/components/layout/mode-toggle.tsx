"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

import { useTranslations } from "next-intl";

/**
 * Light/dark mode toggle — a single icon button that flips the app
 * between the two modes. Sun shows in light mode (click → go dark),
 * moon shows in dark mode (click → go light); the label always names
 * the destination so screen-reader users hear what the click does.
 *
 * Prevents hydration mismatch and uses explicit high-contrast icon styling.
 */
export function ModeToggle({ className }: { className?: string }) {
  const t = useTranslations("ModeToggle");
  const { mode, toggleMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goingTo = mode === "dark" ? "light" : "dark";
  const switchLabel = t("switchMode", { mode: goingTo });

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={switchLabel}
      title={switchLabel}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground transition-all hover:bg-surface-hover hover:border-border active:bg-surface-active active:translate-y-px shrink-0",
        className,
      )}
    >
      {!mounted ? (
        <span className="h-4.5 w-4.5 rounded-full border border-border" />
      ) : mode === "dark" ? (
        <Moon className="h-4.5 w-4.5 text-amber-400 fill-amber-400/20" />
      ) : (
        <Sun className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20" />
      )}
    </button>
  );
}
