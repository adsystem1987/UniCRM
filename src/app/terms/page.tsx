import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service — UniCRM",
  description: "Terms of Service, Acceptable Use Policy, and Provider Disclaimers for UniCRM.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">UniCRM Legal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Terms of Service &amp; Disclaimer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Effective Date: October 16, 2026 • Please read carefully before using UniCRM.
          </p>
        </div>

        <div className="max-w-none space-y-10">
          {/* Section 1 */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              1. Free &amp; Community Software Service (&quot;AS-IS&quot;)
            </h2>
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
              UniCRM is an open-source, community-supported customer relationship management (CRM) platform provided completely free of charge. The software and services are provided strictly on an <strong>&quot;AS-IS&quot;</strong> and <strong>&quot;AS-AVAILABLE&quot;</strong> basis without warranties of any kind, whether express, implied, statutory, or otherwise. We do not guarantee uninterrupted availability, error-free operation, or that UniCRM will meet your specific business requirements.
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              2. Third-Party Services &amp; Direct Billing (BYOK)
            </h2>
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
              UniCRM operates on a <strong>&quot;Bring Your Own Keys&quot; (BYOK)</strong> and zero-markup model. UniCRM does not broker, charge for, or collect payment for external messaging, telephony, or artificial intelligence services:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-foreground/80 leading-relaxed">
              <li><strong>WhatsApp &amp; Meta:</strong> Any conversation fees, registration fees, or service fees incurred through Meta&apos;s WhatsApp Cloud API or Meta Business Manager are contracts solely between you and Meta Platforms, Inc.</li>
              <li><strong>AI Providers:</strong> Usage of OpenAI, Anthropic, OpenRouter, or other AI models via our free gateway or your API keys is governed strictly by the respective provider&apos;s terms and pricing.</li>
              <li><strong>No Financial Liability:</strong> UniCRM and its maintainers bear no liability for any bills, overages, or unexpected costs charged to your accounts by Meta, AI vendors, or server hosting providers.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              3. WhatsApp Compliance &amp; Anti-Spam Acceptable Use
            </h2>
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
              You agree to use UniCRM strictly in compliance with all applicable laws and third-party regulations, including the <strong>Meta WhatsApp Business Policy</strong> and local anti-spam regulations (e.g., GDPR, TCPA, CAN-SPAM):
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-foreground/80 leading-relaxed">
              <li><strong>Explicit Consent:</strong> You must have explicit, opt-in consent from all recipients before messaging or broadcasting to them.</li>
              <li><strong>No Unsolicited Spam:</strong> You strictly agree not to use UniCRM for unsolicited commercial spam, phishing, harassment, or distributing illegal content.</li>
              <li><strong>Account Suspensions &amp; Bans:</strong> If you use unofficial connection methods (including QR code-based WhatsApp Web sessions via Web Gateway), you acknowledge and accept that Meta&apos;s automated anti-spam algorithms may flag or permanently ban your phone number if spam thresholds are breached. <strong>UniCRM is not responsible or liable for any suspension, block, or ban of your WhatsApp numbers or Meta accounts.</strong></li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              4. Limitation of Liability
            </h2>
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
              To the maximum extent permitted by applicable law, in no event shall UniCRM, its contributors, maintainers, or donors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages—including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses—arising out of or relating to the use of or inability to use this service.
            </p>
          </section>
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/privacy">
            <Button variant="outline" className="gap-2">
              Read our Privacy Policy &rarr;
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
