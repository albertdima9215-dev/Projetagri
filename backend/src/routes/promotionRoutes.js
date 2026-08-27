const express = require("express");

const router = express.Router();

const {
  getActivePromotions,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require("../controllers/promotionController");

const protect = require("../middleware/authMiddleware");

// Promotions visibles par les visiteurs
router.get("/active", getActivePromotions);

// Administration
router.get("/", protect, getAllPromotions);

router.post("/", protect, createPromotion);

router.put("/:id", protect, updatePromotion);

router.delete("/:id", protect, deletePromotion);

module.exports = router;