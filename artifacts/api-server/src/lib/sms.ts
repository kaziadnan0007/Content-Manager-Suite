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
