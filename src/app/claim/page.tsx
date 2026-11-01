"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Building2, Loader2, AlertCircle } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Verifying your invitation…</p>
        </div>
      </div>
    );
  }

  if (error || !claimDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Link Expired</h2>
          <p className="text-sm text-muted-foreground mb-8">
            {error || "This invitation link may have expired or already been claimed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors"
          >
            Back to UniCRM
          </Link>
        </div>
      </div>
    );
  }

  if (claimedSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-600/10 text-emerald-600 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">You're In.</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Taking you to your dashboard now…
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-8">
      <div className="mx-auto w-full max-w-md text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Step Inside Your CRM
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your workspace is pre-configured and waiting. Set a password to go live.
        </p>
      </div>

      <div className="mt-8 mx-auto w-full max-w-lg">
        <div className="bg-card py-8 px-6 sm:rounded-2xl border border-border sm:px-10">
          {/* Business Details Preview */}
          <div className="rounded-xl bg-muted border border-border p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{claimDetails.businessName}</h3>
                <p className="text-xs text-muted-foreground">
                  {claimDetails.email} · {claimDetails.category}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Free forever · Unlimited contacts · No credit card
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Choose a Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Activate Now"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              href={`/opt-out?token=${token}`}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
      <ClaimContent />
    </Suspense>
  );
}
