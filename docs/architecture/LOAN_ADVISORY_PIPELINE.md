# UniCRM Loan Advisory Architecture & Conversational Lead Capture

## 1. Overview
The Loan Advisory Desk (`/loans`) acts as an intelligent conversational origination portal for borrowers.
It blends AI conversational underwriting with real-time staff oversight, CRM pipeline deal progression, and omnichannel follow-ups (WhatsApp + Email) without any mandatory upfront friction or rigid form fields.

## 2. Data Flow & Multi-Table Persistence
When a borrower interacts on `/loans`:
1. **Conversations (`conversations` table)**:
   - `channel`: `'loans'`
   - `status`: `'open'`
   - `ai_autoreply_disabled`: `false` by default, flipped to `true` when a staff member takes over from `/inbox`, and back to `false` when "Resume AI / AI Support" is toggled.
   - `assigned_agent_id`: Staff member owning the thread.
2. **Messages (`messages` table)**:
   - Stores each exchange (`sender_type`: `'customer'`, `'bot'`, or `'agent'`).
   - Synced in real-time to both borrower view (`/loans`) and staff view (`/inbox`).
3. **Contacts (`contacts` table)**:
   - Automatically identified or created via borrower profile or extracted phone/name.
4. **CRM Pipelines & Deals (`pipelines` and `deals` tables)**:
   - Automatically placed into the `Lending & Capital Desk` pipeline under Stage 1 (`1. New Qualified Leads`).
   - Deal value dynamically updated as loan amounts are identified.
5. **Loan Applications (`loan_applications` table)**:
   - Captures categorized borrower details (`loan_category`, `amount_requested`, `business_name`, `monthly_turnover`, `business_vintage`, `city`, `status`).
   - Visible to platform owners and partner DSAs in the Partner Lead Desk.

## 3. Human Takeover & AI Support Toggle
- Platform owner can open `/inbox`, select any borrower thread from the `loans` channel, and see the full history.
- Clicking **Take Over** calls `/api/ai/autoreply/[conversationId]` with `{ paused: true, assign_to_me: true }`.
- Clicking **Resume AI (AI Support)** calls `/api/ai/autoreply/[conversationId]` with `{ paused: false }`, re-engaging the AI underwriter with fresh reply tokens.

## 4. Omnichannel Inactivity Drop-off Recovery
- If a borrower goes idle on `/loans` for > 5 minutes after initiating a conversation, UniCRM can dispatch an outreach message via WhatsApp (Meta API / Evolution API) or Email.
- If the customer replies on WhatsApp, the message is routed to the exact same conversation thread in `/inbox`.
