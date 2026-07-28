const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    acheteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    note: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    commentaire: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ produit: 1, acheteur: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);