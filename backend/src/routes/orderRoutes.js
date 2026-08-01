const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  downloadInvoice,
  getSellerStats,
} = require("../controllers/orderController");

const router = express.Router();

// Créer une commande
router.post("/", protect, createOrder);

// Mes commandes (acheteur)
router.get("/my-orders", protect, getMyOrders);

// Commandes reçues (vendeur)
router.get("/seller-orders", protect, getSellerOrders);

//Télécharger un fichier pdf
router.get("/:id/invoice", protect, downloadInvoice);

//Statistique vendeur
router.get("/seller-stats", protect, getSellerStats);

// Modifier le statut
router.put("/:id", protect, updateOrderStatus);

module.exports = router;