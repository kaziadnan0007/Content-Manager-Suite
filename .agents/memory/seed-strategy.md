---
name: Database Seed Strategy
description: How products and categories are seeded — threshold logic, upsert pattern
---

## Categories
- Upsert by slug: always runs, adds missing categories
- 14 total slugs: electronics, clothing, beauty, home-appliances, sports, bags, shoes, watches, kids, books, furniture, grocery, health, automotive

## Products
- Threshold check: `existingProducts.length < 155`
- New product filter: `!existingNames.has(p.name)` — prevents duplicates by name
- 133+ products after last seed run; target is 155+

**Why:** Using name deduplication (not ID) allows safe re-seeding after schema changes.
**How to apply:** When adding more products, increase the threshold AND add products with unique names.
