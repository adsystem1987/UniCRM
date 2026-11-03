# Phase AX: UniCRM Lending Network, AI Advisory Desk & Omnichannel Drop-off Recovery
**Handoff, Version Tracking & Autonomous Memory Blueprint**

> **Autonomous Assistant Instruction**:
> Whenever a new session starts, read this document to understand the current phase and next steps. Whenever a feature, bugfix, or schema update is introduced, automatically append a new version entry in Section 6 below and update the version header.

**Current Version:** `v1.9.7`  
**Date:** 2026-11-04  
**Current Git Branch:** `staging`  
**Latest Commit:** `dbb5262`  
**Status:** Vault-backed Slack alerts & high-priority loan notifications connected. Clean verification on `staging`.

---

## 1. Executive Summary & Core Mission
When conversational AI operates on the client side only (e.g. in-memory React state), the platform owner has no visibility into what borrowers are asking, cannot take over when high-value prospects need personal underwriting, and cannot re-engage borrowers who abandon the conversation.

**Phase AX converts the `/loans` advisory experience into a persistent, multi-tenant B2B lending pipeline:**
1. **Interactive, Conversational Underwriting:** Rather than an intimidating, multi-field application form, the AI asks targeted questions one at a time (analyzing turnover, property ownership, and business vintage).
2. **Unified Inbox Integration (`/inbox`):** Every question and reply is saved to the database (`conversations` and `messages`), making live borrower inquiries visible directly to the platform owner and agents.
3. **Human Agent Takeover & AI Resume:** Platform owners can click *"Take Over Conversation"* from the inbox. The AI yields immediately, and the borrower sees a verified staff badge. The platform owner can click *"Resume AI"* anytime to hand the thread back to the bot.
4. **Automated Pipeline Structuring:** Conversational anchors are parsed into `contacts`, `deals` in the `Lending & Capital Desk` pipeline, and `loan_applications` for DSA partner matching.
5. **Omnichannel Drop-Off Recovery:** If a borrower leaves or goes idle, an automated WhatsApp message with a deep-link (`/loans?resume=<convId>`) re-engages them to resume on the web or reply directly on WhatsApp.

---

## 2. Architecture & Data Model (Supabase Free Tier Optimized)

### ₹0 Cost & Free Tier Guardrails:
- **Zero Paid Database Add-ons:** Text records (`conversations`, `messages`, `contacts`, `deals`) consume ~5–8 KB per lead. 50,000+ active loan inquiries take < 300 MB of PostgreSQL storage (Supabase Free Tier allows 500 MB).
- **Zero S3 / Supabase Storage Fees for Heavy Documents:** Bank statements and ITRs are offloaded to Google Drive (using the Multi-Account Storage Pool Engine in `src/lib/gdrive/offload.ts`) or Cloudflare R2.

### Multi-Table Relationships:
```
[Borrower on /loans]
       │
       ▼
 [contacts] ──────► [conversations] ──────► [messages] (Realtime Synced)
       │                    │
       │                    ▼ (ai_autoreply_disabled)
       │            [Unified Inbox /inbox]
       │             (Take Over / Resume AI)
       ▼
    [deals] (Lending & Capital Desk Pipeline)
       │
       ▼
[loan_applications] (DSA Partner Lead Desk)
```

1. **`contacts`**: Stores borrower identity (`account_id`, `name`, `phone`, `email`).
2. **`conversations`**:
   - `account_id`, `contact_id`, `status` (`open` | `closed`).
   - `ai_autoreply_disabled` (`boolean`): Toggled via `/api/ai/autoreply/[conversationId]`.
   - `last_message_text`, `last_message_at`: Powers inbox list sorting and previews.
3. **`messages`**:
   - `conversation_id`, `sender_type` (`'customer'` | `'agent'` | `'bot'`).
   - `content_text`, `created_at`.
4. **`deals`**:
   - Auto-assigned to `Lending & Capital Desk` pipeline (`ensure_lending_pipeline` RPC).
   - Set to Stage 1: *"1. New Qualified Leads"*.
5. **`loan_applications`**:
   - Provides anonymized/masked lead cards in the DSA Lead Desk (`/loans` -> Partner Lead Desk).

---

## 3. Implemented Endpoints & Components

| File Path | Description |
|---|---|
| `src/app/api/loans/consult/route.ts` | Conversational underwriting endpoint. Parses anchors, upserts `contacts`, `conversations`, `messages`, `deals`, and `loan_applications`. Bypasses AI when `ai_autoreply_disabled === true`. |
| `src/app/(dashboard)/loans/loans-client-view.tsx` | Client UI for borrower advisory. Subscribes to Supabase Realtime for `messages` and `conversations`. Displays human takeover alert badge and staff badges. |
| `src/app/api/loans/followup/route.ts` | Omnichannel re-engagement endpoint. Dispatches WhatsApp messages via Evolution API / Meta Cloud API with `/loans?resume=<convId>` links. |
| `src/components/inbox/ai-thread-banner.tsx` | Inbox banner for human agents to trigger "Take Over" or "Resume AI". |
| `src/app/api/ai/autoreply/[conversationId]/route.ts` | Backend handler for toggling `ai_autoreply_disabled` and agent assignment. |

