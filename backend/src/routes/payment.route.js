import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createPaymentIntent,
  handleWebhook,
  createQrisPayment,
  handleMidtransNotification,
  checkPaymentStatus,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-intent", protectRoute, createPaymentIntent);

// No auth needed - Stripe validates via signature
router.post("/webhook", handleWebhook);

router.post("/create-qris", protectRoute, createQrisPayment);

// No auth needed - dipanggil langsung oleh server Midtrans
router.post("/midtrans-notification", handleMidtransNotification);

router.get("/status/:orderId", protectRoute, checkPaymentStatus);

export default router;
