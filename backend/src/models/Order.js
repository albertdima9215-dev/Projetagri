const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // =========================
    // PRODUIT
    // =========================

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

    // =========================
    // INFORMATIONS DE VENTE
    // =========================

    // Nombre d'unités de vente commandées
    //
    // Exemple :
    // 3 sacs
    // 5 caisses
    // 2 lots
    quantite: {
      type: Number,
      required: true,
      min: 0,
    },

    // Type de vente au moment de la commande
    typeVente: {
      type: String,
      enum: ["poids", "unite", "lot"],
      default: "poids",
    },

    // Unité au moment de la commande
    //
    // Exemples :
    // 1kg
    // 50kg
    // pièce
    // caisse
    unite: {
      type: String,
      default: "1kg",
      trim: true,
    },

    // Pour les lots
    //
    // Exemple :
    // 1 lot = 10 pièces
    quantiteParLot: {
      type: Number,
      default: null,
      min: 1,
    },

    // Prix d'une unité de vente au moment
    // où la commande est passée.
    //
    // Exemple :
    // 5 000 FCFA / lot
    prixUnitaire: {
      type: Number,
      required: true,
      min: 0,
    },

    // Montant total de la commande
    montant: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================
    // STATUT COMMANDE
    // =========================

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

    // =========================
    // PAIEMENT
    // =========================

    methodePaiement: {
      type: String,
      enum: [
        "PayDunya",
        "À la livraison",
      ],
      default: "PayDunya",
    },

    statutPaiement: {
      type: String,
      enum: [
        "En attente",
        "Payé",
        "Échoué",
      ],
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

    // =========================
    // AVIS
    // =========================

    avisLaisse: {
      type: Boolean,
      default: false,
    },

    // =========================
    // LIVRAISON
    // =========================

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

    // =========================
    // ARCHIVAGE
    // =========================

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