const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
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

module.exports = mongoose.model("Review", reviewSchema);