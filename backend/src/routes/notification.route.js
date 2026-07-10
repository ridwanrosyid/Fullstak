import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotificationFromFrontend, // ✅ TAMBAHKAN
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Gunakan protectRoute (yang sudah include requireAuth + ambil user dari database)
router.use(protectRoute);

router.get("/", getNotifications);
router.post("/", createNotificationFromFrontend); // ✅ TAMBAHKAN
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);

export default router;
