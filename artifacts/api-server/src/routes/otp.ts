import { Router } from "express";
import { db } from "@workspace/db";
import { otpTable, customers } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { sendSMS, sendOtpEmail } from "../lib/sms";

const router = Router();

// ── In-memory attempt tracker (resets when new OTP is issued) ─────────────
const attemptMap = new Map<string, { otpId: number; attempts: number }>();
const MAX_ATTEMPTS = 3;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── POST /otp/send ─────────────────────────────────────────────────────────
// Body: { phone: string, email?: string }
// If email not provided, we look it up from the customers table by phone.
// Delivery priority: Gmail email → Twilio SMS → demo console log.

router.post("/otp/send", async (req, res) => {
  try {
    const { phone, email: bodyEmail } = req.body as { phone: string; email?: string };

    if (!phone || !/^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/\s/g, ""))) {
      res.status(400).json({ error: "Invalid Bangladesh phone number" });
      return;
    }

    const normalizedPhone = phone.replace(/\s/g, "");
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused OTP for this phone
    await db.delete(otpTable).where(eq(otpTable.phone, normalizedPhone));

    const [inserted] = await db
      .insert(otpTable)
      .values({ phone: normalizedPhone, code, expiresAt, used: false })
      .returning();

    // Reset attempt counter for this phone whenever a new OTP is issued
    attemptMap.set(normalizedPhone, { otpId: inserted!.id, attempts: 0 });

    // Resolve delivery email: use provided email, or look up from customers table
    let deliveryEmail = bodyEmail?.trim() || null;
    if (!deliveryEmail) {
      const [customer] = await db
        .select({ email: customers.email })
        .from(customers)
        .where(eq(customers.phone, normalizedPhone))
        .limit(1);
      deliveryEmail = customer?.email ?? null;
    }

    // Try Gmail first
    if (deliveryEmail) {
      const { sent } = await sendOtpEmail(deliveryEmail, code);
      if (sent) {
        res.json({
          success: true,
          emailSent: true,
          message: `OTP sent to your email address.`,
        });
        return;
      }
    }

    // Fallback: Twilio SMS
    const smsMessage = `Your SAFQUN OTP is: ${code}. Valid for 10 minutes. Do not share with anyone.`;
    const { sent: smsSent, demoCode } = await sendSMS(normalizedPhone, smsMessage);

    if (smsSent) {
      res.json({ success: true, smsSent: true });
      return;
    }

    // Final fallback: demo mode (returns code in response for testing)
    res.json({
      success: true,
      emailSent: false,
      smsSent: false,
      demoMode: true,
      demoCode,
      message: "Demo mode: no delivery configured. Use the code shown below.",
    });
  } catch (err) {
    req.log.error({ err }, "OTP send error");
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ── POST /otp/verify ───────────────────────────────────────────────────────
// Body: { phone: string, code: string }
// Returns 429 after MAX_ATTEMPTS failed tries on the same OTP.

router.post("/otp/verify", async (req, res) => {
  try {
    const { phone, code } = req.body as { phone: string; code: string };
    if (!phone || !code) {
      res.status(400).json({ error: "Phone and code are required" });
      return;
    }

    const normalizedPhone = phone.replace(/\s/g, "");

    // Attempt-limit check
    const tracker = attemptMap.get(normalizedPhone);
    if (tracker && tracker.attempts >= MAX_ATTEMPTS) {
      res.status(429).json({
        error: `Too many incorrect attempts. Please request a new OTP.`,
      });
      return;
    }

    const now = new Date();
    const [otp] = await db
      .select()
      .from(otpTable)
      .where(
        and(
          eq(otpTable.phone, normalizedPhone),
          eq(otpTable.used, false),
          gt(otpTable.expiresAt, now)
        )
      )
      .limit(1);

    if (!otp) {
      res.status(400).json({ error: "OTP expired. Please request a new one." });
      return;
    }

    // Wrong code — increment attempt counter
    if (otp.code !== code.trim()) {
      const current = attemptMap.get(normalizedPhone) ?? { otpId: otp.id, attempts: 0 };
      const newAttempts = current.attempts + 1;
      attemptMap.set(normalizedPhone, { otpId: otp.id, attempts: newAttempts });
      const remaining = MAX_ATTEMPTS - newAttempts;
      res.status(400).json({
        error: remaining > 0
          ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many incorrect attempts. Please request a new OTP.",
      });
      return;
    }

    // Correct code — mark used and clear tracker
    await db.update(otpTable).set({ used: true }).where(eq(otpTable.id, otp.id));
    attemptMap.delete(normalizedPhone);

    res.json({ success: true, message: "Phone verified successfully" });
  } catch (err) {
    req.log.error({ err }, "OTP verify error");
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

export default router;
