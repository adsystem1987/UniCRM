# CLAUDE.md — UniCRM Project Guidelines & Memory

## Global Agent Rules (STRICT)
- **Git Push Approval**: NEVER run `git push` automatically. Always ask the user for explicit approval and wait for their confirmation before pushing.
- **Git Staging**: Always stage exact modified files only. NEVER run `git add -A` or `git add .`.
- **Branch & Promotion Rule**: ONLY commit and push to the `staging` branch (`origin/staging`). NEVER push to or merge into `main`. The user personally verifies staging and promotes to production (`main`).
- **Primary Branch**: `staging` is the sole development and push target for agents.
- **Deployment Workflow & Vercel Hobby Quotas**:
  - **Vercel Hobby Plan Build Limits**: Vercel free/hobby plans enforce strict deployment quotas (typically 100 deployments per day and max build execution concurrency).
  - **Batch Pushes & Conserve Deployments**: NEVER push incremental, unverified micro-commits that trigger redundant Vercel build pipelines. Batch related edits and features together into single cohesive commits.
  - **Pre-Push Verification**: Always run local verification (`npx tsc --noEmit` and build checks) locally *before* requesting push approval, ensuring every push yields a green build and avoids burning quota on failed retries.
  - Once all changes are pushed to `staging` and the Vercel build is green, our work is DONE. Do NOT suggest creating PRs, merging to main, or any production promotion steps. The user handles staging → main promotion independently. The agent's finish line is: **batched push to staging + build green = task complete**.
- **Proprietary Moat & Public Copy Rule (STRICT)**: NEVER showcase, expose, or name-drop internal tech stack libraries, third-party vendor names, or open-source architectures (e.g., `gbrain`, `Apify`, `Supabase`, `Groq`, `Evolution API`, `Whatomate`, `Postgres`, etc.) on public marketing pages, index page copy, landing components, or transactional customer emails. Always translate technical features into customer-centric proprietary terms (e.g., *"Smart Client Memory"*, *"Smart Lead Discovery"*, *"UniCRM Real-Time Voice Gateway"*, *"Private Cloud Storage"*). Keep technical implementations confidential to safeguard against competitors copying our roadmap.

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
  - **Open-Source Lineage**: Documented in [`docs/open-source-lineage.md`](docs/open-source-lineage.md) (tracks ported concepts from `ArnasDon/wacrm`, `msitarzewski/agency-agents`, `nateherkai/roast-room`, `EvolutionAPI`, and `shadcn/ui`).

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
    5. **Smart Client Memory Profiles**: Automated customer briefing dossiers synthesizing conversation sentiment, customer pain points, and recommended closing actions directly into the contact inbox.
    6. **Automated GDrive BYOS Invoicing**: Instant professional PDF/HTML invoices generated on order confirmation and stored directly in `/DFY UniCRM Attachments/Invoices/`.

---

## Smart Client Memory Architecture
- **Specification**:
  - Ground truth structured Markdown stored per contact (`contacts.ai_dossier` and `contacts.ai_dossier_updated_at`).
  - Synthesizes: Contact basic facts, tags, deals (values & pipeline stages), CRM notes, and recent WhatsApp conversation turns.
  - Generates: Executive Read, Operating State & Context, What They're Building & Buying, Core Motivations & Pain Points, Communication Style, Strategic Playbook & Next Pitch Angle.
- **Components**:
  - `src/lib/ai/dossier.ts`: Core prompt engine & synthesis function.
  - `src/app/api/contacts/[id]/dossier/route.ts`: GET & POST endpoints with rate limiting & BYO AI model execution.
  - `src/components/ui/markdown-renderer.tsx`: Lightweight, secure markdown parser for memory dossiers.
  - `src/components/contacts/contact-detail-view.tsx`: Dedicated "Smart Memory" tab with on-demand refresh.
  - `src/components/inbox/contact-sidebar.tsx`: Live collapsible "Smart Client Memory" widget in inbox sidebar.
  - `supabase/migrations/056_contact_ai_dossier.sql`: DB schema migration for dossier fields and ai_usage_log mode.

---

