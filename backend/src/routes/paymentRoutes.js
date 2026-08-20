const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createPayment,
  paymentSuccess,
  paymentCancel,
  paymentCallback,
} = require("../controllers/paymentController");

const router = express.Router();

// Créer une facture PayDunya
router.post("/create", protect, createPayment);

// Retour après paiement
router.get("/success", paymentSuccess);

// Annulation du paiement
router.get("/cancel", paymentCancel);

// Notification PayDunya
router.post("/callback", paymentCallback);

module.exports = router;