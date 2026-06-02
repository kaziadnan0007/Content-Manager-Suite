import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";
import settingsRouter from "./settings";
import uploadsRouter from "./uploads";
import dashboardRouter from "./dashboard";
import otpRouter from "./otp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(settingsRouter);
router.use(uploadsRouter);
router.use(dashboardRouter);
router.use(otpRouter);

export default router;
