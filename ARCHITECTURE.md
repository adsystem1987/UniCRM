# UniCRM System Architecture & Billing Guidelines

## 1. Zero-Cost Infrastructure Policy (Strict Rule)
- **Vercel**: Strictly on the **$0 Free / Hobby Tier** (serverless Next.js).
- **Supabase**: Strictly on the **$0 Free Tier** (used strictly for auth and tenant routing).
- **Cloudflare**: Strictly on the **$0 Free Tier** (DNS, SSL, caching, and **Cloudflare R2 10 GB Free Tier** with $0 egress fees).
- **ONLY Paid Infrastructure**:
  - AWS EC2 instance (`13.235.207.253`) for OmniRoute AI Gateway / OpenOutreach.
  - AWS SES (`outreach.dfydude.online`, Mumbai `ap-south-1`) for email delivery.

## 2. Zero-Database D2C Storefronts via Cloudflare R2
- Storefront catalogs are stored as lightweight static `store.json` files in Cloudflare R2 (`unicrm-storefronts`).
- Public URL: `https://cdn.dfyunicrm.com/{slug}/store.json`.
- Product images use external CDN URLs (Instagram, Shopify, Imgur) to avoid storage bloat.
- Public web shoppers browsing stores generate **0 database queries** on Supabase.
- Client CRM leads and customer data are stored in their own personal Supabase databases via **BYOD (Bring Your Own Database)**.

## 3. Git & Deployment Protocols
- **Always commit and push to `staging` branch first.**
- **NEVER push to `main` without explicit user approval.**
- **NEVER run `vercel --prod` without explicit user approval.**
