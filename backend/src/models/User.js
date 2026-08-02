const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    telephone: {
      type: String,
      required: true,
    },

    motDePasse: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user","vendeur", "acheteur" "admin"],
      default: "user",
    },
    
    telephone: {
      type: String,
      default: "",
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