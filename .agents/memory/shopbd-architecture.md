---
name: AcholGatha ShopBD Architecture
description: Key design decisions, color system, and conventions for the ShopBD/AcholGatha project
---

## Color System
- Primary (Electric Cyan): `--primary: 192 100% 42%` (light) / `192 100% 50%` (dark)
- Primary foreground: dark `210 100% 5%` (NOT white — cyan is bright)
- Dark background (navy): `218 48% 5%` (≈ #070E1A)
- Flash sale gradient: `192 100% 38%` → `217 91% 52%`

**Why:** User requested Electric Cyan / Neon Blue (#00D4FF) theme like eBay/Amazon.

## Currency
- Always use `BDT 1,200` format — NEVER ৳ symbol — applies everywhere in UI and SMS messages

## Logo (Rakuten-style)
- `AcholGathaLogo` component in store-layout.tsx
- SVG lightning bolt inside gradient rounded square badge
- Bold "Achol" + cyan "Gatha" wordmark + "BANGLADESH'S #1 STORE" subtitle

## Stack
- Monorepo (pnpm): shop (React+Vite+Wouter), api-server (Express+Drizzle), shared lib/api-client-react
- Admin at /admin/login (password: AcholGatha@2025)
