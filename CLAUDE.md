# CLAUDE.md — UniCRM Project Guidelines & Memory

## Global Agent Rules (STRICT)
- **Git Push Approval**: NEVER run `git push` automatically. Always ask the user for explicit approval and wait for their confirmation before pushing.
- **Git Staging**: Always stage exact modified files only. NEVER run `git add -A` or `git add .`.
- **Branch & Promotion Rule**: ONLY commit and push to the `staging` branch (`origin/staging`). NEVER push to or merge into `main`. The user personally verifies staging and promotes to production (`main`).
- **Primary Branch**: `staging` is the sole development and push target for agents.

---

## Project Overview
**UniCRM (DFY UniCRM)** is an omnichannel CRM and communication platform designed for Indian businesses and global teams.
- **Production URL**: `https://dfyunicrm.com` (formerly `dfydude.cc.cd`)
- **Primary Contact Email**: `help@dfyunicrm.com`
- **Hosting & Infrastructure Topology**:
  - **Frontend / Edge**: Hosted on **Vercel** (`https://dfyunicrm.com`). Serverless & edge rendered — zero fixed CPU usage.
  - **Core Backend Engine**: Hosted on **AWS Cloud Server** (Docker/microservices handling heavy workloads: Evolution API WhatsApp gateway, Whatomate flow engine, WebRTC voice calling, background workers).
  - **Database & Auth (Master Instance)**:
    - **Project Name**: `UniCRM Platform Owner`
    - **Project ID**: `ydpkzxxwticxldaumpos`
    - **Region**: `ap-southeast-2` (Oceania - Sydney)
    - Supabase (PostgreSQL, RLS, Storage, Realtime, Auth via Google OAuth).
- **Positioning**: 100% Free Forever Core Software funded by community members and optional Done-For-You (DFY) technical services. No predatory subscriptions, no fake scarcity countdowns, no per-seat fees.
- **Tech Stack**:
  - **Framework**: Next.js 16 (App Router + Turbopack), React 19, TypeScript
  - **Styling**: Tailwind CSS v4, shadcn/ui primitives, Lucide icons
  - **Database & Auth**: Supabase (PostgreSQL, Auth via Google OAuth, Row Level Security, Realtime, Storage)
  - **Analytics**: Google Analytics tag `G-P9H01H22G1` via `next/script`
  - **i18n**: `next-intl` (English `messages/en.json`, Spanish `messages/es.json`)
  - **Alerting**: Real-time Slack notifications to channel `C0BJU7JLKUM` on new signups and orders

---

## Theming & Dark Mode Architecture
- **Dual-Axis Theming**:
  1. `data-theme` on `<html>`: Accent color (`violet`, `emerald`, `blue`, etc.)
  2. `data-mode` on `<html>`: Neutral mode (`dark` or `light`).
- **Synchronous Device Default Boot**:
  - `src/app/layout.tsx` does **not** hardcode `class="dark"` on `<html>`.
  - It embeds an inline synchronous script in `<head>` that immediately checks `localStorage.getItem('unicrm_mode')` and falls back to `window.matchMedia('(prefers-color-scheme: dark)').matches`.
  - This ensures index, landing, and public marketing pages instantaneously match the user's OS device theme (Light or Dark) without flashing or waiting for React hydration.
- **Tailwind v4 Setup**:
  - Custom dark variant in `src/app/globals.css`:
    ```css
    @custom-variant dark (&:is(.dark, .dark *, [data-mode="dark"], [data-mode="dark"] *));
    ```
  - Both `data-mode="dark"` AND the `.dark` class on `<html>` are synchronized by the theme provider (`src/components/theme/theme-provider.tsx`) and mode toggle (`src/components/layout/mode-toggle.tsx`).
  - High-contrast UI elements (e.g., checkboxes in `src/components/ui/checkbox.tsx`) use `border-border-strong/80 dark:border-border-strong/90` with primary hover/focus states to ensure visible accessibility against muted backgrounds in both modes.

---

