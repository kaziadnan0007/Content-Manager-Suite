---
name: SMS Integration Pattern
description: How SMS is set up — shared utility, Twilio config, order notification messages
---

## Shared SMS Utility
- File: `artifacts/api-server/src/lib/sms.ts`
- Function: `sendSMS(phone, message) → { sent, demoCode? }`
- Used by: otp.ts (OTP delivery) and orders.ts (order notifications)

## Twilio Config
- Env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Falls back to console.log in demo mode — never throws, non-blocking

## Order SMS Events
- On order creation: confirmation SMS with order ID + total
- On admin status change: confirmed / processing / shipped / delivered / cancelled
- All SMS include "AcholGatha:" prefix and use BDT currency

**Why:** Real production SMS is critical for Bangladesh market where customers expect phone notifications.
