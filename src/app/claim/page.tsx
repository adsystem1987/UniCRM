"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles, Building2, ArrowRight, Loader2, AlertCircle } from "lucide-react";

interface ClaimDetails {
  businessName: string;
  contactName: string;
  email: string;
  category: string;
  pageSlug: string;
  city?: string;
}

function ClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [claimDetails, setClaimDetails] = useState<ClaimDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claimedSuccess, setClaimedSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Missing or invalid claim link.");
      setLoading(false);
      return;
    }

    // Fetch token details
    fetch(`/api/claim?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClaimDetails(data);
        }
      })
      .catch(() => setError("Failed to verify invitation link."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimedSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        alert(data.error || "Failed to activate workspace.");
      }
    } catch {
      alert("Something went wrong activating your workspace.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Verifying your workspace invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !claimDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invitation Unavailable</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {error || "This invitation link may have expired or already been claimed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Go to UniCRM Home
          </Link>
        </div>
      </div>
    );
  }

  if (claimedSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Workspace Activated!</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Welcome to UniCRM, {claimDetails.businessName}! Redirecting you to your inbox...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          Pre-Configured Workspace Reserved
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Claim Your Free Workspace
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          100% Free Core Software • WhatsApp CRM & Lead Inbox
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10">
          {/* Business Details Preview */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{claimDetails.businessName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {claimDetails.email} • {claimDetails.category}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Free forever • Unlimited contacts • Zero credit card
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Set a Password to Activate
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Activate My Free Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href={`/opt-out?token=${token}`}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Don't want this workspace? Delete profile & opt-out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
      <ClaimContent />
    </Suspense>
  );
}
