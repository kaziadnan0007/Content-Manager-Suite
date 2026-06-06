import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function escapeCsv(val: unknown): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

router.get("/products/export", async (req, res) => {
  try {
    const rows = await db
      .select({
        product: productsTable,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .orderBy(desc(productsTable.createdAt));

    const headers = [
      "id", "name", "description", "price", "compare_price",
      "category", "stock", "featured", "badge", "images",
    ];

    const csvLines: string[] = [headers.join(",")];

    for (const { product: p, categoryName } of rows) {
      const row = [
        p.id,
        p.name,
        p.description ?? "",
        Number(p.price),
        p.comparePrice != null ? Number(p.comparePrice) : "",
        categoryName ?? "",
        p.stock,
        p.featured ? "true" : "false",
        p.badge ?? "",
        (p.images ?? []).join("|"),
      ].map(escapeCsv);
      csvLines.push(row.join(","));
    }

    const csv = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="products-export.csv"');
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Export products error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
