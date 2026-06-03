---
name: Database Seed Strategy
description: How products and categories are seeded — programmatic generator, threshold logic, upsert pattern
---

## Categories
- Upsert by slug: always runs, adds missing categories
- 14 total slugs: electronics, clothing, beauty, home-appliances, sports, bags, shoes, watches, kids, books, furniture, grocery, health, automotive

## Products
- Threshold check: `existingProducts.length < 5000`
- Programmatic generator: `generateAllProducts(catMap)` in seed.ts — loops over 14 CATEGORY_CONFIGS, each with types/variants/adjectives arrays, producing ~357 products per category (total ~5012)
- Each product has 3 images: front view, side angle, detail close-up (tri() helper builds Unsplash triplets)
- New product filter: `!existingNames.has(p.name)` — prevents duplicates by name
- Batch insert: 500 products per batch to avoid query size limits

**Why:** Programmatic generation keeps seed.ts compact while producing thousands of unique, categorized products with realistic 3-angle image sets.
**How to apply:** To add more products, edit CATEGORY_CONFIGS arrays (types/variants/adjectives). To increase total, bump the threshold AND add more array entries. Never hardcode individual products.

## Pre-requisite
- Run `pnpm --filter @workspace/db run push` before first seed to create tables (drizzle-kit push).