---

## 4. Current State & Verification Checklist

- [x] `npx vitest run src/middleware.test.ts` passed (21/21 tests pass).
- [x] `npx tsc --noEmit` passed with 0 compilation errors.
- [x] Clean Git working directory on branch `staging`.
- [x] Pushed to remote repository at `github.com:adsystem1987/UniCRM.git`.

---

## 5. Next Immediate Steps (Phase AX Roadmap)

1. **Step 1: Frontend `?resume=` Deep-Link Loader on `/loans`** [COMPLETED]
   - In `loans-client-view.tsx`, reads `useSearchParams().get('resume')`.
   - Hydrates previous conversation messages, contact info, and takeover state via `GET /api/loans/consult?conversationId=<id>`.
   - Jumps directly to Step 2 (Advisory Chat view) with full pre-filled history and realtime sync.

2. **Step 2: Two-Way WhatsApp Inbound Sync & Workplace Human/AI Handover** [COMPLETED]
   - Implemented `src/lib/loans/ai-reply.ts` for AI underwriter replies via WhatsApp.
   - Enhanced `evolution/webhook` to normalize phone numbers and route loan conversations.
   - Enforces strict human takeover: when `ai_autoreply_disabled === true` or agent is assigned, the AI remains silent so workplace staff can reply from `/inbox`.
   - Outbound agent messages from `/inbox` route via Evolution/Meta to deliver straight to customer's WhatsApp.

3. **Step 3: Automated Inactivity Background Trigger** [COMPLETED]
   - Implemented scheduled background worker trigger in `GET /api/loans/followup`.
   - Checks open loan conversations idle for > 15 mins (up to 24h).
   - Validates contacts with verified phone numbers, deduplicates to prevent re-sending within 24h, and dispatches automated WhatsApp re-engagement deep-link (`/loans?resume=<convId>`).
   - Supports both cron execution with secret headers and authenticated dashboard invocation.

---

## 6. Version History & Changelog