## Transactional Email Architecture & Standards
- **Delivery Engine**: Sent via Unitpost API (`https://api.unitpost.com/v1/emails`) from verified identity `hello@mail.dfyunicrm.com` (`src/lib/email/sender.ts`).
- **Copywriting Standard (Strict)**:
  - **Zero Emojis**: Transactional onboarding emails must never contain emojis (emojis trigger spam filters and degrade professionalism).
  - **Clean Plain-Text Layout**: Built with standard semantic HTML (`<p>`, `<ul>`, `<li>`, and standard `<a>` links) styled with clean Inter typography (`font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). Do NOT inject complex heavy heads or image-heavy layouts that trigger Gmail's "Images hidden / suspicious email" banner.
  - **Sender Signature**: Always signed by:
    ```
    Best,
    Ravi, GoToPerson, UniCRM
    ```
- **Automated Onboarding Sequence**:
  - Database Table: `user_onboarding_sequence` (`supabase/migrations/054_user_onboarding_sequence.sql`).
  - Scheduled Jobs:
    1. **Immediate (0h)**: Welcome & Quick-start guide (`welcome.ts`).
    2. **+24 Hours**: WhatsApp Cloud API connection guide (`followup-whatsapp.ts`). Auto-skipped if `whatsapp_config.status === 'connected'`.
    3. **+72 Hours**: Optional Done-For-You (DFY) engineering support overview (`dfy-pitch.ts`).
  - **Queue Handlers**:
    - `src/lib/email/onboarding-queue.ts`: Schedules 24h & 72h jobs on signup verification in `src/app/auth/callback/route.ts`.
    - `src/app/api/cron/onboarding/route.ts`: Hourly cron trigger protected by `CRON_SECRET` / `AUTOMATION_CRON_SECRET` that processes pending due jobs and marks them `sent` or `skipped`.

---

## WhatsApp Integration & Live Diagnostics
- **Meta Cloud API Gateway**: `src/lib/whatsapp/meta-api.ts`
- **Live Health Monitor & Ping**:
  - Located in WhatsApp Settings (`/settings?tab=whatsapp` in `src/components/settings/whatsapp-config.tsx`).
  - **Real-time Health Badges**: Queries Meta Graph API for Verified Name, Display Phone Number, Messaging Tier Limit, and Phone Quality Rating (GREEN / YELLOW / RED).
  - **Send Test Ping Modal**: Allows engineers/admins to trigger an immediate live WhatsApp test ping via `/api/whatsapp/test-message` to confirm inbound/outbound credentials before production launch.
  - **Buttons & Actions**: Uses unified Unitpost CTA styling (`variant="cta"`).

---

## Prospecting & AI Outreach Bridge
- **Find Leads Engine**: `src/components/leads/lead-finder-view.tsx`
  - High-visibility checkboxes for individual lead selection without interfering with external business website links.
  - **1-Click AI Outreach**: "Launch Outreach" sends selected prospects directly to `/api/leads/import-and-outreach`. Automatically upserts contacts into Supabase `contacts` table and triggers the background omnichannel automation workflow (`unicrm_omnichannel_outreach`).

---

## Core Channels & Integrations
1. **WhatsApp Messaging**:
   - Meta Cloud API (1,000 free service conversations/month from Meta)
   - Instant WhatsApp QR (Evolution API / Web Gateway for existing numbers)
2. **WhatsApp Voice Calling & Node-Based IVR**:
   - WebRTC / VoIP gateway for inbound and outbound calling directly in browser
   - Visual drag-and-drop IVR builder
3. **Social DMs**: Instagram Direct & Facebook Messenger via Meta Graph API
4. **Support Email**: Gmail API (OAuth) & custom IMAP/SMTP
5. **Storage Architecture**:
   - **Google Drive BYOS (Bring Your Own Storage)**: Streams customer photos, PDFs, voice notes, and call recordings directly to user's Google Drive (`/DFY UniCRM Attachments`). Keeps CRM database lean with 15 GB free storage.
   - **Database BYOD (Bring Your Own Database)**: Allows connecting personal Supabase project for zero-limit contact storage.
6. **Zero-Gateway Direct Payments & Tracking**:
   - Direct UPI QR and UPI Intent payments (0% transaction fees).
   - "Orders & Payments" tracking in Settings & primary sidebar (`/settings?tab=orders`).
   - Supports manual and automatic UTR/reference reconciliation.
   - **AI Smart Router Pro**: ₹59/month paywall for high-volume automated AI replies. Users purchase via direct UPI before activation.

---

## Platform Owner & Account Lifecycle Architecture
- **Platform Owner Identifiers**:
  - `brosir2019@gmail.com`
  - `help@dfyunicrm.com`
  - Implemented via `isMasterAdminEmail()` in `src/lib/auth/master-admin.ts`.
- **Global Cross-Tenant Capabilities**:
  - **Account Lifecycle Controls**: Platform owners can view all platform workspaces, inspect tenant member counts & owner emails, and toggle statuses (`active`, `suspended`, `phased_out`) with optional suspension reasons via `/api/admin/accounts`.
  - **Cross-Tenant Orders Queue**: Platform Owners bypass tenant account filtering in `/api/orders` to audit, verify, and fulfill direct UPI orders (AI Smart Router Pro ₹59/mo, Lead Packs) across all platform accounts.
  - **Suspension Enforcement**: `src/middleware.ts` automatically intercepts users of suspended workspaces and routes them to `/suspended` with a clear explanation and support CTA to `help@dfyunicrm.com`. Platform Owner emails bypass this intercept to ensure administrative access is never blocked.
  - **Admin UI**: Platform Owner oversight panel accessible under `/settings?tab=master-admin` (under "Platform Oversight" group in sidebar).
- **Database Schema**:
  - `supabase/migrations/055_master_admin_and_account_status.sql`: Extends `accounts` with `status text default 'active'`, `suspension_reason text`, and `suspended_at timestamptz`.

---

## Strategic Market Positioning & Unfair Advantages vs Competitors
- **Competitor Landscape Analysis (e.g., `dfycrm.com`, GoHighLevel Resellers, Wati, AiSensy)**:
  - **The Competitor Trap**: Heavy \$97–\$297/mo subscription tiers, exorbitant per-seat user fees, markup taxes on every SMS/call/message (Twilio/LC Phone reselling), closed databases with severe data lock-in, and shallow chatbot wrappers with zero memory context.
  - **The UniCRM Differentiation**:
    1. **100% Free Core Software & Zero Seat Tax**: Add unlimited team agents without penalty.
    2. **Bring Your Own Storage (BYOS)**: Complete data sovereignty. Photos, voice recordings, PDFs, and invoices stream directly into the customer's own Google Drive (15 GB free) and Supabase instance.
    3. **First-Party Meta WhatsApp Cloud API**: Direct Graph API access with zero middleman per-message markups, automated template sync, and built-in anti-ban jitter algorithms.
    4. **Turnkey Industry Blueprints**: 1-click deployable business workflows (Real Estate, D2C, Education, Professional Services) combining Meta templates, smart IVR, and outreach.
    5. **AI Memory Dossiers ("gbrain")**: Automated markdown customer briefing dossiers synthesizing conversation sentiment, customer pain points, and recommended closing actions directly into the contact inbox. Modeled after Garry Tan's open-source gbrain framework ("reads like an intelligence dossier crossed with a therapist's notes, not a LinkedIn scrape").
    6. **Automated GDrive BYOS Invoicing**: Instant professional PDF/HTML invoices generated on order confirmation and stored directly in `/DFY UniCRM Attachments/Invoices/`.

---

## AI Memory Dossiers Architecture (Garry Tan / gbrain)
- **Specification**:
  - Ground truth structured Markdown stored per contact (`contacts.ai_dossier` and `contacts.ai_dossier_updated_at`).
  - Synthesizes: Contact basic facts, tags, deals (values & pipeline stages), CRM notes, and recent WhatsApp conversation turns.
  - Generates: Executive Psychological Read, Operating State & Context, What They're Building & Buying, Core Motivations & Pain Points, Communication Style & Psychological Tells, Strategic Playbook & Next Pitch Angle.
- **Components**:
  - `src/lib/ai/dossier.ts`: Core prompt engine & synthesis function.
  - `src/app/api/contacts/[id]/dossier/route.ts`: GET & POST endpoints with rate limiting & BYO AI model execution.
  - `src/components/ui/markdown-renderer.tsx`: Lightweight, secure markdown parser for dossiers.
  - `src/components/contacts/contact-detail-view.tsx`: Dedicated "AI Dossier" tab with on-demand refresh.
  - `src/components/inbox/contact-sidebar.tsx`: Live collapsible "AI Memory Dossier" widget in inbox sidebar.
  - `supabase/migrations/056_contact_ai_dossier.sql`: DB schema migration for dossier fields and ai_usage_log mode.

---

## Key Directories & Structure
- `src/app/`: Next.js App Router
  - `(auth)/`: Authentication routes (`/login`, `/signup`)
  - `(dashboard)/`: Main app workspace (`/dashboard`, `/inbox`, `/contacts`, `/deals`, `/broadcasts`, `/audiences`, `/settings`)
  - `api/`: Backend API routes (webhooks, integrations, orders, WhatsApp, Google Drive, AI)
- `src/components/`:
  - `settings/`: `integrations-panel.tsx`, `orders-billing-panel.tsx`, `ai-config.tsx`, `ai-pro-order-dialog.tsx`, `members-tab.tsx`
  - `landing/`: `server-scarcity.tsx` (community banners, badges, pills)
  - `layout/`: `sidebar.tsx`, `mode-toggle.tsx`, `header.tsx`
- `src/lib/`:
  - `supabase/`: Browser, server, and admin clients
  - `gdrive/`: Google Drive OAuth and file management
  - `flows/`: Visual node builder execution engine
  - `whatsapp/`: Meta API and web gateway drivers
  - `slack.ts`: Slack webhook alerting

---

## Common Development Commands
- `npm run dev`: Start local development server
- `npm run build`: Production build (Next.js + TypeScript check)
- `npm run lint`: ESLint check

---

## Agent Guidelines & Memory
- Read `@AGENTS.md` for UI/UX engineering standards and Next.js guidelines.
- Always maintain documentation integrity and preserve unrelated comments/docstrings.
- Ensure all color tokens maintain WCAG contrast in both Light and Dark modes.
