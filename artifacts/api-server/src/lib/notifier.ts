import { EventEmitter } from "events";
import type { Response } from "express";
import TelegramBot from "node-telegram-bot-api";
import nodemailer from "nodemailer";

interface OrderNotification {
  type: "new_order";
  orderId: number;
  customerName: string;
  customerPhone: string;
  total: number;
  itemCount: number;
  paymentMethod: string;
  timestamp: string;
}

class SSENotifier extends EventEmitter {
  private clients: Set<Response> = new Set();

  addClient(res: Response): void {
    this.clients.add(res);
    res.on("close", () => this.removeClient(res));
  }

  removeClient(res: Response): void {
    this.clients.delete(res);
  }

  broadcast(notification: OrderNotification): void {
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(data);
      } catch {
        this.removeClient(client);
      }
    }
  }

  get clientCount(): number {
    return this.clients.size;
  }
}

export const notifier = new SSENotifier();
export type { OrderNotification };

// ── Telegram ──────────────────────────────────────────────────────────────

function getTelegramBot(): TelegramBot | null {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) return null;
  return new TelegramBot(token);
}

export async function sendTelegramNotification(orderDetails: {
  customerName: string;
  phone: string;
  email?: string | null;
  productName: string;
  address?: string | null;
  timestamp: string;
}): Promise<void> {
  const groupId = process.env["TELEGRAM_GROUP_ID"];
  if (!groupId) {
    console.log("[Telegram] TELEGRAM_GROUP_ID not set — skipping notification");
    return;
  }
  const bot = getTelegramBot();
  if (!bot) {
    console.log("[Telegram] TELEGRAM_BOT_TOKEN not set — skipping notification");
    return;
  }

  const message =
    `🛒 NEW ORDER RECEIVED\n` +
    `━━━━━━━━━━━━━━━\n` +
    `👤 Name: ${orderDetails.customerName}\n` +
    `📞 Phone: ${orderDetails.phone}\n` +
    `📧 Email: ${orderDetails.email ?? "N/A"}\n` +
    `📦 Product: ${orderDetails.productName}\n` +
    `📍 Address: ${orderDetails.address ?? "N/A"}\n` +
    `🕐 Time: ${orderDetails.timestamp}\n` +
    `✅ Status: CONFIRMED\n` +
    `━━━━━━━━━━━━━━━`;

  try {
    await bot.sendMessage(groupId, message);
  } catch (err) {
    console.error("[Telegram] Failed to send order notification:", err);
  }
}

export async function sendTelegramNewCustomer(customerDetails: {
  customerName: string;
  email?: string | null;
  phone: string;
  timestamp: string;
}): Promise<void> {
  const groupId = process.env["TELEGRAM_GROUP_ID"];
  if (!groupId) {
    console.log("[Telegram] TELEGRAM_GROUP_ID not set — skipping notification");
    return;
  }
  const bot = getTelegramBot();
  if (!bot) {
    console.log("[Telegram] TELEGRAM_BOT_TOKEN not set — skipping notification");
    return;
  }

  const message =
    `🆕 NEW CUSTOMER REGISTERED\n` +
    `━━━━━━━━━━━━━━━\n` +
    `👤 Name: ${customerDetails.customerName}\n` +
    `📧 Email: ${customerDetails.email ?? "N/A"}\n` +
    `📞 Phone: ${customerDetails.phone}\n` +
    `🕐 Time: ${customerDetails.timestamp}\n` +
    `━━━━━━━━━━━━━━━`;

  try {
    await bot.sendMessage(groupId, message);
  } catch (err) {
    console.error("[Telegram] Failed to send new customer notification:", err);
  }
}

// ── Email (nodemailer / Gmail) ─────────────────────────────────────────────

function getMailTransporter(): nodemailer.Transporter | null {
  const user = process.env["GMAIL_USER"];
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderDetails: {
    productName: string;
    address?: string | null;
    timestamp: string;
  }
): Promise<void> {
  const transporter = getMailTransporter();
  const from = process.env["GMAIL_USER"];
  if (!transporter || !from) {
    console.log("[Email] Gmail credentials not set — skipping order confirmation email");
    return;
  }

  const body =
    `Dear ${customerName},\n\n` +
    `Your order has been approved!\n` +
    `You will receive your delivery within 3-5 working days.\n\n` +
    `Order Details:\n` +
    `- Product: ${orderDetails.productName}\n` +
    `- Address: ${orderDetails.address ?? "N/A"}\n` +
    `- Order Time: ${orderDetails.timestamp}\n\n` +
    `Thank you for shopping with us!\n` +
    `Best regards,\n` +
    `AcholGatha`;

  try {
    await transporter.sendMail({
      from,
      to: customerEmail,
      subject: "✅ Your Order is Confirmed!",
      text: body,
    });
  } catch (err) {
    console.error("[Email] Failed to send order confirmation email:", err);
  }
}

export async function sendWelcomeEmail(
  customerEmail: string,
  customerName: string
): Promise<void> {
  const transporter = getMailTransporter();
  const from = process.env["GMAIL_USER"];
  if (!transporter || !from) {
    console.log("[Email] Gmail credentials not set — skipping welcome email");
    return;
  }

  const body =
    `Dear ${customerName},\n\n` +
    `Welcome to AcholGatha! Your account has been successfully created.\n\n` +
    `You can now:\n` +
    `- Track your orders\n` +
    `- Save your delivery address\n` +
    `- Get order updates directly to your email\n\n` +
    `Thank you for joining us!\n` +
    `Best regards,\n` +
    `AcholGatha Team`;

  try {
    await transporter.sendMail({
      from,
      to: customerEmail,
      subject: "🎉 Welcome to AcholGatha!",
      text: body,
    });
  } catch (err) {
    console.error("[Email] Failed to send welcome email:", err);
  }
}
