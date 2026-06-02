import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, desc, count } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

function mapProduct(p: typeof productsTable.$inferSelect, categoryName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
    images: p.images ?? [],
    categoryId: p.categoryId,
    categoryName: categoryName ?? null,
    stock: p.stock,
    featured: p.featured,
    badge: p.badge,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.get("/products", async (req, res) => {
  try {
    const { categoryId, search, featured, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const catIdNum = categoryId ? parseInt(categoryId) : NaN;
    if (categoryId && !isNaN(catIdNum)) conditions.push(eq(productsTable.categoryId, catIdNum));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (featured === "true") conditions.push(eq(productsTable.featured, true));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [products, totalResult] = await Promise.all([
      db
        .select({
          product: productsTable,
          categoryName: categoriesTable.name,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(where)
        .orderBy(desc(productsTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db
        .select({ total: count() })
        .from(productsTable)
        .where(where),
    ]);

    res.json({
      products: products.map((r) => mapProduct(r.product, r.categoryName)),
      total: Number(totalResult[0]?.total ?? 0),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "List products error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = req.body as {
      name: string;
      description?: string;
      price: number;
      comparePrice?: number;
      images?: string[];
      categoryId?: number;
      stock: number;
      featured?: boolean;
      badge?: string;
    };

    const [product] = await db.insert(productsTable).values({
      name: body.name,
      description: body.description,
      price: String(body.price),
      comparePrice: body.comparePrice != null ? String(body.comparePrice) : null,
      images: body.images ?? [],
      categoryId: body.categoryId ?? null,
      stock: body.stock ?? 0,
      featured: body.featured ?? false,
      badge: body.badge ?? null,
    }).returning();

    res.status(201).json(mapProduct(product));
  } catch (err) {
    req.log.error({ err }, "Create product error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/featured", async (req, res) => {
  try {
    const products = await db
      .select({ product: productsTable, categoryName: categoriesTable.name })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.featured, true))
      .limit(12);
    res.json(products.map((r) => mapProduct(r.product, r.categoryName)));
  } catch (err) {
    req.log.error({ err }, "Featured products error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [row] = await db
      .select({ product: productsTable, categoryName: categoriesTable.name })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id));

    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(mapProduct(row.product, row.categoryName));
  } catch (err) {
    req.log.error({ err }, "Get product error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (body["name"] !== undefined) updates["name"] = body["name"];
    if (body["description"] !== undefined) updates["description"] = body["description"];
    if (body["price"] !== undefined) updates["price"] = String(body["price"]);
    if (body["comparePrice"] !== undefined) updates["comparePrice"] = body["comparePrice"] != null ? String(body["comparePrice"]) : null;
    if (body["images"] !== undefined) updates["images"] = body["images"];
    if (body["categoryId"] !== undefined) updates["categoryId"] = body["categoryId"];
    if (body["stock"] !== undefined) updates["stock"] = body["stock"];
    if (body["featured"] !== undefined) updates["featured"] = body["featured"];
    if (body["badge"] !== undefined) updates["badge"] = body["badge"];

    const [product] = await db
      .update(productsTable)
      .set(updates)
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(mapProduct(product));
  } catch (err) {
    req.log.error({ err }, "Update product error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete product error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
