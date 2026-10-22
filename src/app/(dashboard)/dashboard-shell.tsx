"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AccountAccessAlert } from "@/components/layout/account-access-alert";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { BrowserNotificationsListener } from "@/components/notifications/browser-notifications-listener";
import { MandatorySetupModal } from "@/components/layout/mandatory-setup-modal";

// Auth-gated dashboard shell. Extracted from the layout so the layout
// itself can stay a server component and export metadata (noindex) —
// client components can't export Next's metadata object.

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("DashboardShell");

  // Setup verification state (compulsory Google Drive + Supabase BYOD)
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Check setup status
  const checkSetupStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/account/setup-status");
      if (res.ok) {
        const data = await res.json();
        setGoogleDriveConnected(!!data.googleDriveConnected);
        setSupabaseConnected(!!data.supabaseConnected);
        setSetupChecked(true);

        // If not fully configured and NOT already on settings page, show mandatory modal
        if (!data.isFullyConfigured) {
          if (!pathname?.startsWith("/settings")) {
            setSetupModalOpen(true);
          } else {
            setSetupModalOpen(false);
          }
        } else {
          setSetupModalOpen(false);
        }
      }
    } catch {
      // Ignore
    }
  }, [pathname]);

  useEffect(() => {
    if (user) {
      checkSetupStatus();
    }
  }, [user, checkSetupStatus]);

  // Sidebar drawer state — only used on mobile. On lg+ the sidebar is
  // always visible and this stays at `false` (ignored by the component).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Reports this tab's online/away presence once we know a user is
          signed in. Headless — renders nothing. */}
      <PresenceHeartbeat />
      {/* Desktop alerts for new customer messages (opt-in via Settings →
          Your profile). Headless — renders nothing. */}
      <BrowserNotificationsListener />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        {/* Thinner horizontal padding on mobile so cards have room to breathe. */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Above every page: writes are being rejected and here's why.
              Renders nothing unless the account/role failed to resolve. */}
          <AccountAccessAlert />
          {children}
        </main>
      </div>

      {/* Mandatory Onboarding & Storage/DB Barrier */}
      <MandatorySetupModal
        open={setupModalOpen}
        googleDriveConnected={googleDriveConnected}
        supabaseConnected={supabaseConnected}
        onRefresh={checkSetupStatus}
      />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </AuthProvider>
  );
}
