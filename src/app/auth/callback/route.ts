// ============================================================
// GET /auth/callback — where every link Supabase emails on our behalf
// lands (email confirmation after sign-up, password reset, invite,
// magic link).
//
// Before this route existed, the password-reset email pointed here
// and 404'd (issue #592) — anyone who forgot their password was locked
// out. Sign-up relied on Supabase's default redirect (the Site URL),
// which on a mis-configured or self-hosted instance is
// `http://localhost:3000` (issue #595), and even when correct dropped
// the user on `/` with an unexchanged `?code=` that the root redirect
// discarded — so they had to sign in again after verifying.
//
// Flow:
//   1. `?error=...`         → Supabase already rejected the link
//                             (expired / used). Send to /login with a
//                             reason it can explain.
//   2. `?code=...`          → PKCE exchange (default email templates).
//      `?token_hash=&type=` → verifyOtp (templates using {{ .TokenHash }}).
//   3. success              → 303 to the validated `next` path
//                             (/dashboard, /reset-password, /join/<t>).
//      failure              → 303 to /login?error=link_invalid.
//
// The session cookies are written by `@supabase/ssr` through the
// server client's cookie adapter, so the redirected-to page (and the
// middleware in front of it) sees the user signed in.
//
// `Location` is emitted as a relative path on purpose — see
// `relativeRedirect` for the reverse-proxy reasoning.
// ============================================================

import { createClient } from '@/lib/supabase/server';
import {
  loginFailurePath,
  parseEmailLink,
  parseSupabaseError,
  relativeRedirect,
  safeNextPath,
} from '@/lib/auth/callback';
import { notifySlackNewSignup } from '@/lib/slack/notify';
import { sendWelcomeEmail } from '@/lib/email/sender';

// Session exchange is per-request by definition; never prerender.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = safeNextPath(searchParams.get('next'));

  const upstreamError = parseSupabaseError(searchParams);
  if (upstreamError) {
    return relativeRedirect(loginFailurePath(upstreamError));
  }

  const link = parseEmailLink(searchParams);
  if (!link) {
    return relativeRedirect(loginFailurePath('link_invalid'));
  }

  const supabase = await createClient();
  const { data, error } =
    link.kind === 'code'
      ? await supabase.auth.exchangeCodeForSession(link.code)
      : await supabase.auth.verifyOtp({
          type: link.type,
          token_hash: link.tokenHash,
        });

  if (error) {
    // Most common cause in practice: the PKCE code verifier cookie is
    // missing because the link was opened in a different browser than
    // the one that requested it. The email itself was still verified
    // by Supabase, so /login's message tells the user to just sign in.
    console.warn('[GET /auth/callback] session exchange failed:', {
      kind: link.kind,
      message: error.message,
    });
    return relativeRedirect(loginFailurePath('link_invalid'));
  }

  // Detect and handle new user onboarding & notification
  if (data?.user) {
    const user = data.user;
    const createdAtMs = new Date(user.created_at).getTime();
    const isRecentSignup = Math.abs(Date.now() - createdAtMs) < 15 * 60 * 1000;
    const alreadyNotified = Boolean(user.user_metadata?.slack_signup_notified);
    const welcomeSent = Boolean(user.user_metadata?.welcome_email_sent);

    // 1. Send Welcome Email via Unitpost (guaranteed delivery)
    if (user.email && !welcomeSent) {
      const userName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        (user.email.split('@')[0]) ||
        'there';

      try {
        console.log(`[Auth/Callback] Sending welcome email to ${user.email} via Unitpost...`);
        const emailResult = await sendWelcomeEmail({
          to: user.email,
          name: userName,
        });
        console.log(`[Auth/Callback] Welcome email result for ${user.email}:`, emailResult);

        if (emailResult.success) {
          await supabase.auth
            .updateUser({
              data: { welcome_email_sent: true },
            })
            .catch(() => {});
        }
      } catch (emailErr) {
        console.error('[Auth/Callback] Failed to send welcome email:', emailErr);
      }
    }

    // 2. Slack Alert for team
    if (isRecentSignup && !alreadyNotified) {
      void supabase.auth
        .updateUser({
          data: { slack_signup_notified: true },
        })
        .catch(() => {});

      void notifySlackNewSignup({
        name:
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          null,
        email: user.email,
        provider: (user.app_metadata?.provider as string) || 'Google OAuth',
        userId: user.id,
        inviteToken: searchParams.get('invite'),
      }).catch((err) => {
        console.error('[Slack] Failed to send signup notification:', err);
      });
    }
  }

  return relativeRedirect(next);
}
