# Open-Source References & Architecture Lineage

This document tracks all external open-source projects, repositories, frameworks, and patterns adapted, ported, or integrated into **DFY UniCRM**.

---

## 1. Upstream Foundation: `ArnasDon/wacrm`
* **Repository**: `https://github.com/ArnasDon/wacrm`
* **What we adopted**:
  * Core Next.js 16 + Supabase CRM structure.
  * WhatsApp Business API webhook dispatcher & shared team inbox concept.
  * Visual flow builder foundation and basic contact tagging schema.
* **How UniCRM extended it**:
  * Added Evolution API v2 multi-device WhatsApp QR pairing engine (`https://wa.dfydude.online`).
  * Implemented WebRTC WhatsApp inbound/outbound voice calling with node-based IVR.
  * Added zero-cost Google Drive 15GB media streaming mirror.
  * Integrated multi-channel hubs (Instagram DMs, Facebook Messenger, Support Email desks).
  * Built the "Done-For-You" (DFY) service onboarding and server scarcity architecture.

---

## 2. Agency Personas & Workflows: `msitarzewski/agency-agents`
* **Repository**: `https://github.com/msitarzewski/agency-agents`
* **What we adopted**:
  * Domain-specialized AI agent persona architectures and structured deliverable outputs.
* **How UniCRM uses it**:
  * **In-Product Playbooks** (`src/lib/ai/squads.ts`, `src/components/agents/agent-squads-desk.tsx`):
    * Pre-trained conversational agents available to users: *Booking Concierge*, *Objection Handler & Closer*, *Lead Discovery Qualifier*, *Cart Resuscitator*, *VIP White-Glove Concierge*, and *Catalog Matchmaker*.
  * **Developer Workspace Agents** (`.agents/roster/`):
    * `frontend-architect.md`: Enforces dual-axis theming, luxury gold styling, mobile viewport resilience.
    * `whatsapp-gateway-engineer.md`: Enforces Baileys idempotency, delivery statuses, and vendor moat protection.
    * `security-database-auditor.md`: Enforces tenant-isolated PostgreSQL RLS and pre-push build verification.

---

## 3. Executive Critique & War Room: `nateherkai/roast-room`
* **Repository**: `https://github.com/nateherkai/roast-room`
* **What we adopted**:
  * Multi-agent boardroom deliberation and adversarial critique frameworks.
* **How UniCRM uses it**:
  * **In-Product Feature** (`src/components/agents/strategy-war-room.tsx`, `src/app/api/ai/strategy-roast/route.ts`):
    * Allows business owners to roast their WhatsApp broadcast copy, pricing models, and offers across a 3-agent council:
      1. *Value & Offer Roaster* (Pricing, urgency, risk reversal)
      2. *WhatsApp Attention Roaster* (Mobile length, reply friction, spam risk)
      3. *Operations Roaster* (Fulfillment bottleneck analysis)
    * Computes an Executive Readiness Score (/100) and top actionable fixes before campaign launch.
  * **Developer Workspace Agent** (`.agents/roster/architectural-roast-council.md`):
    * Evaluates new PRs and features against Commercial Moats, Mobile UX, and Infrastructure/Vercel limits.

---

## 4. WhatsApp Cloud Gateway: `EvolutionAPI/evolution-api`
* **Repository**: `https://github.com/EvolutionAPI/evolution-api`
* **What we adopted**:
  * Headless WhatsApp multi-device Baileys gateway service running on Docker.
* **How UniCRM uses it**:
  * Hosted at `https://wa.dfydude.online`.
  * Enables zero-friction QR code pairing, webhook delivery receipts, and voice note streaming directly into UniCRM conversations.

---

## 5. UI Primitives & Styling: `shadcn/ui` + `Tailwind CSS v4`
* **Repository**: `https://github.com/shadcn-ui/ui` & `https://github.com/tailwindlabs/tailwindcss`
* **What we adopted**:
  * Accessible Radix UI primitives (Dialogs, Tabs, Toasts via Sonner, Badges, Buttons).
* **How UniCRM uses it**:
  * Custom styled with luxury high-contrast gold variants (`.btn-gold-gradient`) and synchronous device light/dark boot without hydration flicker.

---

## 6. Multi-Drive Storage Pooling: `zenhosta/9drive`
* **Repository**: `https://github.com/zenhosta/9drive`
* **What we adopted**:
  * The multi-account storage pooling concept (aggregating multiple free 15 GB Google Drive accounts into a unified virtual pool with overflow routing).
* **How UniCRM uses it**:
  * **Database Migration**: `supabase/migrations/066_gdrive_multi_pool.sql` (`gdrive_storage_nodes` table).
  * **Storage Engine** (`src/lib/gdrive/offload.ts`): Automatically inspects pooled Google accounts, balances media uploads, and tracks cumulative storage capacity.
  * **Integrations UI** (`src/components/settings/integrations-panel.tsx`): Displays pooled capacity progress bar (15 GB, 30 GB, 45 GB+) and allows users to click **"Add Extra Drive (+15 GB Pool)"** without server bloat.

---

## Guidelines for Future Adoptions
When adapting ideas or code from new GitHub repositories:
1. **Never copy-paste bloated dependencies**: Re-implement core ideas natively in TypeScript using existing Next.js / Supabase primitives.
2. **Preserve Proprietary Moats**: Internal tool names and open-source origins must remain confidential in all visitor-facing marketing copy.
3. **Log entries here**: Keep this file updated so developers and AI assistants have full architectural memory.