## Free WhatsApp Inbound Handshake & Onboarding Gate (Anti-Spam Barrier)
- **Problem**: Open signups allow bots or disposable accounts to flood server resources and see internal dashboard views.
- **Solution (Zero-Cost WhatsApp Handshake)**:
  - When an unverified user signs in via Google OAuth, `PhoneVerificationModal` blocks dashboard interaction.
  - Generates a unique 6-digit handshake code (`ACT-XXXXXX`).
  - The user taps **"Send & Verify via WhatsApp"**, which opens `https://wa.me/917019139417?text=Verify%20ACT-XXXXXX...`.
  - On sending, the inbound webhook (`src/app/api/whatsapp/webhook/route.ts`) checks `handlePhoneVerificationHandshake()`, captures the sender's real phone, marks `profiles.phone_verified = true`, and the dashboard unlocks automatically in real time via polling.
  - Platform Owners (`brosir2019@gmail.com`, `help@dfyunicrm.com`) bypass this gate automatically.
- **Components**:
  - `src/lib/auth/phone-handshake.ts`: Webhook parser & validator for incoming activation codes.
  - `src/app/api/auth/phone-verify/route.ts`: GET & POST status & code regeneration endpoints.
  - `src/components/layout/phone-verification-modal.tsx`: Auto-polling barrier dialog.
  - `supabase/migrations/057_phone_verification_onboarding.sql`: Schema migration for `phone`, `phone_verified`, and `verification_code`.

---

## Google Drive Payment Receipt Delivery (BYOS Invoicing)
- **Zero-Storage-Cost Receipt Pipeline**:
  - Automatically triggers when an order is verified (`paid` or `fulfilled`) in `PATCH /api/orders` or manually synced.
  - Generates a standalone, print-optimized HTML payment receipt with clean UniCRM Unitpost styling, official `receipt_number` (e.g. `REC-202610-0001`), payment mode (Direct UPI QR / Intent), banking UTR reference, item details, and non-tax payment disclaimer.
  - Connects to user's or platform owner's connected Google Drive (`src/lib/gdrive/client.ts`), creates the `/DFY UniCRM Attachments/Receipts/` subfolder, and uploads `Receipt-REC-YYYYMM-XXXX-ORD-YYYY.html`.
  - Sets public reader access on the Drive file and persists `receipt_number`, `receipt_gdrive_file_id`, and `receipt_gdrive_url` (webViewLink) on the `orders` row.
  - Provides a 1-click **"Drive"** button and standalone viewable `/api/orders/[id]/receipt` endpoint in `/settings?tab=orders`.
- **Components**:
  - `src/lib/invoice/receipt-template.ts`: Standalone responsive HTML payment receipt generator with tax notice note.
  - `src/lib/invoice/delivery.ts`: Automated Google Drive subfolder creation, buffer upload, and DB updater.
  - `src/app/api/orders/[id]/receipt/route.ts`: GET for viewing/printing, POST for on-demand Google Drive upload & sync.
  - `supabase/migrations/058_order_receipt_gdrive.sql`: Database schema migration adding receipt tracking fields and auto-numbering trigger.

---

## Turnkey Industry Blueprints Architecture
- **Problem**: New businesses struggle configuring custom CRM pipelines, tags, and WhatsApp scripts from scratch, leading to dirty/unorganized lead data.
- **Solution (1-Click Industry Packs with Global & Regional Adaptation)**:
  - 12 pre-configured industry blueprints: Interior Design, Loan Providers (DSA), Real Estate, Home Services (Solar/HVAC), Legal/Tax (CA/CPA), Digital Agencies, Auto Dealerships, Clinics/Med-Spas, Travel/Visa, Weddings/Events, Luxury D2C, Fitness Coaches.
  - **Dynamic Regional Adaptation**: Toggle between 🇮🇳 India (INR/BHK/CIBIL), 🇺🇸 USA & UK (USD/Remodel/FICO), 🇦🇪 UAE & GCC (AED/Villa/Ejari), and 🌍 Global terminology.
  - **1-Click Installation**: Creates a dedicated Pipeline, seeds custom pipeline stages, lead tags, and high-converting WhatsApp message scripts.
  - **Direct Lead Finder Synergy**: Each blueprint connects directly to `/leads?niche=...` so clients get instant, pre-filtered, clean leads matching their industry.
