const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createReview,
  getSellerReviews,
} = require("../controllers/reviewController");

const router = express.Router();

router.post("/", protect, createReview);

router.get("/:id", getSellerReviews);

module.exports = router;