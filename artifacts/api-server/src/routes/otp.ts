import { Router } from "express";
import { db } from "@workspace/db";
import { otpTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { sendSMS } from "../lib/sms";

const router = Router();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/otp/send", async (req, res) => {
  try {
    const { phone } = req.body as { phone: string };
    if (!phone || !/^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/\s/g, ""))) {
      res.status(400).json({ error: "Invalid Bangladesh phone number" });
      return;
    }

    const normalizedPhone = phone.replace(/\s/g, "");
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.delete(otpTable).where(eq(otpTable.phone, normalizedPhone));
    await db.insert(otpTable).values({ phone: normalizedPhone, code, expiresAt, used: false });

    const message = `Your AcholGatha OTP is: ${code}. Valid for 10 minutes. Do not share with anyone.`;
    const { sent, demoCode } = await sendSMS(normalizedPhone, message);

    const response: Record<string, unknown> = { success: true, smsSent: sent };
    if (!sent) {
      response["demoMode"] = true;
      response["demoCode"] = demoCode;
      response["message"] = "Demo mode: SMS not configured. Use the code shown below.";
    }

    res.json(response);
  } catch (err) {
    req.log.error({ err }, "OTP send error");
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/otp/verify", async (req, res) => {
  try {
    const { phone, code } = req.body as { phone: string; code: string };
    if (!phone || !code) {
      res.status(400).json({ error: "Phone and code are required" });
      return;
    }

    const normalizedPhone = phone.replace(/\s/g, "");
    const now = new Date();

    const [otp] = await db
      .select()
      .from(otpTable)
      .where(
        and(
          eq(otpTable.phone, normalizedPhone),
          eq(otpTable.code, code),
          eq(otpTable.used, false),
          gt(otpTable.expiresAt, now)
        )
      )
      .limit(1);

    if (!otp) {
      res.status(400).json({ error: "Invalid or expired OTP. Please request a new one." });
      return;
    }

    await db.update(otpTable).set({ used: true }).where(eq(otpTable.id, otp.id));

    res.json({ success: true, message: "Phone verified successfully" });
  } catch (err) {
    req.log.error({ err }, "OTP verify error");
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

export default router;
