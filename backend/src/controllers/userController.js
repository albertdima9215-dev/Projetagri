const User = require("../models/User");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Voir le profil public d'un vendeur
const getSellerProfile = async (req, res) => {
  try {
    const vendeur = await User.findById(req.params.id).select("-motDePasse");

    if (!vendeur) {
      return res.status(404).json({
        message: "Vendeur introuvable",
      });
    }

    const produits = await Product.find({
      vendeur: vendeur._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      vendeur,
      produits,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Modifier son profil
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    let photo = user.photo;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
          { folder: "agriconnect/profils" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);

      });

      photo = result.secure_url;
    }

    user.nom = req.body.nom || user.nom;
    user.telephone = req.body.telephone || user.telephone;
    user.localisation = req.body.localisation || user.localisation;
    user.bio = req.body.bio || user.bio;
    user.photo = photo;

    await user.save();

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*Modifier profil*/
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-motDePasse");

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getSellerProfile,
  updateProfile,
  getMyProfile,
};