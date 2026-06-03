import nodemailer from "nodemailer";

// ── Gmail OTP email ────────────────────────────────────────────────────────

export async function sendOtpEmail(
  toEmail: string,
  otpCode: string
): Promise<{ sent: boolean }> {
  const user = process.env["GMAIL_USER"];
  const pass = process.env["GMAIL_APP_PASSWORD"];

  if (!user || !pass) {
    console.log(`[OTP EMAIL] Gmail not configured — OTP for ${toEmail}: ${otpCode}`);
    return { sent: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"AcholGatha" <${user}>`,
      to: toEmail,
      subject: "Your OTP Code - AcholGatha",
      text: [
        `Your OTP verification code is: ${otpCode}`,
        `This code expires in 10 minutes.`,
        `Do not share this code with anyone.`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#00D4FF;margin:0 0 16px">AcholGatha</h2>
          <p style="font-size:15px;color:#374151;margin:0 0 8px">Your OTP verification code is:</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#111827;background:#f3f4f6;padding:16px 24px;border-radius:8px;text-align:center;margin:16px 0;">
            ${otpCode}
          </div>
          <p style="font-size:13px;color:#6b7280;margin:0 0 4px">⏱ This code expires in <strong>10 minutes</strong>.</p>
          <p style="font-size:13px;color:#6b7280;margin:0">🔒 Do not share this code with anyone.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
          <p style="font-size:11px;color:#9ca3af;margin:0">© AcholGatha — Bangladesh's #1 Online Shop</p>
        </div>
      `,
    });

    console.log(`[OTP EMAIL] Sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error("[OTP EMAIL] Failed to send:", err);
    return { sent: false };
  }
}

// ── Twilio SMS (optional — used for status update SMS, not OTP) ────────────

export async function sendSMS(
  phone: string,
  message: string
): Promise<{ sent: boolean; demoCode?: string }> {
  const accountSid = process.env["TWILIO_ACCOUNT_SID"];
  const authToken = process.env["TWILIO_AUTH_TOKEN"];
  const fromPhone = process.env["TWILIO_PHONE_NUMBER"];

  if (accountSid && authToken && fromPhone) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const body = new URLSearchParams({ To: phone, From: fromPhone, Body: message });
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      if (response.ok) {
        return { sent: true };
      }
      const err = await response.text();
      console.error("[SMS] Twilio error:", err);
    } catch (err) {
      console.error("[SMS] Twilio request failed:", err);
    }
  }

  const match = message.match(/\d{6}/);
  console.log(`[SMS DEMO] → ${phone}: ${message}`);
  return { sent: false, demoCode: match ? match[0] : undefined };
}
