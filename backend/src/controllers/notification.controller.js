import { Notification } from "../models/notification.model.js";

// Ambil semua notifikasi user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tandai satu notifikasi sudah dibaca
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json({ notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tandai semua notifikasi user sudah dibaca
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true },
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// (Opsional) Buat notifikasi baru (bisa dipanggil dari event lain)
export const createNotification = async (
  userId,
  title,
  message,
  type = "general",
) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
};

// ✨ Tambahan: Buat notifikasi dari frontend (manual)
export const createNotificationFromFrontend = async (req, res) => {
  try {
    const { title, message, type = "general" } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const notification = new Notification({
      userId: req.user._id,
      title,
      message,
      type,
    });
    await notification.save();

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
