const express = require("express");
const protect = require("../middleware/authMiddleware");
const { payOrder } = require("../controllers/paymentController");

const router = express.Router();

router.post("/pay", protect, payOrder);

module.exports = router;