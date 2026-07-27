const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    titre: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    lu: {
      type: Boolean,
      default: false,
    },

    lien: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "commande",
        "message",
        "favori",
        "avis",
        "livraison",
      ],
      default: "commande",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);