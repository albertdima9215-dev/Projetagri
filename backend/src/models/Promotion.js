const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    prixAvant: {
      type: Number,
      default: null,
    },

    prixPromotion: {
      type: Number,
      default: null,
    },

    reduction: {
      type: Number,
      default: 0,
    },

    dateDebut: {
      type: Date,
      required: true,
    },

    dateFin: {
      type: Date,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Promotion", promotionSchema);