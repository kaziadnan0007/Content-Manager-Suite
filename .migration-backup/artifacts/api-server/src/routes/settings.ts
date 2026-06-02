import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

async function ensureSettings() {
  const existing = await db.select().from(siteSettingsTable).limit(1);
  if (existing.length > 0) return existing[0]!;
  const [created] = await db.insert(siteSettingsTable).values({
    siteName: "AcholGatha",
    tagline: "আপনার পছন্দের অনলাইন শপ",
    bkashNumber: "01700000000",
    rocketNumber: "01800000000",
    whatsappNumber: "01700000000",
    heroTitle: "সেরা পণ্য, সেরা দাম",
    heroSubtitle: "বাংলাদেশের সেরা অনলাইন শপিং — bKash ও Cash on Delivery সুবিধা",
    footerText: `© ${new Date().getFullYear()} AcholGatha. All rights reserved.`,
    showAnnouncement: true,
    announcementText: "🔥 বিশেষ অফার: আজই অর্ডার করুন — ৳500+ অর্ডারে ফ্রি ডেলিভারি!",
  }).returning();
  return created!;
}

router.get("/settings", async (req, res) => {
  try {
    const settings = await ensureSettings();
    res.json(settings);
  } catch (err) {
    req.log.error({ err }, "Get settings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    const existing = await ensureSettings();
    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    const fields = [
      "siteName", "tagline", "logoUrl", "faviconUrl", "primaryColor",
      "bkashNumber", "rocketNumber", "facebookUrl", "whatsappNumber",
      "instagramUrl", "footerText", "heroTitle", "heroSubtitle",
      "announcementText", "showAnnouncement",
    ];

    for (const field of fields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const [updated] = await db
      .update(siteSettingsTable)
      .set(updates)
      .where(eq(siteSettingsTable.id, existing.id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update settings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Banners ─────────────────────────────────────────────────────────────────
router.get("/banners", async (req, res) => {
  try {
    const banners = await db.select().from(bannersTable).orderBy(asc(bannersTable.sortOrder));
    res.json(banners);
  } catch (err) {
    req.log.error({ err }, "List banners error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/banners", async (req, res) => {
  try {
    const body = req.body as {
      title: string;
      subtitle?: string;
      imageUrl: string;
      linkUrl?: string;
      sortOrder?: number;
      active?: boolean;
    };
    const [banner] = await db.insert(bannersTable).values({
      title: body.title,
      subtitle: body.subtitle ?? null,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl ?? null,
      sortOrder: body.sortOrder ?? 0,
      active: body.active ?? true,
    }).returning();
    res.status(201).json(banner);
  } catch (err) {
    req.log.error({ err }, "Create banner error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/banners/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    const fields = ["title", "subtitle", "imageUrl", "linkUrl", "sortOrder", "active"];
    for (const f of fields) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    const [banner] = await db
      .update(bannersTable)
      .set(updates)
      .where(eq(bannersTable.id, id))
      .returning();
    if (!banner) {
      res.status(404).json({ error: "Banner not found" });
      return;
    }
    res.json(banner);
  } catch (err) {
    req.log.error({ err }, "Update banner error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/banners/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete banner error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
