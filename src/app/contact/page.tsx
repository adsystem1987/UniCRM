"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("General Inquiry");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successName, setSuccessName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") {
        setSuccess(true);
        setSuccessName(params.get("name") || "Friend");
      }
      if (params.get("error")) {
        setError("Please fill out all required fields.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill out your name, email, and message.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          topic,
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setSuccess(true);
      setSuccessName(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="DFY UniCRM"
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-foreground">DFY UniCRM</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 font-semibold text-xs">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-12">
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
          {success ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-foreground">Request Received in Real Time!</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you, <span className="font-semibold text-foreground">{successName}</span>! Your message has been routed to our support desk. We will respond within 1–4 business hours.
                </p>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setMessage("");
                  }}
                  variant="outline"
                  className="w-full sm:w-auto font-semibold"
                >
                  Send Another Inquiry
                </Button>
                <Link href="/" className="w-full sm:w-auto">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    Back to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-foreground">Contact Support Desk</h1>
                  <p className="text-xs text-muted-foreground">Inquiries are sent to ravibabuche@dfydude.online</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} action="/api/contact" method="POST" className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Your Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Ravi Kumar"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="ravi@company.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="topic" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Topic
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="General Inquiry">General Question about UniCRM</option>
                    <option value="Optional Pro Support (₹1,000/mo)">Optional Done-For-You Pro Setup (₹1,000/mo)</option>
                    <option value="Technical Help">Technical Help / Bug Report</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="How can we help your business?"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting in Real Time...
                      </span>
                    ) : (
                      "Submit Support Request"
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>We usually respond within 1–4 business hours.</span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
