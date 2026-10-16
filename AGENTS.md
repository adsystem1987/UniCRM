<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI/UX Engineering & Design Standards
- **Always leverage built-in UI/UX skills (`ui-ux-pro-max`, `design-system`, `ui-styling`)** whenever designing, reviewing, refactoring, or implementing frontend components, layouts, pages, animations, or styling.
- Use `ui-ux-pro-max "<query>" --domain <domain>` or `--stack <stack>` to look up design tokens, accessibility rules, color palettes, responsive patterns, and UX best practices.
- Avoid hardcoded arbitrary styles (raw hex colors, fixed pixel widths, random inline styles); use semantic Tailwind design tokens and CSS variables.
- Maintain 60fps performance and zero GPU lockups: avoid heavy full-page `backdrop-blur`, avoid unnecessary re-renders or layout shifts, ensure visible keyboard focus indicators, and maintain WCAG 4.5:1 contrast.
