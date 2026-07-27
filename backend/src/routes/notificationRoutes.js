const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead, markAllAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getNotifications);

router.put("/:id", protect, markAsRead);
router.put(
  "/read-all",
  protect,
  markAllAsRead
);

module.exports = router;