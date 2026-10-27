<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI/UX Engineering & Design Standards
- **Always leverage built-in UI/UX skills (`ui-ux-pro-max`, `design-system`, `ui-styling`)** whenever designing, reviewing, refactoring, or implementing frontend components, layouts, pages, animations, or styling.
- Use `ui-ux-pro-max "<query>" --domain <domain>` or `--stack <stack>` to look up design tokens, accessibility rules, color palettes, responsive patterns, and UX best practices.
- Avoid hardcoded arbitrary styles (raw hex colors, fixed pixel widths, random inline styles); use semantic Tailwind design tokens and CSS variables.
- Maintain 60fps performance and zero GPU lockups: avoid heavy full-page `backdrop-blur`, avoid unnecessary re-renders or layout shifts, ensure visible keyboard focus indicators, and maintain WCAG 4.5:1 contrast.

# Public Copy & Messaging Standards
- **No Developer/System Jargon in Public Copy**: Never expose internal developer, backend, or CRM architecture terms to end users or website visitors (e.g., avoid "CRM automations", "database webhook", "trigger flow", "RLS", "Supabase", "Evolution API", "Groq").
- **Customer-Centric Microcopy**: Keep visitor-facing copy clean, reassuring, and benefit-oriented (e.g., use "Enter your email or WhatsApp so our team can send your reply" instead of "Required to link CRM automations").

# Deployment & Vercel Hobby Quotas
- **Conserve Vercel Deployments**: Vercel Hobby accounts have strict daily build limits (100 builds/day max).
- **Batch Git Pushes**: Avoid pushing single small code tweaks or formatting changes. Complete the entire feature/fix, run local verification (`npx tsc --noEmit`), and batch into a single push after getting user approval.
- **No Redundant Triggers**: Always test thoroughly locally to prevent build failures that burn deployment quotas.
