import dotenv from "dotenv";
dotenv.config();
import "dotenv/config";
import express from "express";
console.log(
  "STRIPE_SECRET_KEY:",
  process.env.STRIPE_SECRET_KEY ? "ADA" : "TIDAK ADA",
);
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import cors from "cors";

import { functions, inngest } from "./config/inngest.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import notificationRoutes from "./routes/notification.route.js";

const app = express();

// special handling: Stripe webhook needs raw body BEFORE any body parsing middleware
app.use(
  "/api/payment",
  (req, res, next) => {
    if (req.originalUrl === "/api/payment/webhook") {
      express.raw({ type: "application/json" })(req, res, next);
    } else {
      express.json()(req, res, next);
    }
  },
  paymentRoutes,
);

app.use(express.json());
app.use(clerkMiddleware());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// --- Koneksi database ---
// Di serverless (Vercel), koneksi dibuat sekali dan dipakai ulang antar request
let dbConnected = false;

const initDB = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
};

await initDB();

// Hanya jalankan app.listen() kalau BUKAN di lingkungan Vercel (misal dev lokal)
if (!process.env.VERCEL) {
  app.listen(ENV.PORT, () => {
    console.log("Server is up and running");
  });
}

export default app;