- **Components**:
  - `src/lib/blueprints/catalog.ts`: Master catalog of 12 industries with regional stages, tags, templates, and lead niches.
  - `src/app/api/blueprints/install/route.ts`: Installer API creating pipelines, stages, tags, and message templates.
  - `src/components/settings/industry-blueprints-panel.tsx`: Interactive hub at `/settings?tab=blueprints` with regional toggle and preview tabs.

---

## Instant Business Micro-Pages & Digital Catalogs (`/p/[slug]`)
- **Philosophy**: "Post like an Instagram story, launch like a website." Built for local businesses (hotels, cabs, tours, clinics, loans) with zero technical friction.
- **Key Capabilities**:
  - Dynamic mobile storefront with business branding, WhatsApp quick-actions, and direct calling.
  - Category filter pills (`[All]`, `[Domestic Trips]`, `[Rooms]`, `[Suites]`, etc.).
  - WhatsApp pre-filled messaging with item context and instant CRM lead ingestion tagged `#WebPageLead`.
  - 1-Click Printable Counter Standee & Flyer generator (`/settings?tab=business-page`).
- **Files**:
  - `src/app/p/[slug]/page.tsx`: Public SSR route.
  - `src/components/business-page/public-page-view.tsx`: Dark studio aesthetic view.
  - `src/components/business-page/business-page-editor.tsx`: Social-style editor.
  - `src/lib/business-page/presets.ts`: 1-Click industry presets for 6 target niches.
  - `src/app/api/business-pages/`: CRUD and callback inquiry ingestion.
  - `supabase/migrations/059_business_pages.sql`: Database schema & RLS.

---

## Client Entitlements & Platform Owner Provisioning
- **Location**: `Settings → Platform Oversight` (`/settings?tab=master-admin`), restricted strictly to `isPlatformOwner`.
- **Features**:
  - 1-Click AI Smart Auto-Reply activation (+3 Months for ₹1,000 setup / +1 Year) with AES-256 encrypted OmniRoute/LLM key. Client never sees raw key.
  - 1-Click Lead Discovery Credit top-ups (+500 / +1,000 credits) with automated deduction upon searches.
- **Files**:
  - `src/components/settings/entitlement-dialog.tsx`: Admin provisioning desk.
  - `src/app/api/admin/entitlements/route.ts`: Provisioning endpoint.
  - `supabase/migrations/060_account_entitlements.sql`: Database schema.

---

## Frontend Design Taste (`taste-skill` Principles)
- **Anti-AI-Slop Standard**: Avoid generic pastel gradients, centered 3-line headlines with floating icon cards.
- **Art Direction**:
  - Rich dark studio foundation (`bg-neutral-900`/`bg-neutral-950`) with subtle structural grid textures.
  - Pair bold grotesque typography with crisp monospace metadata labels (`font-mono text-emerald-400`).
  - Tactile, high-contrast CTA buttons and glassmorphism action bars.
  - Enforced across public marketing showcases and `/p/[slug]` micro-pages.

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

## Core System Architecture & Phase A Milestone (Completed)

UniCRM **Phase A** represents the complete baseline omnichannel platform, zero-cost BYOC (Bring Your Own Cloud) data plane, 1-click industry storefronts, and 3-Month Pro Pilot architecture.

### Phase A Completed Capabilities:

1. **Continuous Learning Client Memory (`contacts.ai_memory`)**:
   - Real-time extraction of budget (e.g. `₹50k`, `80L`), commercial buying intent (`high`/`warm`/`low`), timeline, and objections across all inbound chats (both Meta Cloud API & QR gateway).
   - Injected live into the Unified Inbox contact sidebar drawer (`contact-sidebar.tsx`) with 1-click database refresh.

2. **Airbnb Multi-Day Stay Booking Engine (`065_airbnb_stays_and_eventbrite_tickets.sql`)**:
   - Dynamic stay mode: Check-in and check-out date pickers with automatic night calculations and guest count (1–12 guests).
   - Dynamic pricing estimator (`Rate × Nights = Total Stay Fee`) with 0% commission.
   - Multi-day calendar scheduling and customized WhatsApp stay confirmation with check-in/out instructions.

3. **Eventbrite Ticket Issuance & Digital RSVP Passes**:
   - Ticket count selector with live pass amount calculations.
   - Automatic generation of unique alphanumeric pass codes (`TKT-XXXXXX`).
   - Digital WhatsApp tickets dispatched directly to attendees with event date and entry code.

