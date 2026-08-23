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
    console.log(
      "Body reçu :",
      JSON.stringify(req.body, null, 2)
    );

    const data = req.body;

    // PayDunya envoie normalement les données
    // de la transaction dans la requête callback.
    const customData = data.custom_data || {};

    const commandeId = customData.commandeId;
    const reference = customData.reference;

    if (!commandeId) {
      console.error("commandeId absent du callback PayDunya");

      return res.status(400).json({
        message: "commandeId manquant.",
      });
    }

    // Rechercher la commande
    const commande = await Order.findById(commandeId);

    if (!commande) {
      console.error(
        "Commande introuvable :",
        commandeId
      );

      return res.status(404).json({
        message: "Commande introuvable.",
      });
    }

    // Éviter de traiter deux fois le même paiement
    if (commande.statutPaiement === "Payé") {
      console.log(
        "Commande déjà payée :",
        commande._id
      );

      return res.status(200).json({
        message: "Commande déjà payée.",
      });
    }

    /*
     * Pour le moment, on récupère le statut envoyé
     * par PayDunya.
     */
    const statut =
      data.status ||
      data.invoice?.status ||
      data.response_code;

    console.log("Statut PayDunya :", statut);

    // Paiement confirmé
    if (
      statut === "completed" ||
      statut === "00"
    ) {
      commande.statutPaiement = "Payé";
      commande.paiement = "Payé";

      if (reference) {
        commande.referencePaiement = reference;
      }

      await commande.save();

      console.log(
        "✅ Paiement confirmé pour la commande :",
        commande._id
      );

      // Notification du vendeur
      await Notification.create({
        utilisateur: commande.vendeur,
        titre: "Paiement reçu",
        message: `Le paiement de la commande ${commande._id} a été confirmé.`,
        lien: "/seller-orders",
      });

      // Notification temps réel
      const io = req.app.get("io");
      const users = req.app.get("users");

      if (io && users) {
        const vendeurSocket =
          users[commande.vendeur.toString()];

        if (vendeurSocket) {
          io.to(vendeurSocket).emit(
            "newNotification",
            {
              titre: "Paiement reçu",
              message:
                "Le paiement d'une commande vient d'être confirmé.",
            }
          );
        }
      }

      return res.status(200).json({
        message: "Paiement confirmé.",
        commandeId: commande._id,
        statutPaiement: commande.statutPaiement,
      });
    }

    // Paiement échoué
    if (
      statut === "failed" ||
      statut === "cancelled" ||
      statut === "canceled"
    ) {
      commande.statutPaiement = "Échoué";

      await commande.save();

      console.log(
        "❌ Paiement échoué :",
        commande._id
      );

      return res.status(200).json({
        message: "Paiement échoué.",
      });
    }

    // Statut inconnu ou encore en attente
    console.log(
      "Paiement encore en attente ou statut inconnu."
    );

    return res.status(200).json({
      message: "Callback reçu.",
      statut,
    });

  } catch (error) {
    console.error(
      "Erreur callback PayDunya :",
      error
    );

    return res.status(500).json({
      message: "Erreur callback PayDunya.",
      error: error.message,
    });
  }
};


module.exports = {
  createPayment,
  paymentSuccess,
  paymentCancel,
  paymentCallback,
};