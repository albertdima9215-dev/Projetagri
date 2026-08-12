const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  subscription: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model(
  "PushSubscription",
  pushSubscriptionSchema
);