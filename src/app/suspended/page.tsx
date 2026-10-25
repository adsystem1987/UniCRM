import Link from "next/link";
import { ShieldAlert, Mail } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mx-auto">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Workspace Suspended
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your UniCRM workspace account has been suspended or is under administrative review.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-1.5 text-left">
          <p className="font-semibold text-foreground">Next Steps:</p>
          <p>
            To restore access or resolve billing inquiries, contact platform support:
          </p>
          <div className="flex items-center gap-1.5 pt-1 font-mono font-medium text-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <a href="mailto:help@dfyunicrm.com" className="hover:underline">
              help@dfyunicrm.com
            </a>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-surface hover:bg-surface-hover border border-border text-foreground transition-all"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
