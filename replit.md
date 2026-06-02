# ShopBD — E-Commerce Platform

বাংলাদেশের সেরা অনলাইন ই-কমার্স প্ল্যাটফর্ম। Admin CMS, bKash/Rocket পেমেন্ট, এবং সম্পূর্ণ পণ্য ব্যবস্থাপনা সহ।

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server চালান (port 8080)
- `pnpm --filter @workspace/shop run dev` — Frontend চালান
- `pnpm run typecheck` — সব packages typecheck
- `pnpm run build` — সব packages build
- `pnpm --filter @workspace/api-spec run codegen` — OpenAPI থেকে hooks ও schemas তৈরি
- `pnpm --filter @workspace/db run push` — DB schema push (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Admin Access

- URL: `/admin/login`
- **Password: `Admin@1234`**

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter routing, TanStack Query, Tailwind CSS, shadcn/ui
- API: Express 5, express-session, bcryptjs
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Database schema files
- `artifacts/api-server/src/routes/` — Backend route handlers
- `artifacts/shop/src/` — Frontend React app
- `artifacts/api-server/src/seed.ts` — Initial seed data

## Architecture decisions

- Admin auth uses express-session (cookie-based), password-only login (bcrypt hashed)
- Image upload: base64 JSON body → saved to `attached_assets/uploads/` → served via `/api/uploads/:filename`
- Site settings stored as a single row in `site_settings` table, auto-created on first access
- Orders store items as JSONB (snapshot of product data at order time)
- Dark/light theme via `next-themes` ThemeProvider

## Product

- **Customer storefront**: Hero banner carousel, category navigation, product search/filter, product detail with gallery, cart, checkout form with bKash/Rocket/COD payment
- **Admin CMS Panel**: Dashboard stats, product manager (CRUD + image upload), category manager, order manager with status updates, banner manager, site settings (logo, social links, payment numbers, announcement bar)
- **Social integration**: WhatsApp floating button, Facebook/Instagram links in footer
- **Payment**: bKash, Rocket, Cash on Delivery — payment numbers shown on checkout

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After schema changes: run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck`
- Product images stored as URL array; upload returns `/api/uploads/<filename>`
- Admin password is bcrypt-hashed in DB; to reset, delete the admin row and restart server

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
