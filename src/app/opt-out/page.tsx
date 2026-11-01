"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trash2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

function OptOutContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing opt-out link.");
      setLoading(false);
      return;
    }

    // Automatically trigger one-click deletion and suppression
    fetch("/api/opt-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          setMessage(data.message || "Your profile and data have been permanently deleted.");
        } else {
          setError(data.error || "Failed to process opt-out.");
        }
      })
      .catch(() => setError("Something went wrong processing your request."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Processing your request…</p>
          </div>
        ) : success ? (
          <div>
            <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center mb-5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">All Done. You're Removed.</h2>
            <p className="text-sm text-foreground mb-8 leading-relaxed">
              We've permanently deleted your data and added your email to our do-not-contact list. You won't hear from us again.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-opacity"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center mb-5">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Something Went Wrong</h2>
            <p className="text-sm text-foreground mb-8 leading-relaxed">
              {error}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-opacity"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OptOutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
      <OptOutContent />
    </Suspense>
  );
}
