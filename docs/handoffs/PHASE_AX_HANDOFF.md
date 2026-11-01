# Phase AX: UniCRM Lending Network, AI Advisory Desk & Omnichannel Drop-off Recovery
**Handoff, Version Tracking & Autonomous Memory Blueprint**

> **Autonomous Assistant Instruction**:
> Whenever a new session starts, read this document to understand the current phase and next steps. Whenever a feature, bugfix, or schema update is introduced, automatically append a new version entry in Section 6 below and update the version header.

**Current Version:** `v1.0.0 (Phase AX Baseline)`  
**Date:** 2026-11-02  
**Current Git Branch:** `staging`  
**Latest Commit:** `4ad485e`  
**Status:** Clean working tree, pushed to `origin staging`.

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

1. **Step 1: Frontend `?resume=` Deep-Link Loader on `/loans`**
   - In `loans-client-view.tsx`, inspect `useSearchParams().get('resume')`.
   - Query previous messages from `messages` for that `conversation_id`.
   - Jump directly to Step 2 (Advisory Chat view) with pre-filled history.

2. **Step 2: Two-Way WhatsApp Inbound Sync**
   - When borrower replies directly on WhatsApp, `evolution/webhook` attaches the incoming message to the same conversation.
   - If AI is active, bot replies; if human took over, platform owner replies from `/inbox`.

3. **Step 3: Automated Inactivity Background Trigger**
   - Background worker checks for chats inactive for > 10 mins with a phone number and automatically invokes `/api/loans/followup`.

---

## 6. Version History & Changelog

| Version | Date | Changes Summary | Key Files Affected | Commit |
|---|---|---|---|---|
| **v1.0.0** | 2026-11-02 | Initial Phase AX baseline: DB persistence for `/loans`, Take Over / Resume AI, real-time message sync, WhatsApp drop-off recovery, and deal auto-structuring. | `api/loans/consult`, `loans-client-view.tsx`, `api/loans/followup`, `LOAN_ADVISORY_PIPELINE.md` | `b072edc`, `4ad485e` |
