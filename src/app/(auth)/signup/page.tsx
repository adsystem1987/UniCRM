"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersRound, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useServerSlots } from "@/lib/scarcity";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const t = useTranslations("SignupPage");
  const slots = useServerSlots();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8">
      {/* Sun/Moon Theme Toggle (Dark Mode by default) */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <Card className="w-full max-w-md border-border bg-card shadow-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            {inviteToken ? (
              <UsersRound className="h-6 w-6 text-primary" />
            ) : (
              <img
                src="/logo.png"
                alt="DFY UniCRM"
                className="h-8 w-8 object-contain"
              />
            )}
          </div>
          <CardTitle className="text-xl text-foreground font-black">
            {inviteToken ? t("titleJoin") : "Claim Free Lifetime Account"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            {inviteToken
              ? t("descJoin")
              : "Instant 1-click verified registration via Google. No email confirmation delays."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Limited Server Capacity Scarcity Alert */}
          {!inviteToken && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 font-medium shadow-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>
                <strong>Limited Batch Notice:</strong> Only {slots.remaining} free lifetime accounts remaining today due to server bandwidth limits. Complete signup to secure your slot.
              </span>
            </div>
          )}

          {/* Exclusive Action: 1-Click Verified Google Signup */}
          <div className="space-y-3 pt-1">
            <GoogleSignInButton
              inviteToken={inviteToken}
              text="Sign up with Google"
              className="h-12 text-sm shadow-md border-primary/30 hover:border-primary/60"
            />

            {/* Google Verification Trust Badges */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Pre-Verified Business Email via Google</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                Google verifies your identity automatically. No password creation required, no spam confirmation links, and immediate workspace activation.
              </p>
              <div className="flex items-center gap-4 pl-6 pt-1 text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> 100% Free Lifetime
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" /> Instant Access
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            By signing up with Google, you agree to our{" "}
            <Link href="/terms" className="text-primary underline hover:text-primary/80">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary underline hover:text-primary/80">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground border-t border-border/50 pt-4">
            {t("haveAccount")}{" "}
            <Link
              href={
                inviteToken
                  ? `/login?invite=${encodeURIComponent(inviteToken)}`
                  : "/login"
              }
              className="text-primary font-bold hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
