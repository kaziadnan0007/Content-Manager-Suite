import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, categoriesTable } from "@workspace/db";
import { count, sum, eq, gte, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrdersResult,
      pendingOrdersResult,
      totalRevenueResult,
      totalProductsResult,
      totalCategoriesResult,
      todayOrdersResult,
      todayRevenueResult,
      bkashRevResult,
      rocketRevResult,
      codRevResult,
    ] = await Promise.all([
      db.select({ total: count() }).from(ordersTable),
      db.select({ total: count() }).from(ordersTable).where(eq(ordersTable.status, "pending")),
      db.select({ total: sum(ordersTable.total) }).from(ordersTable),
      db.select({ total: count() }).from(productsTable),
      db.select({ total: count() }).from(categoriesTable),
      db.select({ total: count() }).from(ordersTable).where(gte(ordersTable.createdAt, todayStart)),
      db.select({ total: sum(ordersTable.total) }).from(ordersTable).where(gte(ordersTable.createdAt, todayStart)),
      db.select({ total: sum(ordersTable.total) }).from(ordersTable).where(eq(ordersTable.paymentMethod, "bkash")),
      db.select({ total: sum(ordersTable.total) }).from(ordersTable).where(eq(ordersTable.paymentMethod, "rocket")),
      db.select({ total: sum(ordersTable.total) }).from(ordersTable).where(eq(ordersTable.paymentMethod, "cod")),
    ]);

    res.json({
      totalOrders: Number(totalOrdersResult[0]?.total ?? 0),
      pendingOrders: Number(pendingOrdersResult[0]?.total ?? 0),
      totalRevenue: Number(totalRevenueResult[0]?.total ?? 0),
      totalProducts: Number(totalProductsResult[0]?.total ?? 0),
      totalCategories: Number(totalCategoriesResult[0]?.total ?? 0),
      todayOrders: Number(todayOrdersResult[0]?.total ?? 0),
      todayRevenue: Number(todayRevenueResult[0]?.total ?? 0),
      revenueByPayment: {
        bkash: Number(bkashRevResult[0]?.total ?? 0),
        rocket: Number(rocketRevResult[0]?.total ?? 0),
        cod: Number(codRevResult[0]?.total ?? 0),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-orders", async (req, res) => {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(10);

    res.json(
      orders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerAddress: o.customerAddress,
        items: o.items,
        total: Number(o.total),
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentNumber: o.paymentNumber,
        transactionId: o.transactionId,
        note: o.note,
        createdAt: o.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Recent orders error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
