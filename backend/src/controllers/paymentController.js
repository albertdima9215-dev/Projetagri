const { paydunya, setup, store } = require("../config/paydunya");
const Order = require("../models/Order");
const crypto = require("crypto");

// ======================================================
// CRÉER UN PAIEMENT
// ======================================================

const createPayment = async (req, res) => {
  try {
    const {commandeId} = req.body;

    if (!commandeId) {
      return res.status(400).json({
        message: "L'identifiant de la commande est obligatoire.",
      });
    }

    // Récupérer la commande
    const commande = await Order.findById(commandeId)
      .populate("produit")
      .populate("acheteur", "nom email telephone");

    if (!commande) {
      return res.status(404).json({
        message: "Commande introuvable.",
      });
    }

    // Vérifier que l'utilisateur est bien l'acheteur
    if (
      commande.acheteur._id.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à payer cette commande.",
      });
    }

    // Vérifier que la commande n'est pas déjà payée
    if (commande.statutPaiement === "Payé") {
      return res.status(400).json({
        message: "Cette commande est déjà payée.",
      });
    }

    // Minimum PayDunya
    if (commande.montant < 200) {
      return res.status(400).json({
        message:
          "Le montant minimum du paiement est de 200 FCFA.",
      });
    }

    // Référence unique
    const reference =
      `AGRI-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

    console.log("Référence paiement :", reference);

    // Création de la facture PayDunya
    const invoice = new paydunya.CheckoutInvoice(
      setup,
      store
    );

    invoice.totalAmount = commande.montant;

    invoice.description =
      `Commande AgriConnect - ${commande.produit.nom}`;

    invoice.addItem(
      commande.produit.nom,
      commande.quantite,
      commande.produit.prix,
      commande.montant,
      `Commande ${commande._id}`
    );

    // Données personnalisées
    invoice.addCustomData(
      "reference",
      reference
    );

    invoice.addCustomData(
      "produit",
      commande.produit.nom
    );

    invoice.addCustomData(
      "commandeId",
      commande._id.toString()
    );

    invoice.addCustomData(
      "acheteurId",
      commande.acheteur._id.toString()
    );

    await invoice.create();

    console.log("PayDunya token :", invoice.token);
    console.log("PayDunya URL :", invoice.url);
    console.log("PayDunya status :", invoice.status);

    // Enregistrer les informations du paiement
    commande.referencePaiement = reference;
    commande.tokenPaiement = invoice.token;
    commande.statutPaiement = "En attente";
    commande.methodePaiement = "PayDunya";

    await commande.save();

    return res.status(200).json({
      message: "Facture PayDunya créée avec succès.",
      commandeId: commande._id,
      reference,
      token: invoice.token,
      url: invoice.url,
      status: invoice.status,
    });

  } catch (error) {
    console.error(
      "Erreur création paiement PayDunya :",
      error
    );

    console.error(
      "Réponse PayDunya :",
      error.data
    );

    return res.status(500).json({
      message:
        "Erreur lors de la création du paiement.",
      error: error.message,
      paydunya: error.data || null,
    });
  }
};


// ======================================================
// RETOUR APRÈS PAIEMENT
// ======================================================

const paymentSuccess = async (req, res) => {
  try {
    const token = req.query.token;

    console.log(
      "Retour PayDunya - token :",
      token
    );

    if (!token) {
      return res.status(400).json({
        message: "Token PayDunya manquant.",
      });
    }

    // Redirection vers le frontend
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?token=${encodeURIComponent(
        token
      )}`
    );

  } catch (error) {
    console.error(
      "Erreur retour paiement :",
      error
    );

    return res.status(500).json({
      message: "Erreur lors du retour de paiement.",
    });
  }
};


// ======================================================
// ANNULATION
// ======================================================

const paymentCancel = async (req, res) => {
  try {
    const token = req.query.token;

    console.log(
      "Paiement annulé - token :",
      token
    );

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-cancel`
    );

  } catch (error) {
    console.error(
      "Erreur annulation paiement :",
      error
    );

    return res.status(500).json({
      message: "Paiement annulé.",
    });
  }
};


// ======================================================
// CALLBACK PAYDUNYA
// ======================================================

const paymentCallback = async (req, res) => {
  try {
    console.log("========== CALLBACK PAYDUNYA ==========");

    const token =
      req.body?.token ||
      req.body?.invoice?.token ||
      req.body?.data?.token;

    console.log("Token reçu :", token);

    if (!token) {
      return res.status(400).json({
        message: "Token PayDunya absent.",
      });
    }

    const invoice = new paydunya.CheckoutInvoice(
      setup,
      store
    );

    await invoice.confirm(token);

    console.log("========== RÉSULTAT CONFIRM ==========");
    console.log("Token :", invoice.token);
    console.log("Status :", invoice.status);
    console.log("Response :", invoice.responseText);
    console.log("CustomData :", invoice.customData);
    console.log("Customer :", invoice.customer);
    console.log("Provider reference :", invoice.provider_reference);
    console.log("Receipt :", invoice.receiptURL);

    return res.status(200).json({
      message: "Diagnostic PayDunya",
      token: invoice.token,
      status: invoice.status,
      responseText: invoice.responseText,
      customData: invoice.customData || null,
      customer: invoice.customer || null,
      providerReference: invoice.provider_reference || null,
    });

  } catch (error) {
    console.error("Erreur callback :", error);
    console.error("PayDunya data :", error.data);

    return res.status(500).json({
      message: "Erreur callback PayDunya.",
      error: error.message,
      paydunya: error.data || null,
    });
  }
};


module.exports = {
  createPayment,
  paymentSuccess,
  paymentCancel,
  paymentCallback,
};