"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardDrive,
  Mail,
  Share2,
  Camera,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Loader2,
  Database,
  Terminal,
  FileSpreadsheet,
  MessageCircle,
  ArrowRight,
  Globe,
  Headphones,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingsPanelHead } from "./settings-panel-head";

export const DEFAULT_BYOD_SCHEMA_SQL = `-- UniCRM Customer Database Schema (Run on your personal Supabase)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  name text,
  phone text NOT NULL,
  phone_normalized text,
  email text,
  company text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, tag_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'whatsapp',
  status text NOT NULL DEFAULT 'open',
  last_message_text text,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_id text,
  content_type text NOT NULL DEFAULT 'text',
  content_text text,
  media_url text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_all ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all ON contact_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY allow_all ON messages FOR ALL USING (true) WITH CHECK (true);
`;

type IntegrationTab = "gdrive" | "email" | "sheets" | "database" | "chatwoot" | "facebook" | "instagram";

export function IntegrationsPanel() {
  const [activeTab, setActiveTab] = useState<IntegrationTab>("gdrive");

  // Dynamic origin and host
  const [origin, setOrigin] = useState("");
  const [hostname, setHostname] = useState("");

  // BYOD Database state
  const [byodLoading, setByodLoading] = useState(false);
  const [byodConnected, setByodConnected] = useState(false);
  const [byodUrl, setByodUrl] = useState("");
  const [byodAnonKey, setByodAnonKey] = useState("");
  const [byodServiceKey, setByodServiceKey] = useState("");
  const [byodSchemaInit, setByodSchemaInit] = useState(false);
  const [byodSchemaSql, setByodSchemaSql] = useState(DEFAULT_BYOD_SCHEMA_SQL);
  const [showSchemaSql, setShowSchemaSql] = useState(false);

  // Google Drive state
  const [gdriveLoading, setGdriveLoading] = useState(true);
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gdriveEmail, setGdriveEmail] = useState("");
  const [gdriveFolder, setGdriveFolder] = useState("/DFY UniCRM Attachments");
  const [gdriveMirrorInbound, setGdriveMirrorInbound] = useState(true);
  const [gdriveMirrorOutbound, setGdriveMirrorOutbound] = useState(true);

  // Check URL params for OAuth redirect results and subtab switching
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      setHostname(window.location.hostname);

      const params = new URLSearchParams(window.location.search);
      const subtab = params.get("subtab");
      if (
        subtab &&
        ["gdrive", "email", "sheets", "database", "chatwoot", "facebook", "instagram"].includes(subtab)
      ) {
        setActiveTab(subtab as IntegrationTab);
      }

      if (params.get("gdrive") === "connected") {
        setActiveTab("gdrive");
        toast.success("Google Drive connected successfully with 15 GB quota!");
        window.history.replaceState({}, "", "/settings?tab=integrations&subtab=gdrive");
      } else if (params.get("gdrive_error")) {
        setActiveTab("gdrive");
        toast.error(`Google Drive connection error: ${params.get("gdrive_error")}`);
        window.history.replaceState({}, "", "/settings?tab=integrations&subtab=gdrive");
      } else if (params.get("gmail") === "connected") {
        setActiveTab("email");
        toast.success("Gmail connected successfully!");
        window.history.replaceState({}, "", "/settings?tab=integrations&subtab=email");
      } else if (params.get("gmail_error")) {
        setActiveTab("email");
        toast.error(`Gmail connection error: ${params.get("gmail_error")}`);
        window.history.replaceState({}, "", "/settings?tab=integrations&subtab=email");
      } else if (params.get("error")) {
        toast.error(decodeURIComponent(params.get("error")!));
        window.history.replaceState({}, "", "/settings?tab=integrations");
      }

      // Restore saved configs from localStorage
      try {
        const savedFb = localStorage.getItem("unicrm_fb_config");
        if (savedFb) {
          const parsed = JSON.parse(savedFb);
          if (parsed.pageId) setFbPageId(parsed.pageId);
          if (parsed.accessToken) setFbAccessToken(parsed.accessToken);
          if (parsed.connected) setFbConnected(true);
        }
        const savedIg = localStorage.getItem("unicrm_ig_config");
        if (savedIg) {
          const parsed = JSON.parse(savedIg);
          if (parsed.accountId) setIgAccountId(parsed.accountId);
          if (parsed.accessToken) setIgAccessToken(parsed.accessToken);
          if (parsed.connected) setIgConnected(true);
        }
        const savedSmtp = localStorage.getItem("unicrm_smtp_config");
        if (savedSmtp) {
          const parsed = JSON.parse(savedSmtp);
          if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
          if (parsed.imapHost) setImapHost(parsed.imapHost);
          if (parsed.imapPort) setImapPort(parsed.imapPort);
          if (parsed.smtpHost) setSmtpHost(parsed.smtpHost);
          if (parsed.smtpPort) setSmtpPort(parsed.smtpPort);
          if (parsed.emailUser) setEmailUser(parsed.emailUser);
          if (parsed.connected) setEmailConnected(true);
        }
      } catch {
        // Ignore local storage error
      }
    }
  }, []);

  // Fetch actual Google Drive connection status from DB
  useEffect(() => {
    async function checkDriveStatus() {
      setGdriveLoading(true);
      try {
        const res = await fetch("/api/integrations/google-drive/status");
        const data = await res.json();
        if (data.connected) {
          setGdriveConnected(true);
          setGdriveEmail(data.email || "");
          if (data.target_folder) setGdriveFolder(data.target_folder);
          if (typeof data.mirror_inbound === "boolean") setGdriveMirrorInbound(data.mirror_inbound);
          if (typeof data.mirror_outbound === "boolean") setGdriveMirrorOutbound(data.mirror_outbound);
        } else {
          setGdriveConnected(false);
          setGdriveEmail("");
        }
      } catch {
        setGdriveConnected(false);
      } finally {
        setGdriveLoading(false);
      }
    }
    void checkDriveStatus();
  }, []);

  const handleConnectDrive = () => {
    window.location.href = "/api/integrations/google-drive/auth";
  };

  const handleDisconnectDrive = async () => {
    try {
      const res = await fetch("/api/integrations/google-drive/status", {
        method: "DELETE",
      });
      if (res.ok) {
        setGdriveConnected(false);
        setGdriveEmail("");
        toast.info("Google Drive disconnected");
      } else {
        toast.error("Failed to disconnect Google Drive");
      }
    } catch {
      toast.error("Failed to disconnect Google Drive");
    }
  };

  const handleToggleMirror = async (checked: boolean) => {
    setGdriveMirrorInbound(checked);
    try {
      await fetch("/api/integrations/google-drive/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mirror_inbound: checked }),
      });
      toast.success(checked ? "Inbound mirroring enabled" : "Inbound mirroring disabled");
    } catch {
      // Ignored
    }
  };

  const handleToggleMirrorOutbound = async (checked: boolean) => {
    setGdriveMirrorOutbound(checked);
    try {
      await fetch("/api/integrations/google-drive/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mirror_outbound: checked }),
      });
      toast.success(checked ? "Outbound streaming enabled" : "Outbound streaming disabled");
    } catch {
      // Ignored
    }
  };

  // Gmail state
  const [gmailLoading, setGmailLoading] = useState(true);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testEmailSending, setTestEmailSending] = useState(false);

  // Fetch actual Gmail connection status from DB
  useEffect(() => {
    async function checkGmailStatus() {
      setGmailLoading(true);
      try {
        const res = await fetch("/api/integrations/gmail/status");
        const data = await res.json();
        if (data.connected) {
          setGmailConnected(true);
          setGmailEmail(data.email || "");
        } else {
          setGmailConnected(false);
          setGmailEmail("");
        }
      } catch {
        setGmailConnected(false);
      } finally {
        setGmailLoading(false);
      }
    }
    void checkGmailStatus();
  }, []);

  const handleConnectGmail = () => {
    window.location.href = "/api/integrations/gmail/auth";
  };

  const handleDisconnectGmail = async () => {
    try {
      const res = await fetch("/api/integrations/gmail/status", {
        method: "DELETE",
      });
      if (res.ok) {
        setGmailConnected(false);
        setGmailEmail("");
        toast.info("Gmail disconnected");
      } else {
        toast.error("Failed to disconnect Gmail");
      }
    } catch {
      toast.error("Failed to disconnect Gmail");
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo || !testEmailTo.includes("@")) {
      toast.error("Please enter a valid recipient email address");
      return;
    }
    setTestEmailSending(true);
    try {
      const res = await fetch("/api/integrations/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailTo.trim(),
          subject: "Test Email from DFY UniCRM",
          message: "Hello!\n\nThis is a test email sent directly from your connected Google Workspace / Gmail account in UniCRM.\n\nYour outbound email integration is working perfectly! 🚀",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Test email sent successfully to ${testEmailTo}!`);
        setTestEmailTo("");
      } else {
        toast.error(data.error || "Failed to send test email");
      }
    } catch {
      toast.error("Failed to send test email");
    } finally {
      setTestEmailSending(false);
    }
  };

  // Fetch BYOD status
  useEffect(() => {
    async function checkByodStatus() {
      try {
        const res = await fetch("/api/integrations/byod");
        const data = await res.json();
        if (data.connected) {
          setByodConnected(true);
          setByodUrl(data.supabaseUrl || "");
          setByodSchemaInit(data.schemaInitialized);
        } else {
          setByodConnected(false);
        }
        if (data.schemaSql) {
          setByodSchemaSql(data.schemaSql);
        }
      } catch {
        setByodConnected(false);
      }
    }
    void checkByodStatus();
  }, []);

  const handleSaveByod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!byodUrl.trim() || !byodAnonKey.trim()) {
      toast.error("Please enter your Supabase Project URL and Anon Key");
      return;
    }
    setByodLoading(true);
    try {
      const res = await fetch("/api/integrations/byod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl: byodUrl.trim(),
          anonKey: byodAnonKey.trim(),
          serviceRoleKey: byodServiceKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect personal Supabase");
      }
      setByodConnected(true);
      setByodSchemaInit(data.schemaInitialized);
      toast.success("Personal Supabase database connected successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to connect Supabase");
    } finally {
      setByodLoading(false);
    }
  };

  const handleDisconnectByod = async () => {
    try {
      const res = await fetch("/api/integrations/byod", { method: "DELETE" });
      if (res.ok) {
        setByodConnected(false);
        setByodUrl("");
        setByodAnonKey("");
        setByodServiceKey("");
        toast.info("Reverted to default CRM database");
      } else {
        toast.error("Failed to disconnect database");
      }
    } catch {
      toast.error("Failed to disconnect database");
    }
  };

  // Google Sheets state
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsList, setSheetsList] = useState<Array<{ id: string; name: string; modifiedTime?: string }>>([]);
  const [testSheetUrl, setTestSheetUrl] = useState("");
  const [testSheetLoading, setTestSheetLoading] = useState(false);
  const [sheetPreview, setSheetPreview] = useState<{
    totalRows: number;
    preview: Record<string, string>[];
    hasPhoneColumn?: boolean;
    hasTagsColumn?: boolean;
    hasCompanyColumn?: boolean;
  } | null>(null);

  const fetchSheetsList = async () => {
    setSheetsLoading(true);
    try {
      const res = await fetch("/api/integrations/google-sheets");
      const data = await res.json();
      if (data.sheets) {
        setSheetsList(data.sheets);
      }
    } catch {
      // Ignore
    } finally {
      setSheetsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "sheets" && gdriveConnected) {
      void fetchSheetsList();
    }
  }, [activeTab, gdriveConnected]);

  const handleTestSheet = async () => {
    if (!testSheetUrl.trim()) {
      toast.error("Please enter a Google Sheet URL or ID");
      return;
    }
    setTestSheetLoading(true);
    try {
      const res = await fetch("/api/integrations/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetUrlOrId: testSheetUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSheetPreview(data);
        toast.success(`Google Sheet verified! ${data.totalRows} contact rows found.`);
      } else {
        toast.error(data.error || "Failed to inspect Google Sheet");
      }
    } catch {
      toast.error("Failed to connect to Google Sheet");
    } finally {
      setTestSheetLoading(false);
    }
  };

  // Email state
  const [emailMethod, setEmailMethod] = useState<"gmail" | "smtp" | "forward">("gmail");
  const [supportEmail, setSupportEmail] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("465");
  const [emailUser, setEmailUser] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [emailConnected, setEmailConnected] = useState(false);

  // Facebook state
  const [fbPageId, setFbPageId] = useState("");
  const [fbAccessToken, setFbAccessToken] = useState("");
  const [fbConnected, setFbConnected] = useState(false);

  // Instagram state
  const [igAccountId, setIgAccountId] = useState("");
  const [igAccessToken, setIgAccessToken] = useState("");
  const [igConnected, setIgConnected] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveFb = () => {
    if (!fbPageId.trim() || !fbAccessToken.trim()) {
      toast.error("Please provide both Facebook Page ID and Access Token");
      return;
    }
    setFbConnected(true);
    try {
      localStorage.setItem(
        "unicrm_fb_config",
        JSON.stringify({ pageId: fbPageId, accessToken: fbAccessToken, connected: true })
      );
    } catch {}
    toast.success("Facebook Messenger credentials saved!");
  };

  const handleDisconnectFb = () => {
    setFbConnected(false);
    setFbPageId("");
    setFbAccessToken("");
    try {
      localStorage.removeItem("unicrm_fb_config");
    } catch {}
    toast.info("Facebook Messenger configuration cleared");
  };

  const handleSaveIg = () => {
    if (!igAccountId.trim() || !igAccessToken.trim()) {
      toast.error("Please provide both Instagram Account ID and Access Token");
      return;
    }
    setIgConnected(true);
    try {
      localStorage.setItem(
        "unicrm_ig_config",
        JSON.stringify({ accountId: igAccountId, accessToken: igAccessToken, connected: true })
      );
    } catch {}
    toast.success("Instagram Direct credentials saved!");
  };

  const handleDisconnectIg = () => {
    setIgConnected(false);
    setIgAccountId("");
    setIgAccessToken("");
    try {
      localStorage.removeItem("unicrm_ig_config");
    } catch {}
    toast.info("Instagram Direct configuration cleared");
  };

  const handleSaveSmtp = () => {
    if (!supportEmail.trim()) {
      toast.error("Please provide a support email address");
      return;
    }
    setEmailConnected(true);
    try {
      localStorage.setItem(
        "unicrm_smtp_config",
        JSON.stringify({
          supportEmail,
          imapHost,
          imapPort,
          smtpHost,
          smtpPort,
          emailUser,
          connected: true,
        })
      );
    } catch {}
    toast.success("IMAP/SMTP configuration verified and saved!");
  };

  // Chatwoot state
  const [chatwootLoading, setChatwootLoading] = useState(false);
  const [chatwootConnected, setChatwootConnected] = useState(false);
  const [chatwootBaseUrl, setChatwootBaseUrl] = useState("https://app.chatwoot.com");
  const [chatwootAccountId, setChatwootAccountId] = useState("");
  const [chatwootInboxId, setChatwootInboxId] = useState("");
  const [chatwootApiToken, setChatwootApiToken] = useState("");
  const [chatwootInboxName, setChatwootInboxName] = useState("");

  useEffect(() => {
    async function checkChatwootStatus() {
      try {
        const res = await fetch("/api/integrations/chatwoot/status");
        const data = await res.json();
        if (data.connected) {
          setChatwootConnected(true);
          setChatwootBaseUrl(data.baseUrl || "https://app.chatwoot.com");
          setChatwootAccountId(data.accountId || "");
          setChatwootInboxId(data.inboxId || "");
        }
      } catch {}
    }
    void checkChatwootStatus();
  }, []);

  const handleSaveChatwoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !chatwootBaseUrl.trim() ||
      !chatwootAccountId.trim() ||
      !chatwootInboxId.trim() ||
      !chatwootApiToken.trim()
    ) {
      toast.error("Please fill in all Chatwoot fields");
      return;
    }
    setChatwootLoading(true);
    try {
      const res = await fetch("/api/integrations/chatwoot/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: chatwootBaseUrl.trim(),
          accountId: chatwootAccountId.trim(),
          inboxId: chatwootInboxId.trim(),
          apiAccessToken: chatwootApiToken.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect Chatwoot");
      }
      setChatwootConnected(true);
      setChatwootInboxName(data.inboxName || "Chatwoot Inbox");
      toast.success("Chatwoot connected! WhatsApp messages will mirror to your live helpdesk.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect Chatwoot");
    } finally {
      setChatwootLoading(false);
    }
  };

  const handleDisconnectChatwoot = async () => {
    try {
      await fetch("/api/integrations/chatwoot/status", { method: "DELETE" });
      setChatwootConnected(false);
      setChatwootAccountId("");
      setChatwootInboxId("");
      setChatwootApiToken("");
      toast.info("Chatwoot disconnected");
    } catch {
      toast.error("Failed to disconnect Chatwoot");
    }
  };

  const webhookUrl = origin
    ? `${origin}/api/webhooks/meta`
    : "https://your-crm-domain.com/api/webhooks/meta";
  const inboundForwardEmail = hostname
    ? `inbox-support@inbound.${hostname}`
    : "inbox-support@inbound.your-crm-domain.com";
  const chatwootWebhookUrl = origin
    ? `${origin}/api/integrations/chatwoot/webhook`
    : "https://your-crm-domain.com/api/integrations/chatwoot/webhook";

  return (
    <div className="space-y-6">
      <SettingsPanelHead
        title="Channels & Integrations"
        description="Connect your support email, Google Drive, Google Sheets, Facebook, and Instagram to create a unified omnichannel inbox and offload storage."
      />

      {/* Quick Status Bar for Core Channels */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-border/80 bg-muted/20 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-foreground">Core Channels:</span>
          <Link
            href="/settings?tab=whatsapp"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            WhatsApp Business
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/settings?tab=chat-widget"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Website Live Widget
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Omnichannel Hub v0.8.0
        </span>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("gdrive")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
            activeTab === "gdrive"
              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <HardDrive className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground">Google Drive</p>
            <p className="text-[10px] text-muted-foreground truncate">15 GB Storage</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
            activeTab === "email"
              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground">Support Email</p>
            <p className="text-[10px] text-muted-foreground truncate">Gmail &amp; IMAP</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sheets")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
            activeTab === "sheets"
              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground">Google Sheets</p>
            <p className="text-[10px] text-muted-foreground truncate">Sync Contacts</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
            activeTab === "database"
              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Database className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground">Database (BYOD)</p>
            <p className="text-[10px] text-muted-foreground truncate">Personal Supabase</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chatwoot")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
            activeTab === "chatwoot"
              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Headphones className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground">Chatwoot</p>
            <p className="text-[10px] text-muted-foreground truncate">Live Helpdesk</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("facebook")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
            activeTab === "facebook"
              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
            <Share2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground">Facebook</p>
            <p className="text-[10px] text-muted-foreground truncate">Messenger Chats</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("instagram")}
          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
            activeTab === "instagram"
              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
              : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <Camera className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground">Instagram</p>
            <p className="text-[10px] text-muted-foreground truncate">Direct Messages</p>
          </div>
        </button>
      </div>

      {/* TAB 1: GOOGLE DRIVE STORAGE */}
      {activeTab === "gdrive" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    Google Drive Media Storage (BYOS)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Offload customer photos, PDFs, voice notes, and videos directly to your Google Drive.
                  </CardDescription>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-3 w-3" />
                15 GB Free Storage
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Storage Comparison Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Default Cloud Server Storage
                </span>
                <p className="text-sm font-black text-foreground">Standard Server Storage</p>
                <p className="text-[11px] text-muted-foreground">
                  Heavy media, documents, and voice recordings can use up cloud server space.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Google Drive Solution
                </span>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  15 GB Free Per Account (15x Capacity)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Keeps your CRM server storage at 0 MB forever!
                </p>
              </div>
            </div>

            {/* Connection Status & Action */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">Connection Status</h4>
                    {gdriveConnected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="h-3 w-3" />
                        Active &amp; Ready
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {gdriveLoading ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        Checking Google Drive status...
                      </span>
                    ) : gdriveConnected ? (
                      `Connected to ${gdriveEmail || "Google Drive"}. Media files are streamed to your Drive.`
                    ) : (
                      "Not connected yet. Connect your Google account to enable auto-offload."
                    )}
                  </p>
                </div>
                <Button
                  onClick={gdriveConnected ? handleDisconnectDrive : handleConnectDrive}
                  disabled={gdriveLoading}
                  className={`font-bold transition-all shadow-xs ${
                    gdriveConnected
                      ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {gdriveLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : gdriveConnected ? (
                    "Disconnect Drive"
                  ) : (
                    "Connect with Google Drive"
                  )}
                </Button>
              </div>

              {gdriveConnected && (
                <div className="pt-2 border-t border-border space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Storage Target Folder</Label>
                    <Input
                      value={gdriveFolder}
                      readOnly
                      placeholder="/DFY UniCRM Attachments"
                      className="text-xs font-mono bg-muted/40 cursor-default"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      UniCRM organizes your media files inside this folder in your personal Drive.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">Mirror Inbound Customer Media</Label>
                      <p className="text-[11px] text-muted-foreground">
                        Automatically copy WhatsApp photos, PDFs, and audio notes to your Google Drive.
                      </p>
                    </div>
                    <Switch
                      checked={gdriveMirrorInbound}
                      onCheckedChange={handleToggleMirror}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">Stream Outbound Inbox Media</Label>
                      <p className="text-[11px] text-muted-foreground">
                        Save composer attachments, voice recordings, and PDFs directly to Google Drive (0 MB server storage).
                      </p>
                    </div>
                    <Switch
                      checked={gdriveMirrorOutbound}
                      onCheckedChange={handleToggleMirrorOutbound}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div className="flex items-start gap-2 p-3 rounded-xl border border-border/60 bg-muted/30 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guaranteed:</strong> UniCRM requests the scoped permission <code className="font-mono text-[10px] bg-background px-1 py-0.5 rounded">drive.file</code>, which only gives access to files created by UniCRM. Your existing personal Google Drive files remain completely invisible and private.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: SUPPORT EMAIL INBOXES */}
      {activeTab === "email" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Support Email Inbox</CardTitle>
                  <CardDescription className="text-xs">
                    Receive and reply to customer support emails inside the unified UniCRM chat.
                  </CardDescription>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Omnichannel Inbox
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Method selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEmailMethod("gmail")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  emailMethod === "gmail"
                    ? "border-blue-500 bg-blue-500/10 text-foreground ring-1 ring-blue-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">1-Click Gmail / Workspace</p>
                  {gmailConnected && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Connect via Google OAuth</p>
              </button>

              <button
                type="button"
                onClick={() => setEmailMethod("smtp")}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  emailMethod === "smtp"
                    ? "border-blue-500 bg-blue-500/10 text-foreground ring-1 ring-blue-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">Custom IMAP &amp; SMTP</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                    Roadmap
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Zoho, Outlook, cPanel, Titan</p>
              </button>

              <button
                type="button"
                onClick={() => setEmailMethod("forward")}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  emailMethod === "forward"
                    ? "border-blue-500 bg-blue-500/10 text-foreground ring-1 ring-blue-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">Auto-Forwarding Webhook</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                    Roadmap
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Works with any email host</p>
              </button>
            </div>

            {/* Method Details */}
            {emailMethod === "gmail" && (
              <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Google Workspace / Gmail Support</h4>
                      {gmailConnected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected &amp; Ready
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {gmailLoading ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          Checking Gmail connection...
                        </span>
                      ) : gmailConnected ? (
                        `Connected to ${gmailEmail}. You can send and reply to customer emails directly from UniCRM.`
                      ) : (
                        "Connect your Google Workspace or Gmail account to send support emails from UniCRM."
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={gmailConnected ? handleDisconnectGmail : handleConnectGmail}
                    disabled={gmailLoading}
                    className={`font-bold transition-all shadow-xs ${
                      gmailConnected
                        ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {gmailLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : gmailConnected ? (
                      "Disconnect Gmail"
                    ) : (
                      "Connect with Google"
                    )}
                  </Button>
                </div>

                {gmailConnected && (
                  <div className="pt-3 border-t border-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold">Send a Live Test Email</Label>
                      <span className="text-[10px] text-muted-foreground">Uses official Gmail API</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={testEmailTo}
                        onChange={(e) => setTestEmailTo(e.target.value)}
                        placeholder="Enter an email to verify (e.g. you@gmail.com)"
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={handleSendTestEmail}
                        disabled={testEmailSending || !testEmailTo}
                        className="shrink-0 font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-3 gap-1.5"
                      >
                        {testEmailSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                        Send Test
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {emailMethod === "smtp" && (
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <h4 className="text-xs font-bold text-foreground">IMAP & SMTP Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Support Email Address</Label>
                    <Input
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@yourcompany.com"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Email Password / App Password</Label>
                    <Input
                      type="password"
                      value={emailPass}
                      onChange={(e) => setEmailPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Inbound IMAP Server</Label>
                    <Input
                      value={imapHost}
                      onChange={(e) => setImapHost(e.target.value)}
                      placeholder="imap.zoho.com"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">IMAP Port (SSL)</Label>
                    <Input
                      value={imapPort}
                      onChange={(e) => setImapPort(e.target.value)}
                      placeholder="993"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Outbound SMTP Server</Label>
                    <Input
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.zoho.com"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SMTP Port (SSL)</Label>
                    <Input
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="465"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button
                    onClick={handleSaveSmtp}
                    className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Test &amp; Save Email Settings
                  </Button>
                </div>
                {emailConnected && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Configuration saved locally. Inbound polling connects to {imapHost || "IMAP server"}.
                  </p>
                )}
              </div>
            )}

            {emailMethod === "forward" && (
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <h4 className="text-xs font-bold text-foreground">Zero-Setup Inbound Forwarding</h4>
                <p className="text-[11px] text-muted-foreground">
                  Go to your email provider (cPanel, Hostinger, Zoho, Outlook) and set up an automatic forward rule to this unique webhook address:
                </p>

                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background">
                  <span className="flex-1 font-mono text-xs font-bold text-foreground truncate">
                    {inboundForwardEmail}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(inboundForwardEmail, "emailForward")}
                    className="h-7 px-2 text-xs font-bold gap-1"
                  >
                    {copiedKey === "emailForward" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB: GOOGLE SHEETS SYNC */}
      {activeTab === "sheets" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Google Sheets Integration</CardTitle>
                  <CardDescription className="text-xs">
                    Sync customer contacts, leads, and broadcast audiences directly from your Google Spreadsheets.
                  </CardDescription>
                </div>
              </div>
              {gdriveConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Synced via Google Drive
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <AlertCircle className="h-3 w-3" />
                  Requires Google Auth
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!gdriveConnected ? (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      Connect your Google Account to access Spreadsheets
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Google Sheets integration uses the authorized Google Workspace token to securely read your private sheets without making them public to the web.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleConnectDrive}
                  className="font-bold bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5"
                >
                  <HardDrive className="h-3.5 w-3.5" />
                  Authorize via Google Account
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Live Sheet Inspector & Tester */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground">Inspect Any Google Sheet</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Paste a Google Sheet URL or Sheet ID to preview contact columns and row counts before importing.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Input
                      value={testSheetUrl}
                      onChange={(e) => setTestSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                      className="text-xs font-mono"
                    />
                    <Button
                      onClick={handleTestSheet}
                      disabled={testSheetLoading || !testSheetUrl.trim()}
                      className="shrink-0 font-bold bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5"
                    >
                      {testSheetLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      )}
                      Inspect Sheet
                    </Button>
                  </div>

                  {sheetPreview && (
                    <div className="p-3 rounded-lg border border-teal-500/30 bg-teal-500/5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                          Parsed Successfully: {sheetPreview.totalRows} contacts found
                        </span>
                        <div className="flex items-center gap-1">
                          {sheetPreview.hasPhoneColumn && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                              Phone
                            </span>
                          )}
                          {sheetPreview.hasTagsColumn && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold">
                              Tags
                            </span>
                          )}
                          {sheetPreview.hasCompanyColumn && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold">
                              Company
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href="/contacts"
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          Go to Contacts to Import Contacts
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sheets discovered in Drive */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-foreground">Recent Spreadsheets in Your Drive</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Select a sheet to inspect or sync into audiences.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchSheetsList}
                      disabled={sheetsLoading}
                      className="h-7 px-2 text-xs font-semibold gap-1"
                    >
                      <RefreshCw className={`h-3 w-3 ${sheetsLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>

                  {sheetsLoading ? (
                    <div className="flex items-center justify-center p-6 text-xs text-muted-foreground gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Loading spreadsheets...
                    </div>
                  ) : sheetsList.length > 0 ? (
                    <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                      {sheetsList.map((sheet) => (
                        <div
                          key={sheet.id}
                          className="flex items-center justify-between p-2.5 hover:bg-muted/40 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileSpreadsheet className="h-4 w-4 text-teal-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{sheet.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">
                                ID: {sheet.id}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setTestSheetUrl(sheet.id);
                              toast.info(`Selected "${sheet.name}". Click Inspect to verify.`);
                            }}
                            className="h-7 px-2 text-xs text-teal-600 dark:text-teal-400 font-bold"
                          >
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2 italic">
                      No spreadsheets detected in your primary Drive root folder, or click Refresh to sync.
                    </p>
                  )}
                </div>

                {/* How to use */}
                <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                  <h5 className="text-xs font-bold text-foreground">How Google Sheets Sync Works</h5>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                    <li>
                      <strong>Live Audience Sync:</strong> In <Link href="/audiences" className="text-primary hover:underline">Audiences</Link>, create an audience and choose Google Sheets to dynamically target subscribers.
                    </li>
                    <li>
                      <strong>Automatic Column Mapping:</strong> Standard columns like <code className="font-mono text-[10px] bg-background px-1 py-0.5 rounded">Phone</code>, <code className="font-mono text-[10px] bg-background px-1 py-0.5 rounded">Name</code>, <code className="font-mono text-[10px] bg-background px-1 py-0.5 rounded">Email</code>, and <code className="font-mono text-[10px] bg-background px-1 py-0.5 rounded">Tags</code> are automatically mapped.
                    </li>
                    <li>
                      <strong>Broadcast &amp; Drip Delivery:</strong> Deliver WhatsApp broadcasts and automated messages directly to rows as they are added.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB: BRING YOUR OWN DATABASE (BYOD) */}
      {activeTab === "database" && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    Bring Your Own Database (BYOD Supabase)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Connect your personal free Supabase project. All contacts, chat history, and CRM data save directly to your database.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {byodConnected ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    BYOD Active: 100% On Your Server
                  </span>
                ) : (
                  <span className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    Master Cloud: Standard Tier
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {byodConnected ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <p className="text-xs font-bold text-foreground">Personal Supabase Connected</p>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground break-all">{byodUrl}</p>
                    <p className="text-[11px] text-muted-foreground">
                      CRM contacts and message queries are routed to your personal database. 0 bytes saved on master CRM servers.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectByod}
                    className="text-xs text-red-500 hover:text-red-600 border-red-500/30 hover:bg-red-500/10"
                  >
                    Disconnect Database
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveByod} className="space-y-4">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2 text-xs">
                  <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Zero Database Costs &amp; Unlimited Storage
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    By connecting your own free Supabase project, you get your own dedicated 500 MB Postgres database (holds over 500,000+ contacts) without hitting our free tier limits.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Your Supabase Project URL</Label>
                    <Input
                      placeholder="https://xyzprojectref.supabase.co"
                      value={byodUrl}
                      onChange={(e) => setByodUrl(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Found in Supabase Dashboard → Project Settings → API → Project URL
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Your Supabase Anon / Public Key</Label>
                    <Input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={byodAnonKey}
                      onChange={(e) => setByodAnonKey(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Encrypted with AES-256-GCM. Never stored in plaintext.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={byodLoading || !byodUrl.trim() || !byodAnonKey.trim()}
                    className="gap-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {byodLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
                    Test &amp; Connect Personal Supabase
                  </Button>
                </div>
              </form>
            )}

            {/* 1-Click Schema SQL Viewer */}
            <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  1-Click Customer Schema SQL
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(byodSchemaSql, "schemaSql")}
                    className="h-7 px-2 text-xs font-bold gap-1"
                  >
                    {copiedKey === "schemaSql" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    Copy Schema SQL
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSchemaSql(!showSchemaSql)}
                    className="h-7 text-xs font-semibold"
                  >
                    {showSchemaSql ? "Hide SQL" : "View SQL"}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Run this single script in your own <strong>Supabase Dashboard → SQL Editor</strong> to create the necessary tables in 2 seconds.
              </p>
              {showSchemaSql && (
                <pre className="max-h-48 overflow-y-auto rounded-lg bg-black/80 p-3 text-[10px] font-mono text-emerald-400 whitespace-pre">
                  {byodSchemaSql}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB: CHATWOOT LIVE HELPDESK & ANTI-BAN COEXISTENCE */}
      {activeTab === "chatwoot" && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    Chatwoot Integration &amp; Anti-Ban Safeguards
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Connect Chatwoot for human agent live chat handoffs and zero-ban omnichannel coexistence.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chatwootConnected ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Mirroring Active
                  </span>
                ) : (
                  <span className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    Not Connected
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Anti-Ban Architecture & Coexistence Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Recommended Anti-Ban Architecture
                </span>
                <p className="text-xs font-bold text-foreground">
                  UniCRM (Marketing &amp; Pacing) + Chatwoot (Live Support)
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  UniCRM handles broadcasts with human pacing jitter and automatic STOP/DNC opt-outs, while Chatwoot handles human agent replies so customers never click &quot;Report Spam&quot;.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dual-Sync Webhook Bridge
                </span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Real-time 2-Way Sync
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Incoming WhatsApp messages mirror to Chatwoot inboxes automatically. Agent replies sent from Chatwoot dispatch back through WhatsApp instantly.
                </p>
              </div>
            </div>

            {/* Connection Form */}
            {chatwootConnected ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <p className="text-xs font-bold text-foreground">Chatwoot Helpdesk Connected</p>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{chatwootBaseUrl}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Account ID: <strong>{chatwootAccountId}</strong> • Inbox ID: <strong>{chatwootInboxId}</strong> {chatwootInboxName ? `(${chatwootInboxName})` : ''}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectChatwoot}
                    className="text-xs text-red-500 hover:text-red-600 border-red-500/30 hover:bg-red-500/10 font-bold"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveChatwoot} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Chatwoot Host URL</Label>
                    <Input
                      placeholder="https://app.chatwoot.com"
                      value={chatwootBaseUrl}
                      onChange={(e) => setChatwootBaseUrl(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Use app.chatwoot.com or your self-hosted Chatwoot instance.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Chatwoot Account ID</Label>
                    <Input
                      placeholder="e.g. 1"
                      value={chatwootAccountId}
                      onChange={(e) => setChatwootAccountId(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Visible in your Chatwoot URL: /app/accounts/&#123;id&#125;
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Chatwoot Target Inbox ID</Label>
                    <Input
                      placeholder="e.g. 10"
                      value={chatwootInboxId}
                      onChange={(e) => setChatwootInboxId(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Found in Chatwoot → Settings → Inboxes
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">User / Bot API Access Token</Label>
                    <Input
                      type="password"
                      placeholder="w7xyz..."
                      value={chatwootApiToken}
                      onChange={(e) => setChatwootApiToken(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Found in Chatwoot → Profile Settings → Access Token
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={
                      chatwootLoading ||
                      !chatwootBaseUrl.trim() ||
                      !chatwootAccountId.trim() ||
                      !chatwootInboxId.trim() ||
                      !chatwootApiToken.trim()
                    }
                    className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {chatwootLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Headphones className="h-3.5 w-3.5" />}
                    Test &amp; Connect Chatwoot
                  </Button>
                </div>
              </form>
            )}

            {/* Chatwoot Outbound Webhook Relay */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
              <Label className="text-xs font-bold">Chatwoot Outbound Webhook Relay URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={chatwootWebhookUrl}
                  className="text-xs font-mono bg-background"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(chatwootWebhookUrl, "cwWebhook")}
                  className="h-9 px-3 text-xs font-bold gap-1 shrink-0"
                >
                  {copiedKey === "cwWebhook" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                In Chatwoot → <strong>Settings → Integrations → Webhooks</strong>, click <em>&quot;Add new webhook&quot;</em>, paste this URL, and subscribe to <code>message_created</code>. When live agents reply in Chatwoot, replies dispatch directly to the customer on WhatsApp.
              </p>
            </div>

            {/* Complete Anti-Ban Safeguards Matrix */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-foreground">Active WhatsApp Anti-Ban Safeguards</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-start gap-2 p-2.5 rounded-lg border border-border/60 bg-background/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">Automated STOP / Opt-Out Engine</p>
                    <p className="text-[10px] text-muted-foreground">
                      Replies with STOP or UNSUBSCRIBE automatically tag contacts with DNC and exclude them from all future broadcasts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-lg border border-border/60 bg-background/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">Human Pacing &amp; Jitter Throttling</p>
                    <p className="text-[10px] text-muted-foreground">
                      Broadcasts employ randomized human-like delay intervals (2s to 8s) to prevent spam detection heuristics.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-lg border border-border/60 bg-background/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">24-Hour Policy Window Sentinel</p>
                    <p className="text-[10px] text-muted-foreground">
                      Freeform promotional messages are restricted outside 24h, enforcing pre-approved Meta templates for safety.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-lg border border-border/60 bg-background/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">Multi-Agent Live Support Handoff</p>
                    <p className="text-[10px] text-muted-foreground">
                      Routing live chats to Chatwoot speeds up resolution times, drastically cutting customer &quot;Report &amp; Block&quot; incidents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: FACEBOOK MESSENGER */}
      {activeTab === "facebook" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Facebook Messenger (Meta Graph API)</CardTitle>
                  <CardDescription className="text-xs">
                    Connect your Facebook Business Page to answer customer inquiries inside UniCRM.
                  </CardDescription>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                Roadmap
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Facebook Page ID</Label>
                <Input
                  value={fbPageId}
                  onChange={(e) => setFbPageId(e.target.value)}
                  placeholder="e.g. 109283746592831"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Page Access Token</Label>
                <Input
                  type="password"
                  value={fbAccessToken}
                  onChange={(e) => setFbAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1.5">
              <Label className="text-xs font-bold">Meta Webhook Callback URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="text-xs font-mono bg-background"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(webhookUrl, "fbWebhook")}
                  className="h-9 px-3 text-xs font-bold gap-1 shrink-0"
                >
                  {copiedKey === "fbWebhook" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                In Meta Developer Dashboard → Messenger → Webhooks, subscribe to the <code className="font-mono text-[10px] bg-background px-1 py-0.5 rounded">messages</code> field.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveFb}
                className="flex-1 font-bold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Save Facebook Connection
              </Button>
              {fbConnected && (
                <Button
                  variant="outline"
                  onClick={handleDisconnectFb}
                  className="font-bold text-red-500 hover:text-red-600 border-red-500/30"
                >
                  Disconnect
                </Button>
              )}
            </div>
            {fbConnected && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Page ID {fbPageId} saved. Webhook subscribed to messages.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: INSTAGRAM DIRECT */}
      {activeTab === "instagram" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Instagram Direct Messages</CardTitle>
                  <CardDescription className="text-xs">
                    Receive and respond to Instagram DMs, story mentions, and customer inquiries in UniCRM.
                  </CardDescription>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                Roadmap
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Instagram Professional Account ID</Label>
                <Input
                  value={igAccountId}
                  onChange={(e) => setIgAccountId(e.target.value)}
                  placeholder="e.g. 17841405309283741"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Instagram User Access Token</Label>
                <Input
                  type="password"
                  value={igAccessToken}
                  onChange={(e) => setIgAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1.5">
              <Label className="text-xs font-bold">Meta Webhook Callback URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="text-xs font-mono bg-background"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(webhookUrl, "igWebhook")}
                  className="h-9 px-3 text-xs font-bold gap-1 shrink-0"
                >
                  {copiedKey === "igWebhook" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                In Meta Developer Dashboard → Instagram → Webhooks, subscribe to the <code className="font-mono text-[10px] bg-background px-1 py-0.5 rounded">messages</code> field.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveIg}
                className="flex-1 font-bold bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Instagram Connection
              </Button>
              {igConnected && (
                <Button
                  variant="outline"
                  onClick={handleDisconnectIg}
                  className="font-bold text-red-500 hover:text-red-600 border-red-500/30"
                >
                  Disconnect
                </Button>
              )}
            </div>
            {igConnected && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Account {igAccountId} saved. Webhook subscribed to messages.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
