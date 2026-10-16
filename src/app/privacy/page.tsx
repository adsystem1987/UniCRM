import Link from "next/link";
import { ArrowLeft, Lock, Database, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy — UniCRM",
  description: "Privacy Policy and Data Protection principles of UniCRM.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">UniCRM Privacy</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Effective Date: October 16, 2026 • Your data belongs to you.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-500" />
              1. Your Data Ownership & Tenancy Isolation
            </h2>
            <p className="mt-2">
              UniCRM is architected with strict multi-tenant Row-Level Security (RLS). You retain full ownership of all customer contacts, conversations, notes, pipelines, and tags imported or generated through your account. <strong>We do not sell, rent, monetize, or harvest your customer data.</strong>
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-500" />
              2. Encryption & Credentials Security
            </h2>
            <p className="mt-2">
              Sensitive credentials—such as Meta WhatsApp permanent system tokens, Web Gateway keys, and third-party AI keys—are encrypted at rest using AES-256-GCM encryption before storage. Server-side secrets are never exposed to browser clients.
            </p>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-emerald-500" />
              3. AI Data Handling & Telemetry
            </h2>
            <p className="mt-2">
              When utilizing AI draft suggestions or automated replies via the UniCRM Free Gateway or your own provider keys, message context is transmitted strictly to complete the prompt and is not used to train global public models. You can disable AI features on any individual conversation thread at any time.
            </p>
          </section>
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/terms">
            <Button variant="outline" className="gap-2">
              &larr; View Terms of Service
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
