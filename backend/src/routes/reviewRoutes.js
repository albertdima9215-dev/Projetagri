const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createReview,
  getSellerReviews,
  getProductReviews,
  getLatestReviews,
} = require("../controllers/reviewController");

const router = express.Router();

router.post("/", protect, createReview);

router.get("/latest", getLatestReviews);

router.get("/:id", getSellerReviews);

router.get("/product/:id", getProductReviews);

module.exports = router;