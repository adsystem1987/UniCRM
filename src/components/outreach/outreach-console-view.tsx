"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Send,
  Building2,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  Search,
  Check,
  Eye,
  MailCheck,
  Bot,
} from "lucide-react";

interface OutreachMetric {
  totalSent: number;
  openedCount: number;
  openRate: string;
  claimedCount: number;
  pendingCount: number;
  bouncedCount: number;
  optedOutCount: number;
  suppressedTotal: number;
  conversionRate: string;
}

interface ClaimTokenRecord {
  id: string;
  token: string;
  email: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  category: string;
  city: string | null;
  page_slug: string;
  status: "pending" | "claimed" | "opted_out" | "expired" | "bounced";
  created_at: string;
  opened_at?: string | null;
  bounced_at?: string | null;
  bounce_reason?: string | null;
  followup_count?: number;
  last_followup_at?: string | null;
  claimed_at: string | null;
  opted_out_at: string | null;
}

interface FollowUpCandidate {
  id: string;
  token: string;
  email: string;
  business_name: string;
  contact_name: string | null;
  category: string;
  city: string | null;
  opened_at: string | null;
  followup_count: number;
  draftSubject: string;
  draftMessage: string;
}

const CATEGORIES = [
  { value: "d2c", label: "🛍️ D2C Brand & E-Commerce Catalog" },
  { value: "real_estate", label: "🏠 Real Estate & Property Brokers" },
  { value: "loan_provider", label: "💰 Loan Agents & Financial DSAs" },
  { value: "education", label: "🎓 Study Abroad & Visa Consultants" },
  { value: "legal", label: "⚖️ CA, Tax & Legal Advisors" },
  { value: "solar", label: "☀️ Solar & Home Contractors" },
  { value: "healthcare", label: "🏥 Clinics & Doctors" },
  { value: "general", label: "🏢 General Professional Services" },
];

