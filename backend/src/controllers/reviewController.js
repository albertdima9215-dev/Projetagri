const Review = require("../models/Review");
const User = require("../models/User");
const Order = require("../models/Order");

// Ajouter un avis

const createReview = async (req, res) => {
  try {

    const { vendeurId, note, commentaire, produit, commande } = req.body;

    if (note < 1 || note > 5) {
      return res.status(400).json({
        message: "La note doit être comprise entre 1 et 5.",
      });
    };

    if (vendeurId === req.user._id) {
      return res.status(400).json({
        message: "Vous ne pouvez pas noter votre propre profil.",
      });
    };

    const reviewExists = await Review.findOne({
    acheteur: req.user._id,
    produit,
    });

    if (reviewExists) {
      return res.status(400).json({
        message: "Vous avez déjà laissé un avis pour ce produit."
      });
    }

    const review = await Review.create({
      produit,
      vendeur: vendeurId,
      acheteur: req.user._id,
      note,
      commentaire,
    });

    /*const order = await Order.findOne({
      _id: commande,
      acheteur: req.user._id,
    });

    if (!order) {
  return res.status(404).json({
    message: "Commande introuvable.",
  });
}

    order.avisLaisse = true;
    await order.save();*/

    await Order.findByIdAndUpdate(
      commande,
      { avisLaisse: true }
    );

    res.status(201).json({
      message: "Avis ajouté avec succès",
      review,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Liste des avis d'un vendeur
const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      vendeur: req.params.id,
    })
      .populate("acheteur", "nom")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Avis d'un produit
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      produit: req.params.id,
    })
      .populate("acheteur", "nom")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Derniers avis publics pour la page d'accueil
const getLatestReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("acheteur", "nom localisation")
      .populate("produit", "nom")
      .sort({ note: -1, createdAt: -1 })
      .limit(3);

    res.status(200).json(reviews);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getSellerReviews,
  getProductReviews,
  getLatestReviews,
};