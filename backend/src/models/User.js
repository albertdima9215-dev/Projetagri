const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Numéro local saisi par l'utilisateur
    telephone: {
      type: String,
      required: true,
      trim: true,
    },

    // Pays de l'utilisateur
    pays: {
      type: String,
      required: true,
      trim: true,
    },

    // Exemple : +221, +226, +225...
    indicatif: {
      type: String,
      required: true,
      trim: true,
    },

    // Exemple : +221771234567
    telephoneComplet: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    motDePasse: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["vendeur", "acheteur", "admin"],
      default: "acheteur",
    },

    photo: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    localisation: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  latitude: 1,
  longitude: 1,
});

module.exports = mongoose.model("User", userSchema);