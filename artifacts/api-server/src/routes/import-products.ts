import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { parse } from "csv-parse/sync";

const router = Router();

interface RawRow {
  name?: string;
  description?: string;
  price?: string;
  compare_price?: string;
  comparePrice?: string;
  category?: string;
  stock?: string;
  featured?: string;
  badge?: string;
  images?: string;
}

router.post("/products/import", async (req, res) => {
  try {
    const { csvData } = req.body as { csvData: string };
    if (!csvData) {
      res.status(400).json({ error: "csvData is required" });
      return;
    }

    let rows: RawRow[];
    try {
      rows = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      }) as RawRow[];
    } catch (parseErr) {
      res.status(400).json({ error: "Invalid CSV format", detail: String(parseErr) });
      return;
    }

    if (!rows.length) {
      res.status(400).json({ error: "CSV has no data rows" });
      return;
    }

    const allCategories = await db.select().from(categoriesTable);
    const catByName = new Map(allCategories.map((c) => [c.name.toLowerCase(), c.id]));
    const catBySlug = new Map(allCategories.map((c) => [c.slug.toLowerCase(), c.id]));

    const getCatId = (val?: string): number | null => {
      if (!val) return null;
      const trimmed = val.trim().toLowerCase();
      const byId = parseInt(trimmed);
      if (!isNaN(byId)) return byId;
      return catByName.get(trimmed) ?? catBySlug.get(trimmed) ?? null;
    };

    const parseImages = (val?: string): string[] => {
      if (!val) return [];
      return val
        .split(/[|,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const inserted: number[] = [];
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const name = row.name?.trim();
      if (!name) {
        errors.push({ row: rowNum, error: "name is required" });
        continue;
      }

      const priceRaw = row.price?.replace(/[^0-9.]/g, "");
      const price = parseFloat(priceRaw ?? "");
      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, error: `invalid price: "${row.price}"` });
        continue;
      }

      const comparePriceRaw = (row.compare_price ?? row.comparePrice ?? "").replace(/[^0-9.]/g, "");
      const comparePrice = comparePriceRaw ? parseFloat(comparePriceRaw) : null;

      const stock = parseInt(row.stock ?? "0");
      const featured = ["true", "yes", "1"].includes((row.featured ?? "").toLowerCase());

      try {
        const [product] = await db
          .insert(productsTable)
          .values({
            name,
            description: row.description?.trim() || null,
            price: String(price),
            comparePrice: comparePrice != null ? String(comparePrice) : null,
            categoryId: getCatId(row.category),
            stock: isNaN(stock) ? 0 : stock,
            featured,
            badge: row.badge?.trim() || null,
            images: parseImages(row.images),
          })
          .returning({ id: productsTable.id });
        inserted.push(product.id);
      } catch (insertErr) {
        errors.push({ row: rowNum, error: String(insertErr) });
      }
    }

    res.json({
      imported: inserted.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 20),
      total: rows.length,
    });
  } catch (err) {
    req.log.error({ err }, "Import products error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
