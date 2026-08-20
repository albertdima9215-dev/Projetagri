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

    methodePaiement: {
      type: String,
      enum: [
        "PayDunya",
        "À la livraison"
      ],
      default: "PayDunya",
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

    tokenPaiement: {
      type: String,
      default: "",
    },

    avisLaisse: {
      type: Boolean,
      default: false,
    },

    numeroSuivi: {
      type: String,
      default: "",
    },

    dateExpedition: {
      type: Date,
    },

    dateLivraison: {
      type: Date,
    },

    archivee: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);