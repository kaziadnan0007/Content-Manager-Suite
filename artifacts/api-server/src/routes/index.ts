import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import importProductsRouter from "./import-products";
import ordersRouter from "./orders";
import settingsRouter from "./settings";
import uploadsRouter from "./uploads";
import dashboardRouter from "./dashboard";
import otpRouter from "./otp";
import notificationsRouter from "./notifications";
import customersRouter from "./customers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(importProductsRouter);
router.use(ordersRouter);
router.use(settingsRouter);
router.use(uploadsRouter);
router.use(dashboardRouter);
router.use(otpRouter);
router.use(notificationsRouter);
router.use(customersRouter);

export default router;
