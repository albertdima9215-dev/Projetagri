const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");


const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const deliveredOrders = await Order.countDocuments({
      statut: "Livrée",
    });

    const pendingOrders = await Order.countDocuments({
      statut: "En attente",
    });

    const cancelledOrders = await Order.countDocuments({
      statut: "Annulée",
    });

    const totalRevenue = await Order.aggregate([
      {
        $match: {
          statut: "Livrée",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$montant",
          },
        },
      },
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue:
        totalRevenue.length > 0
          ? totalRevenue[0].total
          : 0,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Tous les utilisateurs
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-motDePasse");

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Modifier le rôle
const updateUserRole = async (req, res) => {
  try {

    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    // Empêcher un admin de modifier son propre rôle
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Vous ne pouvez pas modifier votre propre rôle.",
      });
    }

    // Empêcher de retirer le rôle du dernier administrateur
    if (user.role === "admin" && role !== "admin") {

      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Il doit toujours rester au moins un administrateur.",
        });
      }
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      message: "Rôle mis à jour avec succès.",
      user,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    // Empêcher un admin de supprimer son propre compte
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Vous ne pouvez pas supprimer votre propre compte.",
      });
    }

    // Empêcher la suppression du dernier administrateur
    if (user.role === "admin") {

      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Impossible de supprimer le dernier administrateur.",
        });
      }
    }

    await user.deleteOne();

    res.status(200).json({
      message: "Utilisateur supprimé avec succès.",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Tous les produits
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendeur", "nom email");

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Supprimer un produit
const deleteProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Produit supprimé avec succès.",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// voir toutes les commandes
const getOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("acheteur", "nom email")
      .populate("vendeur", "nom email")
      .populate("produit", "nom image");

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { statut } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Commande introuvable",
      });
    }

    order.statut = statut;

    await order.save();

    res.status(200).json({
      message: "Statut mis à jour avec succès.",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Tous les paiements
const getPayments = async (req, res) => {
  try {
    const payments = await Order.find()
      .populate("produit", "nom image")
      .populate("acheteur", "nom email")
      .populate("vendeur", "nom email")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Modifier le statut du paiement
const updatePaymentStatus = async (req, res) => {
  try {
    const { statutPaiement } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Paiement introuvable",
      });
    }

    order.statutPaiement = statutPaiement;

    await order.save();

    res.status(200).json({
      message: "Statut du paiement mis à jour",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  updateUserRole,
  deleteUser,
  getProducts,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getPayments,
  updatePaymentStatus,
};