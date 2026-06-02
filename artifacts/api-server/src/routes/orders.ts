import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";

const router = Router();

function mapOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    items: (o.items as Array<{
      productId: number;
      productName: string;
      productImage: string | null;
      quantity: number;
      price: number;
    }>).map((item) => ({
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

    const productIds = body.items.map((i) => i.productId);
    const products = await db.select().from(productsTable).where(
      productIds.length === 1
        ? eq(productsTable.id, productIds[0]!)
        : eq(productsTable.id, productIds[0]!)
    );

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

    const [order] = await db.insert(ordersTable).values({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress ?? null,
      items: orderItems,
      total: String(total),
      status: "pending",
      paymentMethod: body.paymentMethod,
      paymentNumber: body.paymentNumber ?? null,
      transactionId: body.transactionId ?? null,
      note: body.note ?? null,
    }).returning();

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
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Update order error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
