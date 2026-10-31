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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <p className="text-sm text-slate-500">Processing profile deletion and permanent unsubscribe...</p>
          </div>
        ) : success ? (
          <div>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile Deleted</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {message} Your email has been permanently added to our do-not-contact suppression list.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Notice</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OptOutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>}>
      <OptOutContent />
    </Suspense>
  );
}
