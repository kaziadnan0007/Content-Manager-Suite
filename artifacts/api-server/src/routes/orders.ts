import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import { notifier } from "../lib/notifier";
import { sendSMS, sendOtpEmail } from "../lib/sms";
import { sendOrderConfirmationEmail } from "../lib/notifier";

const router = Router();

const STATUS_SMS: Record<string, (name: string, orderId: number, total: number) => string> = {
  confirmed: (name, id) =>
    `✅ SAFQUN: Hi ${name}, your Order #${id} has been CONFIRMED and is being prepared. Thank you for shopping with us!`,
  processing: (name, id) =>
    `📦 SAFQUN: Hi ${name}, your Order #${id} is now PROCESSING. We're packing your items carefully!`,
  shipped: (name, id) =>
    `🚚 SAFQUN: Great news ${name}! Your Order #${id} has been SHIPPED and is on its way. Track your order at safqun.com`,
  delivered: (name, id, total) =>
    `🎉 SAFQUN: Hi ${name}, your Order #${id} (BDT ${total.toLocaleString()}) has been DELIVERED! We hope you love it. Rate us & shop again at safqun.com`,
  cancelled: (name, id) =>
    `❌ SAFQUN: Hi ${name}, your Order #${id} has been CANCELLED. For queries call us or WhatsApp at 01700000000.`,
};

function mapOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    items: (
      o.items as Array<{
        productId: number;
        productName: string;
        productImage: string | null;
        quantity: number;
        price: number;
      }>
    ).map((item) => ({
      id: null,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    total: Number(o.total),
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentNumber: o.paymentNumber,
    transactionId: o.transactionId,
    note: o.note,
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/orders/track", async (req, res) => {
  try {
    const { orderId, phone } = req.query as { orderId?: string; phone?: string };
    if (!orderId || !phone) {
      res.status(400).json({ error: "orderId and phone are required" });
      return;
    }
    const id = parseInt(orderId);
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.customerPhone, phone.trim())));

    if (!order) {
      res.status(404).json({ error: "Order not found. Please check your order ID and phone number." });
      return;
    }
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Track order error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status) conditions.push(eq(ordersTable.status, status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [orders, totalResult] = await Promise.all([
      db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ total: count() }).from(ordersTable).where(where),
    ]);

    res.json({
      orders: orders.map(mapOrder),
      total: Number(totalResult[0]?.total ?? 0),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "List orders error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const body = req.body as {
      customerName: string;
      customerPhone: string;
      customerAddress?: string;
      customerCity?: string;
      customerEmail?: string;
      items: Array<{ productId: number; quantity: number }>;
      paymentMethod: string;
      paymentNumber?: string;
      transactionId?: string;
      note?: string;
    };

    if (!body.customerName || !body.customerPhone || !body.items?.length) {
      res.status(400).json({ error: "Required fields missing" });
      return;
    }

    const allProducts = await db.select().from(productsTable);
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    let total = 0;
    const orderItems = body.items.map((item) => {
      const product = productMap.get(item.productId);
      const price = product ? Number(product.price) : 0;
      total += price * item.quantity;
      return {
        productId: item.productId,
        productName: product?.name ?? "Unknown Product",
        productImage: product?.images?.[0] ?? null,
        quantity: item.quantity,
        price,
      };
    });

    const fullAddress = body.customerCity
      ? `${body.customerAddress ?? ""}, ${body.customerCity}`.trim().replace(/^,\s*/, "")
      : (body.customerAddress ?? null);

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerAddress: fullAddress,
        customerEmail: body.customerEmail?.trim() || null,
        items: orderItems,
        total: String(total),
        status: "pending",
        paymentMethod: body.paymentMethod,
        paymentNumber: body.paymentNumber ?? null,
        transactionId: body.transactionId ?? null,
        note: body.note ?? null,
      })
      .returning();

    // ── Broadcast websocket event for admin dashboard ──
    notifier.broadcast({
      type: "new_order",
      orderId: order!.id,
      customerName: order!.customerName,
      customerPhone: order!.customerPhone,
      total,
      itemCount: orderItems.reduce((s, i) => s + i.quantity, 0),
      paymentMethod: order!.paymentMethod,
      timestamp: new Date().toISOString(),
    });

    const orderTimestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
    const firstProductName = orderItems[0]?.productName ?? "N/A";
    const totalQuantity = orderItems.reduce((s, i) => s + i.quantity, 0);
    const customerEmail = body.customerEmail?.trim() || null;
    const displayAddress = fullAddress || "N/A";

    // ── Telegram notification ──────────────────────────────────────────────
    const botToken = process.env["TELEGRAM_BOT_TOKEN"];
    const groupId = process.env["TELEGRAM_GROUP_ID"];
    if (botToken && groupId) {
      const telegramMsg = [
        "🛒 NEW ORDER CONFIRMED",
        "━━━━━━━━━━━━━━━",
        `👤 Name: ${order!.customerName}`,
        `📞 Phone: ${order!.customerPhone}`,
        `📧 Email: ${customerEmail ?? "Not provided"}`,
        `📍 Address: ${displayAddress}`,
        `📦 Product: ${firstProductName}`,
        `🔢 Quantity: ${totalQuantity}`,
        `💰 Total: BDT ${total.toLocaleString()}`,
        `🕐 Time: ${orderTimestamp}`,
        "✅ Status: CONFIRMED",
        "━━━━━━━━━━━━━━━",
      ].join("\n");

      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: groupId, text: telegramMsg }),
      }).catch((err) => req.log.warn({ err }, "Telegram order notification failed"));
    }

    // ── Order confirmation email (only if email provided) ─────────────────
    if (customerEmail) {
      sendOrderConfirmationEmail(customerEmail, order!.customerName, {
        productName: firstProductName,
        address: displayAddress,
        timestamp: orderTimestamp,
      }).catch((err) => req.log.warn({ err }, "Order confirmation email failed"));
    }

    // ── SMS confirmation to customer ──────────────────────────────────────
    try {
      const confirmMsg = `🛒 SAFQUN: Hi ${order!.customerName}, your Order #${order!.id} has been received! Total: BDT ${total.toLocaleString()}. We'll confirm soon. Thank you!`;
      await sendSMS(order!.customerPhone, confirmMsg);
    } catch (smsErr) {
      req.log.warn({ smsErr }, "Order confirmation SMS failed (non-fatal)");
    }

    res.status(201).json(mapOrder(order!));
  } catch (err) {
    req.log.error({ err }, "Create order error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Get order error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const { status } = req.body as { status: string };
    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }

    const [order] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const smsFn = STATUS_SMS[status];
    if (smsFn && order.customerPhone) {
      try {
        const message = smsFn(order.customerName, order.id, Number(order.total));
        const { sent } = await sendSMS(order.customerPhone, message);
        req.log.info({ orderId: id, status, phone: order.customerPhone, sent }, "Order status SMS");
      } catch (smsErr) {
        req.log.warn({ smsErr }, "Order status SMS failed (non-fatal)");
      }
    }

    // ── Send email notification on status change if customer email is stored ─
    if (order.customerEmail) {
      const STATUS_EMAIL: Record<string, string> = {
        confirmed: "✅ Your Order is Confirmed!",
        processing: "📦 Your Order is Being Processed",
        shipped: "🚚 Your Order Has Been Shipped!",
        delivered: "🎉 Your Order Has Been Delivered!",
        cancelled: "❌ Your Order Has Been Cancelled",
      };
      const subject = STATUS_EMAIL[status];
      if (subject) {
        const orderTimestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
        const firstItem = (order.items as Array<{ productName: string }>)[0];
        sendOrderConfirmationEmail(order.customerEmail, order.customerName, {
          productName: firstItem?.productName ?? "your order",
          address: order.customerAddress ?? undefined,
          timestamp: orderTimestamp,
        }).catch((err) => req.log.warn({ err }, "Order status email failed (non-fatal)"));
      }
    }

    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Update order error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
