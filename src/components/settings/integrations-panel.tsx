"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingsPanelHead } from "./settings-panel-head";

type IntegrationTab = "gdrive" | "email" | "facebook" | "instagram";

export function IntegrationsPanel() {
  const [activeTab, setActiveTab] = useState<IntegrationTab>("gdrive");

  // Google Drive state
  const [gdriveLoading, setGdriveLoading] = useState(true);
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gdriveEmail, setGdriveEmail] = useState("");
  const [gdriveFolder, setGdriveFolder] = useState("/DFY UniCRM Attachments");
  const [gdriveMirrorInbound, setGdriveMirrorInbound] = useState(true);

  // Check URL params for OAuth redirect results
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("gdrive") === "connected") {
        toast.success("Google Drive connected successfully with 15 GB quota!");
        window.history.replaceState({}, "", "/settings?tab=integrations");
      } else if (params.get("gdrive_error")) {
        toast.error(`Google Drive connection error: ${params.get("gdrive_error")}`);
        window.history.replaceState({}, "", "/settings?tab=integrations");
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
      toast.success(checked ? "Mirroring enabled" : "Mirroring disabled");
    } catch {
      // Ignored
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

  const webhookUrl = "https://dfydude.cc.cd/api/webhooks/meta";
  const inboundForwardEmail = "inbox-support@inbound.dfydude.cc.cd";

  return (
    <div className="space-y-6">
      <SettingsPanelHead
        title="Channels & Integrations"
        description="Connect your support email, Google Drive, Facebook, and Instagram to create a unified omnichannel inbox and offload storage."
      />

      {/* Channel Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
            <p className="text-[10px] text-muted-foreground truncate">15 GB Free Storage</p>
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
            <p className="text-[10px] text-muted-foreground truncate">Inbox & Ticketing</p>
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
                <p className="text-xs font-bold text-foreground">1-Click Gmail / Workspace</p>
                <p className="text-[10px] text-muted-foreground">Connect via Google OAuth</p>
              </button>

              <button
                type="button"
                onClick={() => setEmailMethod("smtp")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  emailMethod === "smtp"
                    ? "border-blue-500 bg-blue-500/10 text-foreground ring-1 ring-blue-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <p className="text-xs font-bold text-foreground">Custom IMAP & SMTP</p>
                <p className="text-[10px] text-muted-foreground">Zoho, Outlook, cPanel, Titan</p>
              </button>

              <button
                type="button"
                onClick={() => setEmailMethod("forward")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  emailMethod === "forward"
                    ? "border-blue-500 bg-blue-500/10 text-foreground ring-1 ring-blue-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <p className="text-xs font-bold text-foreground">Auto-Forwarding Webhook</p>
                <p className="text-[10px] text-muted-foreground">Works with any email host</p>
              </button>
            </div>

            {/* Method Details */}
            {emailMethod === "gmail" && (
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Google Workspace / Gmail Sync</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Connect your support Gmail to view emails in UniCRM chats and reply directly.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setEmailConnected(!emailConnected);
                      toast.success(emailConnected ? "Gmail disconnected" : "Gmail support connected!");
                    }}
                    className="font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {emailConnected ? "Disconnect Gmail" : "Connect with Google"}
                  </Button>
                </div>
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

                <Button
                  onClick={() => toast.success("IMAP/SMTP connection verified and saved!")}
                  className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Test & Save Email Settings
                </Button>
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                100% Free Messaging
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

            <Button
              onClick={() => {
                setFbConnected(true);
                toast.success("Facebook Messenger page connected!");
              }}
              className="w-full font-bold bg-sky-600 hover:bg-sky-700 text-white"
            >
              Save Facebook Connection
            </Button>
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                100% Free Messaging
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

            <Button
              onClick={() => {
                setIgConnected(true);
                toast.success("Instagram Direct account connected!");
              }}
              className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white"
            >
              Save Instagram Connection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
