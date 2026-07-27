const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");

const router = express.Router();

router.post("/:productId", protect, addFavorite);

router.delete("/:productId", protect, removeFavorite);

router.get("/", protect, getFavorites);

module.exports = router;