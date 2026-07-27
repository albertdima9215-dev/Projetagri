const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

// Ajouter un produit aux favoris
const addFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const produit = await Product.findById(productId);

    if (!produit) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    const existe = await Favorite.findOne({
      utilisateur: req.user.id,
      produit: productId,
    });

    if (existe) {
      return res.status(400).json({
        message: "Ce produit est déjà dans vos favoris.",
      });
    }

    const favori = await Favorite.create({
      utilisateur: req.user.id,
      produit: productId,
    });

    res.status(201).json({
      message: "Produit ajouté aux favoris.",
      favori,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Supprimer un favori
const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const favori = await Favorite.findOneAndDelete({
      utilisateur: req.user.id,
      produit: productId,
    });

    if (!favori) {
      return res.status(404).json({
        message: "Favori introuvable.",
      });
    }

    res.status(200).json({
      message: "Produit retiré des favoris.",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Récupérer les favoris de l'utilisateur
const getFavorites = async (req, res) => {
  try {
    const favoris = await Favorite.find({
      utilisateur: req.user.id,
    }).populate("produit");

    res.status(200).json(favoris);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};