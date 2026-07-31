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

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
};