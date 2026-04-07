# ScoRAGE V1 rebuild

Minimal Next.js 15 + React 19 + TypeScript rebuild for the ScoRAGE V1 plan.

What is included:
- legacy static landing preserved in `legacy/landing-static/`
- Next.js App Router shell
- design tokens ported into `app/globals.css`
- landing marketing migrated into reusable React components
- real `/request` flow with report creation
- core domain types and optional Supabase persistence

Commands:
- `npm install`
- `npm run lint`
- `npm run build`
