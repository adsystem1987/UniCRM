import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Contact Support Desk — DFY UniCRM",
  description: "Get in touch with the DFY UniCRM support team at ravibabuche@dfydude.online.",
};

export default function ContactPage() {
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
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Contact Support Desk</h1>
              <p className="text-xs text-muted-foreground">Inquiries are sent to ravibabuche@dfydude.online</p>
            </div>
          </div>

          <form action="/api/contact" method="POST" className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                name="name"
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
                rows={4}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="How can we help your business?"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                Submit Support Request
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>We usually respond within 1–4 business hours.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