4. **Public Business Search & Discovery Directory (`/p`)**:
   - Central marketplace and directory (`https://dfyunicrm.com/p`) showcasing all verified published business micro-pages.
   - Real-time debounced search bar filtering by business name, service, or city.
   - Category filtering pills: *All Businesses*, *Stays & Villas*, *Events & Passes*, *Tours & Travel*, *Clinics & Wellness*, and *Professional Services*.
   - Direct action cards with *"View & Book"* and *"Chat on WhatsApp"*.

5. **Instant Business Micro-Pages & 1-Click WhatsApp Bookings (`/p/[slug]`)**:
   - Dynamic mobile-first storefronts, service catalogs, and printable counter standee flyers.
   - Interactive appointment slot booking modal with automated confirmation notices via approved Meta template (`appointment_reminder_notice`) and QR fallback.

6. **Appointments & Bookings Desk (`/business-pages`)**:
   - First-class dedicated sidebar navigation item and dashboard route.
   - Filter pills for *All*, *Upcoming*, *Stays*, *Events*, *Completed*, and *Cancelled*.
   - Live status tracking (`confirmed`, `completed`, `cancelled`) with automated WhatsApp status alerts.

7. **Google Calendar & 1-Click Scheduling (Cal.com Architecture)**:
   - Synchronizes bookings directly to the workspace owner's connected Google Calendar.
   - Generates 1-click "Add to Google Calendar" (.ics web link) for clients on booking confirmations.

8. **AI Agent Squads & 1-Click Role Playbooks**:
   - Pre-trained WhatsApp personas (*Appointment & Booking Concierge*, *Objection Handler & Value Closer*, *Lead Qualifier & Discovery*, *Customer Support & Care*).

9. **Categorized AI Knowledge Base (AppFlowy Architecture)**:
   - Folder/category hierarchy for FAQs, pricing sheets, and policies feeding the RAG assistant.

10. **Split-Plane BYODB (Bring Your Own Database) & Google Drive Storage**:
    - Centralized auth on platform Supabase with strict Row Level Security (`is_account_member(account_id)`).
    - Media attachments, PDFs, and invoices streamed directly into the tenant's own Google Drive (15 GB free storage).
    - Optional BYODB (Bring Your Own Database) under Settings &rarr; Integrations.

11. **Client Provisioning Desk & 3-Month Pro UniCRM Bundle**:
    - 1-click package preset applying +3 Months AI Pro + 1,000 Lead Finder credits.
    - Dedicated per-tenant key assignment and tracking for AI and Apify scraper runners with instant hot-swapping.

12. **AEO / GEO & Open-SEO Crawler Architecture**:
    - SSR-injected `LocalBusiness`, `Product`, `OfferCatalog` JSON-LD schemas and dynamic sitemaps.

13. **Landing Page Value Proposition**:
    - Transparent community model: **DIY UniCRM Core (Free Forever)** vs. **Get 3-Month Pro UniCRM (₹1,000 Total)**.
    - Zero lock-in, zero predatory per-seat fees.

---

## Agent Guidelines & Memory
- Read `@AGENTS.md` for UI/UX engineering standards and Next.js guidelines.
- Always maintain documentation integrity and preserve unrelated comments/docstrings.
- Ensure all color tokens maintain WCAG contrast in both Light and Dark modes.

---

## Karpathy Coding Guidelines (LLM Guardrails)
Derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls:

1. **Think Before Coding**:
   - Don't assume. Don't hide confusion. Surface tradeoffs.
   - State assumptions explicitly; ask if uncertain.
   - Present options if multiple interpretations exist instead of picking silently.
   - Propose simpler alternatives when warranted.

2. **Simplicity First**:
   - Write the minimum code required to solve the problem; nothing speculative.
   - No unnecessary abstractions or premature generalizability.
   - Rewrite if 200 lines can cleanly be 50 lines.

3. **Surgical Changes**:
   - Touch only what you must. Clean up only your own mess.
   - Match existing style. Do not refactor untouched working code.
   - Every changed line must trace directly to the task.

4. **Goal-Driven Execution**:
   - Define concrete, verifiable success criteria before running edits.
   - Run verification loops (`npx tsc --noEmit`, automated test/build checks) until green.

