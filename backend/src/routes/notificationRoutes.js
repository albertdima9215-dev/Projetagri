const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead, markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getNotifications);

router.delete("/clear/all", protect, clearAllNotifications);

router.delete("/:id", protect, deleteNotification);

router.put("/read-all",protect,markAllAsRead
);
router.put("/:id", protect, markAsRead);

module.exports = router;