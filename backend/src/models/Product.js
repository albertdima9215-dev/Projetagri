const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // =========================
    // INFORMATIONS DU PRODUIT
    // =========================

    nom: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    categorie: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // VENTE
    // =========================

    // Comment le produit est vendu
    typeVente: {
      type: String,
      enum: ["poids", "unite", "lot"],
      default: "poids",
    },

    // Exemples :
    // 1kg, 5kg, 50kg, 1tonne
    // pièce, sac, caisse...
    // lot
    unite: {
      type: String,
      default: "1kg",
      trim: true,
    },

    // Prix correspondant à UNE unité de vente
    //
    // Exemple :
    // 15 000 FCFA / 50 kg
    // 5 000 FCFA / pièce
    // 10 000 FCFA / lot
    prix: {
      type: Number,
      required: true,
      min: 0,
    },

    // Utilisé principalement pour les lots.
    //
    // Exemple :
    // lot de 20 kg
    // quantiteParLot = 20
    //
    // Pour une vente au poids ou à l'unité :
    // null
    quantiteParLot: {
      type: Number,
      default: null,
      min: 1,
    },

    // Nombre d'unités de vente disponibles
    //
    // Exemple :
    // 20 sacs de 50 kg
    // quantite = 20
    //
    // ou :
    // 50 poulets
    // quantite = 50
    quantite: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================
    // LOCALISATION
    // =========================

    localisation: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // IMAGES
    // =========================

    image: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    // =========================
    // VENDEUR
    // =========================

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