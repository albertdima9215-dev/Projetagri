const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    categorie: {
      type: String,
      required: true,
    },

    prix: {
      type: Number,
      required: true,
    },

    quantite: {
      type: Number,
      required: true,
    },

    localisation: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);