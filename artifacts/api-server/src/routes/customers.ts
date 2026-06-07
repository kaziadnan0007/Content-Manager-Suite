import { Router } from "express";
import { db } from "@workspace/db";
import { customers } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail, sendTelegramNewCustomer } from "../lib/notifier";

const router = Router();

const BCRYPT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function ensureCustomersTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT,
        password_hash TEXT,
        address TEXT,
        city TEXT,
        session_token TEXT,
        is_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  } catch {
    /* table already exists */
  }
}
ensureCustomersTable();

/* ─── Register — OTP must be verified BEFORE calling this ──────────────── */
/* Creates the account with isVerified: true (OTP already verified on FE).  */
/* Fires Telegram new-customer notification + welcome email.                 */
router.post("/customers/register", async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: "Name, phone, and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    const existing = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
    if (existing.length > 0 && existing[0].isVerified) {
      return res.status(409).json({ error: "Phone number already registered. Please sign in." });
    }
    const token = generateToken();
    const hash = await hashPassword(password);
    let customer;
    if (existing.length > 0) {
      [customer] = await db.update(customers)
        .set({ name, email: email || null, passwordHash: hash, isVerified: true, sessionToken: token })
        .where(eq(customers.phone, phone))
        .returning();
    } else {
      [customer] = await db.insert(customers)
        .values({ name, phone, email: email || null, passwordHash: hash, isVerified: true, sessionToken: token })
        .returning();
    }

    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

    // Fire Telegram and welcome email after OTP-verified registration
    sendTelegramNewCustomer({
      customerName: customer!.name,
      email: customer!.email,
      phone: customer!.phone,
      timestamp,
    }).catch(() => {});

    if (customer!.email) {
      sendWelcomeEmail(customer!.email, customer!.name).catch(() => {});
    }

    res.json({
      success: true,
      token,
      customer: {
        id: customer!.id,
        name: customer!.name,
        phone: customer!.phone,
        email: customer!.email,
        address: customer!.address,
        city: customer!.city,
      },
    });
  } catch {
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

/* ─── Activate after OTP verified (legacy / reset flow) ─────────────────── */
router.post("/customers/activate", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone required" });
  try {
    const token = generateToken();
    const [customer] = await db.update(customers)
      .set({ isVerified: true, sessionToken: token })
      .where(eq(customers.phone, phone))
      .returning();
    if (!customer) return res.status(404).json({ error: "Account not found" });
    res.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
      },
    });
  } catch {
    res.status(500).json({ error: "Activation failed" });
  }
});

/* ─── Login ─────────────────────────────────────────────────────────────── */
router.post("/customers/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "Phone and password are required" });
  try {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
    if (!customer) return res.status(401).json({ error: "No account found with this phone number" });
    if (!customer.isVerified) return res.status(403).json({ error: "Phone not verified. Please verify your account first.", needsVerification: true, phone });
    const passwordOk = customer.passwordHash ? await verifyPassword(password, customer.passwordHash) : false;
    if (!passwordOk) return res.status(401).json({ error: "Incorrect password" });
    const token = generateToken();
    await db.update(customers).set({ sessionToken: token }).where(eq(customers.id, customer.id));
    res.json({
      success: true,
      token,
      customer: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email, address: customer.address, city: customer.city },
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

/* ─── Get profile ──────────────────────────────────────────────────────── */
router.get("/customers/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const [customer] = await db.select().from(customers).where(eq(customers.sessionToken, token)).limit(1);
    if (!customer) return res.status(401).json({ error: "Invalid or expired session" });
    res.json({ id: customer.id, name: customer.name, phone: customer.phone, email: customer.email, address: customer.address, city: customer.city });
  } catch {
    res.status(500).json({ error: "Failed to get profile" });
  }
});

/* ─── Update profile ───────────────────────────────────────────────────── */
router.put("/customers/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const { name, email, address, city } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  try {
    const [customer] = await db.update(customers)
      .set({ name, email: email || null, address: address || null, city: city || null })
      .where(eq(customers.sessionToken, token))
      .returning();
    if (!customer) return res.status(401).json({ error: "Invalid session" });
    res.json({ success: true, customer: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email, address: customer.address, city: customer.city } });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

/* ─── Reset password (after OTP verify) ───────────────────────────────── */
router.post("/customers/reset-password", async (req, res) => {
  const { phone, newPassword } = req.body;
  if (!phone || !newPassword) return res.status(400).json({ error: "Phone and new password required" });
  if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
  try {
    const token = generateToken();
    const [customer] = await db.update(customers)
      .set({ passwordHash: await hashPassword(newPassword), sessionToken: token, isVerified: true })
      .where(eq(customers.phone, phone))
      .returning();
    if (!customer) {
      const [newCustomer] = await db.insert(customers).values({
        name: "Customer",
        phone,
        passwordHash: await hashPassword(newPassword),
        isVerified: true,
        sessionToken: token,
      }).returning();
      return res.json({ success: true, token, customer: { id: newCustomer.id, name: newCustomer.name, phone: newCustomer.phone } });
    }
    res.json({ success: true, token, customer: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email } });
  } catch {
    res.status(500).json({ error: "Password reset failed" });
  }
});

/* ─── Logout ────────────────────────────────────────────────────────────── */
router.post("/customers/logout", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    await db.update(customers).set({ sessionToken: null }).where(eq(customers.sessionToken, token)).catch(() => {});
  }
  res.json({ success: true });
});

/* ─── Admin: list all customers ─────────────────────────────────────────── */
router.get("/admin/customers", async (req, res) => {
  if (!req.session?.adminId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const all = await db
      .select({ id: customers.id, name: customers.name, phone: customers.phone, email: customers.email, isVerified: customers.isVerified, createdAt: customers.createdAt })
      .from(customers)
      .orderBy(desc(customers.createdAt))
      .limit(500);
    res.json({ customers: all, total: all.length });
  } catch {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

/* ─── Admin: create customer ─────────────────────────────────────────────── */
router.post("/admin/customers", async (req, res) => {
  if (!req.session?.adminId) return res.status(401).json({ error: "Unauthorized" });
  const { name, phone, email, password } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
  try {
    const existing = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "Phone number already registered" });
    const hash = password ? await hashPassword(password) : await hashPassword("123456");
    const token = generateToken();
    const [customer] = await db.insert(customers)
      .values({ name, phone, email: email || null, passwordHash: hash, isVerified: true, sessionToken: token })
      .returning();
    res.json({ success: true, customer });
  } catch {
    res.status(500).json({ error: "Failed to create customer" });
  }
});

/* ─── Admin: delete customer ─────────────────────────────────────────────── */
router.delete("/admin/customers/:id", async (req, res) => {
  if (!req.session?.adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    const deleted = await db.delete(customers).where(eq(customers.id, id)).returning();
    if (!deleted.length) return res.status(404).json({ error: "Customer not found" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

/* ─── Admin: update customer ─────────────────────────────────────────────── */
router.put("/admin/customers/:id", async (req, res) => {
  if (!req.session?.adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const { name, email, isVerified } = req.body;
  try {
    const [customer] = await db.update(customers)
      .set({ name, email: email || null, isVerified: !!isVerified })
      .where(eq(customers.id, id))
      .returning();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ success: true, customer });
  } catch {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

export default router;