| Version | Date | Changes Summary | Key Files Affected | Commit |
|---|---|---|---|---|
| **v1.9.7** | 2026-11-04 | Vault-Powered Slack Real-Time Alerts: Integrated dynamic credential resolution from Supabase Vault (`SLACK_BOT_TOKEN`, `SLACK_CHANNEL`) in `src/lib/slack/notify.ts`. Added structured Block Kit alert `notifyNewLoanApplication` and wired it into `/api/loans/consult` for immediate founder/underwriter notifications when a borrower completes application qualification. Verified 0 TypeScript errors and 21/21 vitest pass. | `src/lib/slack/notify.ts`, `src/app/api/loans/consult/route.ts` | `dbb5262` |
| **v1.9.6** | 2026-11-04 | Adopted Zero-Cost Email Bounce Shield from `dfydude.online`: Implemented `src/lib/email/mx-validator.ts` with DNS MX verification and in-memory TTL caching (4h success, 10m failure). Integrated pre-flight check into AWS SES delivery loop in `src/lib/email/sender.ts` to block non-existent domains and keep SES bounce rates under 5%. Verified 0 TypeScript errors and 21/21 vitest pass. | `src/lib/email/mx-validator.ts`, `src/lib/email/sender.ts` | `f196fa3` |
| **v1.9.5** | 2026-11-04 | Supabase Vault & Supermemory Integration: Implemented edge-safe `src/lib/vault.ts` with 60s in-memory TTL for zero-cost secret retrieval from Supabase Vault (`get_vault_secret`). Added `src/lib/supermemory.ts` for borrower long-term memory profiling and injected contextual memory retrieval and async memory persistence into conversational lending underwriter (`/api/loans/consult`). Verified 0 TypeScript errors and 21/21 vitest pass. | `src/lib/vault.ts`, `src/lib/supermemory.ts`, `src/app/api/loans/consult/route.ts` | `f046a98` |
| **v1.9.4** | 2026-11-04 | Fixed Vercel build failure during static page generation: added safe build-time fallbacks for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `src/lib/supabase/client.ts` so `/reset-password` and other auth pages prerender cleanly even if env vars are missing during the build phase. Verified full Next.js production build (74/74 static pages generated). | `src/lib/supabase/client.ts` | `f90005f` |
| **v1.9.3** | 2026-11-04 | Vercel Free-Tier Overhaul: Set `images.unoptimized = true` in `next.config.ts` (drops Fast Origin Transfer from 10GB to <100MB and prevents lambda image resizing); switched `/p`, `/p/directory`, and `/p/[slug]` to `revalidate = 86400` to serve from Vercel Edge CDN without triggering repeated function CPU invocations or 850k+ ISR writes. | `next.config.ts`, `src/app/p/page.tsx`, `src/app/p/directory/page.tsx`, `src/app/p/[slug]/page.tsx` | `104d538` |
| **v1.9.2** | 2026-11-02 | Added direct layman-friendly footer link to `/p` as **"Explore Direct Business Desks"** across main landing page, business showcase pages, and yellow pages directory. | `src/app/page.tsx`, `public-directory-view.tsx`, `public-page-view.tsx` | `21ef562` |
| **v1.9.1** | 2026-11-02 | Rebranded all "Yellow Pages" labels to "Business Directory Index (A–Z)" across footer links, header navigation, and page metadata. Verified with vitest (21/21) and tsc (0 errors). | `src/app/page.tsx`, `src/app/p/directory/page.tsx`, `public-directory-view.tsx`, `public-page-view.tsx` | `69da2ff` |
| **v1.9.0** | 2026-11-02 | Created Yellow Pages Master Directory (`/p/directory`): comprehensive A–Z alphabetical index with quick-jump letter anchors, industry category grouping, and city location filtering; added global links across landing page and business directory footers; added to dynamic sitemap. | `src/app/p/directory/page.tsx`, `src/app/page.tsx`, `public-directory-view.tsx`, `public-page-view.tsx`, `src/app/sitemap.ts` | `51d3e88` |
| **v1.8.0** | 2026-11-02 | Adopted `AgriciDaniel/claude-seo` suite & runtime; upgraded agent-readiness (`llms.txt`, `robots.ts`, `sitemap.ts`) with `/loans` exposure and injected Schema.org `SoftwareApplication` & `Organization` JSON-LD structured data into root layout. | `public/llms.txt`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/layout.tsx` | `9a6c1fe` |
| **v1.7.0** | 2026-11-02 | Restyled micro pages with `taste-skill` anti-slop guidelines: high CTR, confident emotional headlines, and pure semantic tokens across `/claim`, `/opt-out`, `/contact`, `/suspended`, `/privacy`, and `/terms`. Verified 0 type errors and 21/21 tests passing. | `src/app/claim/page.tsx`, `src/app/contact/page.tsx`, `src/app/opt-out/page.tsx`, `src/app/privacy/page.tsx`, `src/app/suspended/page.tsx`, `src/app/terms/page.tsx` | `3df0f8e` |
| **v1.6.0** | 2026-11-02 | Workplace Sun & Moon contrast overhaul: eradicated hardcoded slate/gray/white color mismatches in `/outreach`, `/claim`, `/opt-out`, and modals (`lead-pack-order-dialog`, `ai-pro-order-dialog`, `upi-support-dialog`) using semantic tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`). Verified with `vitest` and `tsc`. | `outreach-console-view.tsx`, `claim/page.tsx`, `opt-out/page.tsx`, `lead-pack-order-dialog.tsx`, `ai-pro-order-dialog.tsx`, `upi-support-dialog.tsx` | `37bd554` |
| **v1.5.0** | 2026-11-02 | Restyled pricing section with `taste-skill`: prominently highlighted **3 Months AI Pro Squad Access + Dedicated Founder Pro Support** on the 3-Month Partner Pilot Pass (₹1,000). | `src/app/page.tsx` | `c12db08` |
| **v1.4.0** | 2026-11-02 | Restyled landing page hero and business capital desk using `taste-skill` anti-slop guidelines: bold anti-rent hook, high-contrast emotional CTA ("Claim Your Free Workplace"), and institutional credit desk framing. | `src/app/page.tsx` | `9446383` |
| **v1.3.0** | 2026-11-02 | Added scheduled inactivity drop-off recovery trigger via `GET /api/loans/followup` with anti-spam check, cron header validation, and deal/loan inquiry scanning. | `api/loans/followup/route.ts` | `deedf39` |
| **v1.2.0** | 2026-11-02 | Added two-way WhatsApp inbound router in webhook & loan underwriter AI agent (`src/lib/loans/ai-reply.ts`). Human agent takeover (`ai_autoreply_disabled`) strictly silences AI so workplace staff reply via UniCRM `/inbox` directly to WhatsApp. | `api/evolution/webhook/route.ts`, `lib/loans/ai-reply.ts` | `be0136c` |
| **v1.1.0** | 2026-11-02 | Implemented `GET /api/loans/consult` conversation hydration API and `?resume=` search param handling in `loans-client-view.tsx` with Suspense wrapper in `loans/page.tsx`. | `api/loans/consult/route.ts`, `loans-client-view.tsx`, `loans/page.tsx` | `1910119` |
| **v1.0.0** | 2026-11-02 | Initial Phase AX baseline: DB persistence for `/loans`, Take Over / Resume AI, real-time message sync, WhatsApp drop-off recovery, and deal auto-structuring. | `api/loans/consult`, `loans-client-view.tsx`, `api/loans/followup`, `LOAN_ADVISORY_PIPELINE.md` | `b072edc`, `4ad485e` |
