const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const Review = require("../models/Review");
const PushSubscription = require("../models/PushSubscription");
const webpush = require("../config/webpush");

// Créer une commande
const createOrder = async (req, res) => {
  try {
    const { produitId, quantite } = req.body;

    const quantiteCommande = Number(quantite);

    // =========================
    // VALIDATION QUANTITÉ
    // =========================

    if (
      !Number.isInteger(quantiteCommande) ||
      quantiteCommande <= 0
    ) {
      return res.status(400).json({
        message: "Quantité invalide.",
      });
    }

    // =========================
    // RECHERCHE PRODUIT
    // =========================

    const produit = await Product.findById(produitId);

    if (!produit) {
      return res.status(404).json({
        message: "Produit introuvable.",
      });
    }

    // =========================
    // EMPÊCHER L'ACHAT DE SON PROPRE PRODUIT
    // =========================

    if (
      produit.vendeur.toString() === req.user.id
    ) {
      return res.status(400).json({
        message:
          "Vous ne pouvez pas commander votre propre produit.",
      });
    }

    // =========================
    // STOCK
    // =========================

    if (produit.quantite <= 0) {
      return res.status(400).json({
        message: "Produit en rupture de stock.",
      });
    }

    if (quantiteCommande > produit.quantite) {
      return res.status(400).json({
        message: "Stock insuffisant.",
      });
    }

    // =========================
    // INFORMATIONS COMMERCIALES
    // =========================

    const prixUnitaire = Number(produit.prix);

    const typeVente = produit.typeVente || "poids";

    const unite = produit.unite || "1kg";

    const quantiteParLot =
      typeVente === "lot"
        ? produit.quantiteParLot
        : null;

    // =========================
    // CALCUL
    // =========================

    const montant =
      prixUnitaire * quantiteCommande;

    // =========================
    // DÉDUCTION DU STOCK
    // =========================

    produit.quantite -= quantiteCommande;

    await produit.save();

    // =========================
    // CRÉATION COMMANDE
    // =========================

    let commande = await Order.create({
      produit: produit._id,
      acheteur: req.user.id,
      vendeur: produit.vendeur,

      quantite: quantiteCommande,

      typeVente,
      unite,
      quantiteParLot,

      prixUnitaire,
      montant,
    });

    // =========================
    // POPULATE
    // =========================

    commande = await commande.populate("produit");

    // =========================
    // NOTIFICATION BASE DE DONNÉES
    // =========================

    await Notification.create({
      utilisateur: produit.vendeur,
      titre: "Nouvelle commande",
      message: `Vous avez reçu une commande pour ${produit.nom}.`,
      lien: "/seller-orders",
    });

    // =========================
    // NOTIFICATION TEMPS RÉEL
    // =========================

    const io = req.app.get("io");
    const users = req.app.get("users");

    if (io && users) {
      const vendeurSocket =
        users[produit.vendeur.toString()];

      if (vendeurSocket) {
        io.to(vendeurSocket).emit(
          "newNotification",
          {
            titre: "Nouvelle commande",
            message: `Commande reçue pour ${produit.nom}`,
          }
        );
      }
    }

    // =========================
    // RÉPONSE
    // =========================

    res.status(201).json({
      message: "Commande créée avec succès.",
      commande,
    });

  } catch (error) {
    console.error(
      "Erreur création commande :",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const commandes = await Order.find({
      acheteur: req.user._id,
      $or: [
        { archivee: false },
        { archivee: { $exists: false } },
      ],
    })
      .populate("produit")
      .populate("vendeur", "nom telephone")
      .sort({ createdAt: -1 });

    res.status(200).json(commandes);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const commandes = await Order.find({
      vendeur: req.user._id,
      $or: [
        { archivee: false },
        { archivee: { $exists: false } },
      ],
    })
      .populate("produit")
      .populate("acheteur", "nom telephone")
      .sort({ createdAt: -1 });

    res.status(200).json(commandes);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {

    const commande = await                        Order.findById(req.params.id);
    const ancienStatut = commande.statut;
    const nouveauStatut = req.body.statut;

    if (!commande) {
      return res.status(404).json({
        message: "Commande introuvable",
      });
    }

    if (commande.vendeur.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Action non autorisée",
      });
    }

    if (commande.statut === "Livrée" && req.body.statut === "Annulée") {
  return res.status(400).json({
    message: "Une commande déjà livrée ne peut plus être annulée.",
  });
}

if (commande.statut === "Livrée" && req.body.statut !== "Livrée") {
  return res.status(400).json({
    message: "Une commande livrée ne peut plus être modifiée.",
  });
}

    if (commande.statut === "Annulée") {
  return res.status(400).json({
    message: "Une commande annulée ne peut plus être modifiée.",
  });
}

    // Remettre le stock si la commande est annulée
    if (
  nouveauStatut === "Annulée" &&
  ancienStatut !== "Annulée" &&
  ancienStatut !== "Livrée"
) {
  const produit = await Product.findById(commande.produit);

  if (produit) {
    produit.quantite += commande.quantite;
    await produit.save();
  }
}

commande.statut = nouveauStatut;

    if (req.body.numeroSuivi) {
      commande.numeroSuivi = req.body.numeroSuivi;
    }

    if (req.body.statut === "Expédiée") {
      commande.dateExpedition = new Date();
    }

    if (req.body.statut === "Livrée") {
      commande.dateLivraison = new Date();
    }

    await commande.save();

    await Notification.create({
      utilisateur: commande.acheteur,
      titre: "Commande mise à jour",
      message: `Votre commande est maintenant : ${commande.statut}.`,
      lien: "/my-orders",
    });

    const io = req.app.get("io");
    const users = req.app.get("users");

    const acheteurSocket = users[commande.acheteur.toString()];

    if (acheteurSocket) {                   io.to(acheteurSocket).emit("newNotification",     {
        titre: "Commande mise à jour",
        message: `Votre commande est maintenant : ${commande.statut}`,
      });
    }
    res.status(200).json({
      message: "Statut mis à jour",
      commande,
    });

    const pushSub = await                         PushSubscription.findOne({
  utilisateur: commande.acheteur,
    });

    if (pushSub) {
      await webpush.sendNotification(
      pushSub.subscription,
        JSON.stringify({
          title: "Commande mise à jour",
          body: `Votre commande est maintenant : ${commande.statut}`,
        })
      );
    }

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const PDFDocument = require("pdfkit");

const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("produit")
      .populate("acheteur", "nom email telephone")
      .populate("vendeur", "nom email telephone");

    if (!order) {
      return res.status(404).json({
        message: "Commande introuvable",
      });
    }

    // Sécurité : seul l'acheteur ou l'admin peut télécharger
    if (
      order.acheteur._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Accès refusé",
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=facture-${order._id}.pdf`
    );

    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Titre
    doc.fontSize(22).text("AgriConnect Faso", { align: "center" });
    doc.moveDown();

    doc.fontSize(18).text("FACTURE", { align: "center" });
    doc.moveDown(2);

    // Infos facture
    doc.fontSize(12);
    doc.text(`Facture N° : ACF-${order._id.toString().slice(-6)}`);
    doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString("fr-FR")}`);
    doc.moveDown();

    // Acheteur
    doc.fontSize(14).text("Acheteur", { underline: true });
    doc.fontSize(12);
    doc.text(`Nom : ${order.acheteur.nom}`);
    doc.text(`Email : ${order.acheteur.email || "-"}`);
    doc.text(`Téléphone : ${order.acheteur.telephone || "-"}`);
    doc.moveDown();

    // Vendeur
    doc.fontSize(14).text("Vendeur", { underline: true });
    doc.fontSize(12);
    doc.text(`Nom : ${order.vendeur.nom}`);
    doc.text(`Email : ${order.vendeur.email || "-"}`);
    doc.text(`Téléphone : ${order.vendeur.telephone || "-"}`);
    doc.moveDown(2);

    // Produit
    doc.fontSize(14).text("Détails de la commande", { underline: true });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Produit : ${order.produit.nom}`);
    doc.text(`Type de vente : ${order.typeVente || "-"}`);
doc.text(`Unité : ${order.unite || "-"}`);

if (order.typeVente === "lot") {
  doc.text(
    `Quantité par lot : ${order.quantiteParLot || "-"}`
  );
}

doc.text(`Quantité commandée : ${order.quantite}`);
doc.text(
  `Prix unitaire : ${order.prixUnitaire.toLocaleString("fr-FR")} FCFA`
);
    doc.text(`Méthode de paiement : ${order.methodePaiement}`);
    doc.text(`Statut du paiement : ${order.statutPaiement}`);
    doc.moveDown(2);

    // Total
    doc.fontSize(16).text(
  `TOTAL : ${order.montant.toLocaleString("fr-FR")} FCFA`,
  { align: "right" });
    doc.moveDown(3);

    // Footer
    doc.fontSize(10).text("Merci pour votre confiance envers AgriConnect Faso.", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Dashboard vendeur
const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({ vendeur: sellerId });

    const totalOrders = orders.length;

    const deliveredOrders = orders.filter(
      (o) => o.statut === "Livrée"
    ).length;

    const totalRevenue = orders
      .filter((o) => o.statutPaiement === "Payé")
      .reduce((sum, o) => sum + o.montant, 0);

    // Ventes par mois
    const salesByMonth = Array(12).fill(0);

    orders.forEach((order) => {
      if (order.statutPaiement === "Payé") {
        const month = new Date(order.createdAt).getMonth();
        salesByMonth[month] += order.montant;
      }
    });

    const monthNames = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];

    const chartData = monthNames.map((name, index) => ({
      mois: name,
      ventes: salesByMonth[index],
    }));

// Avis du vendeur
const reviews = await Review.find({ vendeur: sellerId })
  .populate("acheteur", "nom")
  .sort({ createdAt: -1 });

const totalReviews = reviews.length;

let averageRating = 0;

if (totalReviews > 0) {
  const totalNotes = reviews.reduce((sum, review) => {
    return sum + (review.note || 0);
  }, 0);

  averageRating = (totalNotes / totalReviews).toFixed(1);
}

const latestReviews = reviews.slice(0, 5);

    res.status(200).json({
      totalRevenue,
      totalOrders,
      deliveredOrders,
      chartData,
      averageRating,
      totalReviews,
      latestReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Paiements reçus par le vendeur
const getSellerPayments = async (req, res) => {
  try {
    const paiements = await Order.find({
      vendeur: req.user._id,
      statutPaiement: "Payé",
    })
      .populate("produit")
      .populate("acheteur", "nom telephone")
      .sort({ createdAt: -1 });

    res.status(200).json(paiements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Paiements de l'acheteur
const getMyPayments = async (req, res) => {
  try {
    const paiements = await Order.find({
      acheteur: req.user._id,
      statutPaiement: "Payé",
    })
      .populate("produit")
      .populate("vendeur", "nom telephone")
      .sort({ createdAt: -1 });

    res.status(200).json(paiements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Annulation par l'acheteur
const cancelOrderByBuyer = async (req, res) => {
  try {
    const commande = await Order.findById(req.params.id);

    if (!commande) {
      return res.status(404).json({
        message: "Commande introuvable",
      });
    }

    // Vérifier que c'est bien l'acheteur
    if (commande.acheteur.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Action non autorisée",
      });
    }

    // Seulement si en attente
    if (commande.statut !== "En attente") {
      return res.status(400).json({
        message: "Vous ne pouvez annuler qu'une commande en attente.",
      });
    }

    // Restaurer le stock
    const produit = await Product.findById(commande.produit);

    if (produit) {
      produit.quantite += commande.quantite;
      await produit.save();
    }

    commande.statut = "Annulée";
    await commande.save();

    // Notification vendeur
    await Notification.create({
      utilisateur: commande.vendeur,
      titre: "Commande annulée",
      message: "L'acheteur a annulé sa commande.",
      lien: "/seller-orders",
    });

    res.status(200).json({
      message: "Commande annulée avec succès",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const archiveOrder = async (req, res) => {
  try {
    const commande = await Order.findById(req.params.id);

    if (!commande) {
      return res.status(404).json({
        message: "Commande introuvable",
      });
    }

    // Acheteur ou vendeur autorisé
    const autorise =
      commande.acheteur.toString() === req.user.id ||
      commande.vendeur.toString() === req.user.id;

    if (!autorise) {
      return res.status(403).json({
        message: "Action non autorisée",
      });
    }

    // Seulement si terminée
    if (!["Livrée", "Annulée"].includes(commande.statut)) {
      return res.status(400).json({
        message: "Seules les commandes terminées peuvent être archivées.",
      });
    }

    commande.archivee = true;
    await commande.save();

    res.status(200).json({
      message: "Commande archivée",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getArchivedOrders = async (req, res) => {
  try {
    const commandes = await Order.find({
      acheteur: req.user._id,
      archivee: true,
    })
      .populate("produit")
      .populate("vendeur", "nom telephone")
      .sort({ createdAt: -1 });

    res.status(200).json(commandes);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Archives du vendeur
const getSellerArchivedOrders = async (req, res) => {
  try {
    const commandes = await Order.find({
      vendeur: req.user._id,
      archivee: true,
    })
      .populate("produit")
      .populate("acheteur", "nom telephone")
      .sort({ createdAt: -1 });

    res.status(200).json(commandes);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  downloadInvoice,
  getSellerStats,
  getSellerPayments,
  getMyPayments,
  cancelOrderByBuyer,
  archiveOrder,
  getArchivedOrders,
  getSellerArchivedOrders,
};