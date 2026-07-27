const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Empêche un utilisateur d'ajouter deux fois le même produit
favoriteSchema.index(
  { utilisateur: 1, produit: 1 },
  { unique: true }
);

module.exports = mongoose.model("Favorite", favoriteSchema);