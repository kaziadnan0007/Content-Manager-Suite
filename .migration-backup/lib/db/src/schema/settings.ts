import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("ShopBD"),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color"),
  bkashNumber: text("bkash_number"),
  rocketNumber: text("rocket_number"),
  facebookUrl: text("facebook_url"),
  whatsappNumber: text("whatsapp_number"),
  instagramUrl: text("instagram_url"),
  footerText: text("footer_text"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  announcementText: text("announcement_text"),
  showAnnouncement: boolean("show_announcement").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
