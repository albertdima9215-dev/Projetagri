const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

// Créer une commande
const createOrder = async (req, res) => {
  try {
    const { produitId, quantite } = req.body;

    const produit = await Product.findById(produitId);

    if (!produit) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    if (quantite <= 0) {
      return res.status(400).json({
        message: "Quantité invalide",
      });
    }

    if (quantite > produit.quantite) {
      return res.status(400).json({
        message: "Stock insuffisant",
      });
    }

    if (produit.vendeur.toString() === req.user.id) {
      return res.status(400).json({
        message: "Vous ne pouvez pas commander votre propre produit.",
      });
    }

    const montant = produit.prix * quantite;

    produit.quantite -= quantite;
    await produit.save();

    const commande = await Order.create({
      produit: produit._id,
      acheteur: req.user.id,
      vendeur: produit.vendeur,
      quantite,
      montant,
    });

    await Notification.create({
      utilisateur: produit.vendeur,
      titre: "Nouvelle commande",
      message: `Vous avez reçu une commande pour ${produit.nom}.`,
      lien: "/seller-orders",
    });

    res.status(201).json({
      message: "Commande créée avec succès",
      commande,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {

    const commandes = await Order.find({
      acheteur: req.user._id,
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

    const commande = await Order.findById(req.params.id);

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

    commande.statut = req.body.statut;

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

    res.status(200).json({
      message: "Statut mis à jour",
      commande,
    });

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
    doc.text(`Quantité : ${order.quantite}`);
    doc.text(`Prix unitaire : ${order.produit.prix} FCFA`);
    doc.text(`Méthode de paiement : ${order.methodePaiement}`);
    doc.text(`Statut du paiement : ${order.statutPaiement}`);
    doc.moveDown(2);

    // Total
    doc.fontSize(16).text(`TOTAL : ${order.montant} FCFA`, { align: "right" });
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

    res.status(200).json({
      totalRevenue,
      totalOrders,
      deliveredOrders,
      chartData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  downloadInvoice,
  getSellerStats,
};