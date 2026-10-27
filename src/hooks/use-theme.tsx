"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  MODE_STORAGE_KEY,
  STORAGE_KEY,
  isMode,
  isThemeId,
  type Mode,
  type ThemeId,
} from "@/lib/themes";

/**
 * ThemeProvider — wraps the whole app, owns the two theming axes:
 *   • `theme` — the accent color (`data-theme` on <html>)
 *   • `mode`  — light / dark (`data-mode` on <html>)
 * The two are independent, so any accent renders in either mode.
 *
 * The boot script in `src/app/layout.tsx` has already applied both
 * `data-theme` and `data-mode` before React hydrates, so by the time
 * this Provider mounts the page is already painted correctly. We just
 * read what's there and keep it in sync going forward.
 *
 * Persistence is localStorage only (device-scoped). A future
 * follow-up could mirror to `profiles.preferences` for cross-device
 * sync, but a per-device choice is also defensible — your phone may
 * deserve a different theme than your laptop.
 */

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (next: ThemeId) => void;
  mode: Mode;
  setMode: (next: Mode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  // Whatever the boot script applied is the truth. Fall back to
  // localStorage / default if for some reason the attribute is missing
  // (e.g. someone bypassed the boot script in a custom layout).
  const fromAttr = document.documentElement.dataset.theme;
  if (isThemeId(fromAttr)) return fromAttr;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    // localStorage can throw in private-browsing / sandboxed contexts.
  }
  return DEFAULT_THEME;
}

function readInitialMode(): Mode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  const fromAttr = document.documentElement.dataset.mode;
  if (isMode(fromAttr)) {
    document.documentElement.classList.toggle("dark", fromAttr === "dark");
    return fromAttr;
  }
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (isMode(stored)) {
      document.documentElement.classList.toggle("dark", stored === "dark");
      return stored;
    }
  } catch {
    // localStorage can throw in private-browsing / sandboxed contexts.
  }

  // System preference detection (Sun / Light vs Moon / Dark)
  const systemPrefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const systemMode: Mode = systemPrefersDark ? "dark" : "light";
  document.documentElement.dataset.mode = systemMode;
  document.documentElement.classList.toggle("dark", systemMode === "dark");
  return systemMode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readInitialTheme);
  const [mode, setModeState] = useState<Mode>(readInitialMode);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = next;
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Same private-browsing edge case as above; the in-memory state
      // still updates so the current tab works for the session.
    }
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.mode = next;
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // Same private-browsing edge case as above.
    }
  }, []);

  const toggleMode = useCallback(() => {
    // Read the live active mode from the DOM or state to avoid stale closure state
    const currentDomMode =
      typeof document !== "undefined"
        ? (document.documentElement.dataset.mode as Mode)
        : mode;
    const active = currentDomMode === "dark" || currentDomMode === "light" ? currentDomMode : mode;
    const nextMode: Mode = active === "dark" ? "light" : "dark";
    setMode(nextMode);
  }, [mode, setMode]);

  // Sync from other tabs & listen for OS system theme changes (Light / Dark)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        if (isThemeId(e.newValue) && e.newValue !== theme) {
          setThemeState(e.newValue);
          document.documentElement.dataset.theme = e.newValue;
        }
        return;
      }
      if (e.key === MODE_STORAGE_KEY) {
        if (isMode(e.newValue) && e.newValue !== mode) {
          setModeState(e.newValue);
          document.documentElement.dataset.mode = e.newValue;
          document.documentElement.classList.toggle("dark", e.newValue === "dark");
        }
      }
    }

    // Listen for OS system theme change if user hasn't explicitly chosen a mode in localStorage
    const mediaQuery = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    function onSystemThemeChange(e: MediaQueryListEvent) {
      try {
        const hasManualChoice = localStorage.getItem(MODE_STORAGE_KEY);
        if (!hasManualChoice) {
          const nextMode: Mode = e.matches ? "dark" : "light";
          setModeState(nextMode);
          document.documentElement.dataset.mode = nextMode;
          document.documentElement.classList.toggle("dark", nextMode === "dark");
        }
      } catch {
        // Ignore
      }
    }

    window.addEventListener("storage", onStorage);
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", onSystemThemeChange);
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", onSystemThemeChange);
      }
    };
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components rendered outside the provider — return
    // no-op setters so callers don't crash. The boot script still
    // applied the right CSS attributes, so visually the page is fine.
    return {
      theme: DEFAULT_THEME,
      setTheme: () => {},
      mode: DEFAULT_MODE,
      setMode: () => {},
      toggleMode: () => {},
    };
  }
  return ctx;
}
