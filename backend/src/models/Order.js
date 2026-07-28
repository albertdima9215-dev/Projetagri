const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    acheteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quantite: {
      type: Number,
      required: true,
    },

    montant: {
      type: Number,
      required: true,
    },

    statut: {
      type: String,
      enum: [
        "En attente",
        "Confirmée",
        "Expédiée",
        "Livrée",
        "Annulée",
      ],
      default: "En attente",
    },

    paiement: {
      type: String,
      enum: ["En attente", "Payé"],
      default: "En attente",
    },

    methodePaiement: {
      type: String,
      enum: ["Orange Money", "Wave", "Moov Money", "À la livraison"],
      default: "Orange Money",
    },

    statutPaiement: {
      type: String,
      enum: ["En attente", "Payé", "Échoué"],
      default: "En attente",
    },

    referencePaiement: {
      type: String,
      default: "",
    },

    avisLaisse: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);