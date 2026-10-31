# UniCRM Growth, Outbound Architecture & Lead Gen Playbook

This document records the exact architecture, outbound infrastructure, and growth acquisition strategy configured for UniCRM.

## 1. Outbound & Onboarding Infrastructure
- **Sending Domain**: `dfydude.cc.cd` (AWS SES in `ap-south-1` Mumbai)
- **Sender Address**: `UniCRM <hello@dfydude.cc.cd>`
- **Reply-To**: `help@dfyunicrm.com`
- **Application Base URL**: `https://dfyunicrm.com`
- **Public Profile Pages**: `https://dfyunicrm.com/p/{slug}`
- **Automated Ingestion Route**: `POST /api/integrations/profiles/invite`
- **Claim Workspace Route**: `GET /claim?token=...` & `POST /api/claim`
- **Instant Opt-Out / Delete Route**: `GET /opt-out?token=...` & `POST /api/opt-out`
- **Suppression Table**: `email_suppression_list` (bounces, opt-outs permanently suppressed)

---

## 2. Using Free Plans of Apollo.io, Arc AI & Exa for Lead Sourcing

### Apollo.io (Free Plan Strategy)
- **Monthly Free Credits**: 250 export credits/month on the free tier.
- **Chrome Extension Loop**: You can view verified emails for free on LinkedIn profiles using the Apollo Chrome extension without using export credits.
- **Search Filters**:
  - **Country**: India (focus on high-volume metro cities: Mumbai, Pune, Bangalore, Hyderabad, Delhi NCR).
  - **Industries**: *Real Estate*, *Financial Services*, *Legal Services*, *Education Management*.
  - **Job Titles**: *Owner, Founder, Managing Director, Loan Consultant, DSA Partner, Principal Broker*.
- **Workflow**: Export 100–250 verified decision-maker emails monthly and post them to `/api/integrations/profiles/invite`.

### Arc AI / Exa / Web Scraping (OpenClaw CNS)
- Use your EC2 OpenClaw crawler or Exa AI to query publicly listed directories:
  - `"site:magicbricks.com/real-estate-agents in Pune"`
  - `"site:justdial.com loan DSA brokers Bangalore email"`
  - `"site:sulekha.com visa consultants Delhi contact"`
- Extract business name, contact person, verified email, and phone.

---

## 3. Top Growth Loops to Attract & Convert Users

### Loop 1: The "Pre-Built Digital Storefront" Hook
Instead of pitching "Sign up for another CRM", pitch what you have already created for them:
> *"We noticed {{Business_Name}} operates in {{City}}. We pre-built a verified public listing micro-page at `dfyunicrm.com/p/{{slug}}` and a WhatsApp customer inbox. Click below to claim your page and activate your 100% free account."*

Every public micro-page at `/p/[slug]` includes a viral footer badge:
**"Powered by UniCRM — Get your free business WhatsApp inbox"**, which drives organic inbound signups from their visitors.

### Loop 2: WhatsApp & Telegram Group Distribution
Indian property brokers and loan DSAs coordinate daily in WhatsApp / Telegram network groups:
- Post a problem-oriented message:
  > *"Managing 50+ property inquiries on personal WhatsApp is impossible without losing customer chats. We built UniCRM Core — 100% free forever for Indian brokers & financial consultants. Multi-agent WhatsApp inbox, lead categorization, zero seat fees: https://dfyunicrm.com"*

### Loop 3: Free Utility Tools on `dfyunicrm.com`
Create simple SEO utility tools that service providers search for daily:
1. **Free WhatsApp Direct Chat Link & QR Generator** (`/tools/whatsapp-link-generator`).
2. **EMI & Loan Commission Calculator**.
When brokers use the tool to make links for their social media or ads, prompt them: *"Want to automatically organize leads coming from this WhatsApp link? Claim your free UniCRM desk."*
