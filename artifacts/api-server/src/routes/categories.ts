import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    const counts = await db
      .select({ categoryId: productsTable.categoryId, total: count() })
      .from(productsTable)
      .groupBy(productsTable.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.total)]));
    const result = rows.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat.id) ?? 0,
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "List categories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, slug, image } = req.body as { name: string; slug: string; image?: string };
    if (!name || !slug) {
      res.status(400).json({ error: "Name and slug are required" });
      return;
    }
    const [cat] = await db.insert(categoriesTable).values({ name, slug, image }).returning();
    res.status(201).json({ ...cat, productCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Create category error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    const [cnt] = await db
      .select({ total: count() })
      .from(productsTable)
      .where(eq(productsTable.categoryId, id));
    res.json({ ...cat, productCount: Number(cnt?.total ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Get category error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const { name, slug, image } = req.body as { name?: string; slug?: string; image?: string };
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates["name"] = name;
    if (slug !== undefined) updates["slug"] = slug;
    if (image !== undefined) updates["image"] = image;

    const [cat] = await db
      .update(categoriesTable)
      .set(updates)
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json({ ...cat, productCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Update category error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete category error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
