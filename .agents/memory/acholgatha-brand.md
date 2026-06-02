---
name: AcholGatha brand setup
description: Brand config, color, password, seed data, and Vercel deployment details
---

## Brand
- Name: AcholGatha
- Logo: "AG" text in rounded orange square + Bengali tagline "আপনার পছন্দের শপ"
- Primary color: `hsl(14 100% 52%)` — vibrant Shopee-style orange-red

## Admin Access
- URL: /admin/login
- Password: `AcholGatha@2025`
- Username: admin (stored in DB)

## Seed Data
- 26 products across 10 categories (electronics, clothing, beauty, home-appliances, sports, bags, shoes, watches, kids, books)
- 3 hero banners from Unsplash
- Site settings with Bengali announcement bar

## Vercel Deployment
- Root `vercel.json` deploys the shop frontend as a static SPA
- Build command: `pnpm install && cd artifacts/shop && pnpm run build`
- Output dir: `artifacts/shop/dist/public`
- SPA rewrites: all paths → /index.html
- Backend must be deployed separately (Railway/Render) — see `.env.vercel.example`
- `vite.config.ts` updated to be Vercel-compatible (PORT/BASE_PATH optional)

**Why:** DB migration must be run via `pnpm --filter @workspace/db run push` before first boot.
