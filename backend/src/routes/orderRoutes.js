const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  downloadInvoice,
  getSellerStats,
  getSellerPayments,
  getMyPayments,
  cancelOrderByBuyer,
  archiveOrder,
  getArchivedOrders,
  getSellerArchivedOrders,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);
router.get("/seller-orders", protect, getSellerOrders);

router.get("/archives", protect, getArchivedOrders);
router.get("/seller-archives", protect, getSellerArchivedOrders);

router.get("/seller-stats", protect, getSellerStats);

router.get("/seller-payments", protect, getSellerPayments);
router.get("/my-payments", protect, getMyPayments);

router.put("/:id/archive", protect, archiveOrder);
router.put("/:id/cancel", protect, cancelOrderByBuyer);
router.put("/:id", protect, updateOrderStatus);

router.get("/:id/invoice", protect, downloadInvoice);

module.exports = router;