export function OutreachConsoleView() {
  const { isPlatformOwner } = useAuth();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<OutreachMetric | null>(null);
  const [records, setRecords] = useState<ClaimTokenRecord[]>([]);

  // Agentic Follow-Up Candidates (Option A: Review & 1-Click Approve)
  const [candidates, setCandidates] = useState<FollowUpCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Form inputs for 1-Click invite
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("real_estate");
  const [city, setCity] = useState("Bangalore");
  const [isTestMode, setIsTestMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/outreach/stats");
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
        setRecords(data.tokens || []);
      }
    } catch (err) {
      console.error("Failed to load outreach stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowupCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await fetch("/api/outreach/followup/candidates");
      const data = await res.json();
      if (data.candidates) {
        setCandidates(data.candidates);
      }
    } catch (err) {
      console.error("Failed to load follow-up candidates:", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchFollowupCandidates();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !businessName) return;

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch("/api/integrations/profiles/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          contactName,
          email,
          phone,
          category,
          city,
          isTest: isTestMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitFeedback({
          success: true,
          msg: isTestMode
            ? `Test copy sent to brosir2019@gmail.com for review! Pre-provisioned URL: ${data.pageUrl}`
            : `Success! Pre-provisioned workspace & invitation sent to ${email}`,
        });
        setBusinessName("");
        setContactName("");
        setEmail("");
        setPhone("");
        fetchData();
      } else {
        setSubmitFeedback({
          success: false,
          msg: data.error || "Failed to dispatch invitation.",
        });
      }
    } catch (err: any) {
      setSubmitFeedback({
        success: false,
        msg: err.message || "Network error sending invitation.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveNudge = async (candidate: FollowUpCandidate, sendAsTest: boolean) => {
    setApprovingId(candidate.id);
    try {
      const res = await fetch("/api/outreach/followup/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: candidate.id,
          subject: candidate.draftSubject,
          message: candidate.draftMessage,
          isTestMode: sendAsTest,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(sendAsTest ? "Test nudge dispatched to brosir2019@gmail.com!" : "Follow-up dispatched successfully!");
        if (!sendAsTest) {
          setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
          fetchData();
        }
      } else {
        alert(data.error || "Failed to dispatch follow-up.");
      }
    } catch (err: any) {
      alert("Error sending follow-up: " + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredRecords = records.filter(
    (r) =>
      r.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isPlatformOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <ShieldCheck className="w-12 h-12 text-muted-foreground mb-3" />
        <h2 className="text-xl font-bold text-foreground">Platform Owner Access Required</h2>
        <p className="text-sm text-muted-foreground max-w-md mt-1">
          The Cold Outreach & Workspace Provisioning Command Center is restricted to platform administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-1">
            Platform Owner Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Cold Outreach & Workspace Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-provision free digital storefronts and invite service providers across India via AWS SES.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchData();
              fetchFollowupCandidates();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-muted hover:bg-muted-foreground/10 text-foreground transition-colors shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh Telemetry"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <Send className="w-3.5 h-3.5" /> Dispatched
          </div>
          <div className="text-2xl font-bold text-foreground mt-1.5">
            {metrics?.totalSent ?? "..."}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium">
            <Eye className="w-3.5 h-3.5" /> Opened Emails
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1.5">
            {metrics?.openedCount ?? "0"}{" "}
            <span className="text-xs font-normal text-blue-500">({metrics?.openRate ?? "0%"})</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
            {metrics?.claimedCount ?? "..."}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Pending
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">
            {metrics?.pendingCount ?? "..."}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-rose-500 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Bounced
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1.5">
            {metrics?.bouncedCount ?? "0"}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <Trash2 className="w-3.5 h-3.5" /> Opted-Out
          </div>
          <div className="text-2xl font-bold text-muted-foreground mt-1.5">
            {metrics?.optedOutCount ?? "0"}
          </div>
        </div>
      </div>

      {/* Option A: Agentic Follow-Up Review Panel */}
      <div className="bg-linear-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                Agentic Follow-Up Queue (Review & 1-Click Approve)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {candidates.length} Ready
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                OmniRoute AI drafted warm, personalized follow-ups for leads sent &gt; 48h ago who haven&apos;t claimed yet.
              </p>
            </div>
          </div>
          <button
            onClick={fetchFollowupCandidates}
            disabled={loadingCandidates}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {loadingCandidates ? "Generating drafts..." : "Re-scan Queue"}
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="p-4 bg-card/60 rounded-xl text-center text-xs text-muted-foreground">
            {loadingCandidates ? "Agent is analyzing outreach history and drafting nudges..." : "All caught up! No unclaimed leads are past the 48-hour follow-up threshold."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-foreground">{c.business_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.opened_at ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground border border-border"}`}>
                      {c.opened_at ? "👁️ Viewed Email" : "✉️ Unopened"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mb-2">
                    To: {c.email} • Follow-up #{c.followup_count + 1}
                  </div>
                  <div className="p-3 bg-muted/70 rounded-lg text-xs border border-border mb-3">
                    <div className="font-semibold text-foreground mb-1">
                      Subject: {c.draftSubject}
                    </div>
                    <div className="text-foreground/80 whitespace-pre-wrap text-[11px] leading-relaxed">
                      {c.draftMessage}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <button
                    disabled={approvingId === c.id}
                    onClick={() => handleApproveNudge(c, true)}
                    className="px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:bg-muted rounded transition-colors"
                  >
                    Test Preview
                  </button>
                  <button
                    disabled={approvingId === c.id}
                    onClick={() => handleApproveNudge(c, false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    {approvingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Approve & Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1-Click Provision & Dispatch Form */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-foreground">
            1-Click Workspace Provision & Inviter
          </h2>
        </div>

        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Business / Brand Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Prestige Horizon Realty"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-muted/50 text-foreground outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Contact Person (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Malhotra"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-muted/50 text-foreground outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Owner Email *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. vikram@prestigehorizon.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-muted/50 text-foreground outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-muted/50 text-foreground outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Industry / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-muted/50 text-foreground outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="Bangalore, Mumbai, Delhi..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-muted/50 text-foreground outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border/60">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground/90">
              <input
                type="checkbox"
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Test Mode: Route preview copy to <strong>brosir2019@gmail.com</strong>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !email || !businessName}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Provisioning & Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Provision Workspace & Send Invite
                </>
              )}
            </button>
          </div>

          {submitFeedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                submitFeedback.success
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {submitFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {submitFeedback.msg}
            </div>
          )}
        </form>
      </div>

      {/* Live Outreach Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-foreground text-base">Outreach History & Claim Log</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time status of all pre-provisioned invitations</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search business or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-muted/50 text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <th className="py-3 px-4">Business & City</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Engagement Status</th>
                <th className="py-3 px-4">Public Page</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No outreach records match your filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const claimLink = `https://dfyunicrm.com/claim?token=${r.token}`;
                  const pageLink = `https://dfyunicrm.com/p/${r.page_slug}`;

                  return (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{r.business_name}</div>
                        <div className="text-[11px] text-muted-foreground">{r.city || "India"}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{r.contact_name || "Owner"}</div>
                        <div className="text-[11px] text-muted-foreground">{r.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-foreground/80">
                          {r.category?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {r.status === "claimed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Claimed
                          </span>
                        ) : r.status === "bounced" || r.bounced_at ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
                            <AlertCircle className="w-3 h-3" /> Bounced
                          </span>
                        ) : r.status === "opted_out" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                            <Trash2 className="w-3 h-3" /> Opted Out
                          </span>
                        ) : r.opened_at ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                            <Eye className="w-3 h-3" /> Opened {r.followup_count ? `(Nudge #${r.followup_count})` : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <Clock className="w-3 h-3" /> Sent / Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={pageLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                        >
                          View Storefront <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => copyToClipboard(claimLink, r.token)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-muted hover:bg-muted-foreground/10 text-foreground transition-colors"
                        >
                          {copiedToken === r.token ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Claim Link
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
