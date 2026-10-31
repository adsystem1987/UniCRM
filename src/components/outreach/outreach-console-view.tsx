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
  Filter,
  Check,
} from "lucide-react";

interface OutreachMetric {
  totalSent: number;
  claimedCount: number;
  pendingCount: number;
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
  status: "pending" | "claimed" | "opted_out" | "expired";
  created_at: string;
  claimed_at: string | null;
  opted_out_at: string | null;
}

const CATEGORIES = [
  { value: "real_estate", label: "🏠 Real Estate & Property Brokers" },
  { value: "loan_provider", label: "💰 Loan Agents & Financial DSAs" },
  { value: "education", label: "🎓 Study Abroad & Visa Consultants" },
  { value: "legal", label: "⚖️ CA, Tax & Legal Advisors" },
  { value: "solar", label: "☀️ Solar & Home Contractors" },
  { value: "healthcare", label: "🏥 Clinics & Doctors" },
  { value: "general", label: "🏢 General Professional Services" },
];

export function OutreachConsoleView() {
  const { isPlatformOwner, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<OutreachMetric | null>(null);
  const [records, setRecords] = useState<ClaimTokenRecord[]>([]);

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !email.trim()) {
      alert("Please provide at least Business Name and Email.");
      return;
    }

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch("/api/integrations/profiles/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer dfy-openclaw-secret-key-2026",
        },
        body: JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim() || undefined,
          email: email.trim(),
          phone: phone.trim() || undefined,
          category,
          city: city.trim() || undefined,
          isTest: isTestMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitFeedback({
          success: true,
          msg: isTestMode
            ? `Test copy sent to brosir2019@gmail.com! Claim link: ${data.claimUrl}`
            : `Invitation email sent via AWS SES to ${email.trim()}!`,
        });
        // Reset form
        setBusinessName("");
        setContactName("");
        setEmail("");
        setPhone("");
        fetchData();
      } else {
        setSubmitFeedback({
          success: false,
          msg: data.error || data.reason || "Failed to dispatch invitation.",
        });
      }
    } catch {
      setSubmitFeedback({
        success: false,
        msg: "Network error sending invitation.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (!isPlatformOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Owner Restricted</h2>
        <p className="text-sm text-slate-500 max-w-md mt-2">
          The Cold Outreach & User Acquisition Engine is reserved exclusively for the platform owner ({profile?.email || "Super Admin"}).
        </p>
      </div>
    );
  }

  const filteredRecords = records.filter(
    (r) =>
      r.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Owner Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cold Outreach & Workspace Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pre-provision free digital storefronts and invite service providers across India via AWS SES.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh Telemetry"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Send className="w-3.5 h-3.5" /> Total Dispatched
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics?.totalSent ?? "..."}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Workspaces Claimed
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics?.claimedCount ?? "..."}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Pending Claims
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {metrics?.pendingCount ?? "..."}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
            <Trash2 className="w-3.5 h-3.5" /> Opted-Out / Suppressed
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            {metrics?.suppressedTotal ?? "..."}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Claim Rate
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {metrics?.conversionRate ?? "0%"}
          </div>
        </div>
      </div>

      {/* 1-Click Dispatcher Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white mb-4">
          <Building2 className="w-5 h-5 text-emerald-600" />
          1-Click Lead Provisioning & Invitation
        </div>

        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Shree Balaji Properties"
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="broker@business.com"
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp / Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Industry Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore, Mumbai, Pune"
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Send preview copy first to brosir2019@gmail.com
              </span>{" "}
              (tagged as [Test])
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Workspace Invitation
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Outreach History & Claim Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status of all pre-provisioned invitations</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search business or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-3 px-4">Business & City</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Public Page</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No outreach records match your filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const claimLink = `https://dfyunicrm.com/claim?token=${r.token}`;
                  const pageLink = `https://dfyunicrm.com/p/${r.page_slug}`;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{r.business_name}</div>
                        <div className="text-[11px] text-slate-400">{r.city || "India"}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{r.contact_name || "Owner"}</div>
                        <div className="text-[11px] text-slate-400">{r.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-slate-600 dark:text-slate-300">
                          {r.category?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {r.status === "claimed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Claimed
                          </span>
                        ) : r.status === "opted_out" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                            <Trash2 className="w-3 h-3" /> Opted Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <Clock className="w-3 h-3" /> Pending
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
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
