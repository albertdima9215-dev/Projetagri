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
} = require("../controllers/orderController");

const router = express.Router();

// Créer une commande
router.post("/", protect, createOrder);

// Mes commandes (acheteur)
router.get("/my-orders", protect, getMyOrders);

// Commandes reçues (vendeur)
router.get("/seller-orders", protect, getSellerOrders);

router.get("/seller-payments",protect,
  getSellerPayments
);

router.get("/my-payments",protect,
  getMyPayments
);

//Télécharger un fichier pdf
router.get("/:id/invoice", protect, downloadInvoice);

//Statistique vendeur
router.get("/seller-stats", protect, getSellerStats);

// Modifier le statut
router.put("/:id", protect, updateOrderStatus);

module.exports = router;