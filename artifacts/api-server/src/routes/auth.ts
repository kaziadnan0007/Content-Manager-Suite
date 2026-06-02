import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

declare module "express-session" {
  interface SessionData {
    adminId?: number;
    adminUsername?: string;
  }
}

router.post("/auth/login", async (req, res) => {
  try {
    const { password } = req.body as { password: string };
    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    const admins = await db.select().from(adminTable).limit(1);
    const admin = admins[0];

    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;

    res.json({ success: true, admin: { id: admin.id, username: admin.username } });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

router.get("/auth/me", async (req, res) => {
  if (!req.session.adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const admins = await db
      .select({ id: adminTable.id, username: adminTable.username })
      .from(adminTable)
      .where(eq(adminTable.id, req.session.adminId))
      .limit(1);

    const admin = admins[0];
    if (!admin) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json(admin);
  } catch (err) {
    logger.error({ err }, "Get me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
