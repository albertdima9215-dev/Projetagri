const express = require("express");
const protect = require("../middleware/authMiddleware");
const PushSubscription = require("../models/PushSubscription");

const router = express.Router();

router.post("/subscribe", protect, async (req, res) => {
  try {
    await PushSubscription.findOneAndUpdate(
      { utilisateur: req.user.id },
      { subscription: req.body },
      { upsert: true }
    );

    res.status(201).json({
      message: "Abonnement enregistré",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;