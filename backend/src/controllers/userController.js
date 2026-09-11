const User = require("../models/User");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ==================================================
// NORMALISER LE TÉLÉPHONE
// ==================================================

const normalizePhone = (telephone) => {
  if (!telephone) return "";

  return String(telephone)
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");
};

// ==================================================
// CONSTRUIRE LE NUMÉRO COMPLET
// ==================================================

const buildFullPhone = (telephone, indicatif) => {
  let phone = normalizePhone(telephone);
  let prefix = normalizePhone(indicatif);

  if (!phone || !prefix) {
    return "";
  }

  // Ajouter + à l'indicatif si nécessaire
  if (!prefix.startsWith("+")) {
    prefix = `+${prefix}`;
  }

  // Si le numéro commence par 00
  if (phone.startsWith("00")) {
    phone = phone.substring(2);
  }

  // Si le numéro local commence par 0
  if (phone.startsWith("0")) {
    phone = phone.substring(1);
  }

  return `${prefix}${phone}`;
};

// ==================================================
// VOIR LE PROFIL PUBLIC D'UN VENDEUR
// ==================================================

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
    console.error("Erreur profil vendeur :", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================================================
// MODIFIER SON PROFIL
// ==================================================

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    // ==================================================
    // RÉCUPÉRER LES DONNÉES
    // ==================================================

    const nom =
      req.body.nom !== undefined
        ? req.body.nom.trim()
        : user.nom;

    const telephone =
      req.body.telephone !== undefined
        ? normalizePhone(req.body.telephone)
        : user.telephone;

    const pays =
      req.body.pays !== undefined
        ? req.body.pays.trim()
        : user.pays;

    const indicatif =
      req.body.indicatif !== undefined
        ? normalizePhone(req.body.indicatif)
        : user.indicatif;

    const localisation =
      req.body.localisation !== undefined
        ? req.body.localisation.trim()
        : user.localisation;

    const bio =
      req.body.bio !== undefined
        ? req.body.bio.trim()
        : user.bio;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!nom) {
      return res.status(400).json({
        message: "Le nom est obligatoire.",
      });
    }

    if (!telephone) {
      return res.status(400).json({
        message: "Le numéro de téléphone est obligatoire.",
      });
    }

    if (!pays) {
      return res.status(400).json({
        message: "Veuillez sélectionner votre pays.",
      });
    }

    if (!indicatif) {
      return res.status(400).json({
        message: "Veuillez sélectionner l'indicatif de votre pays.",
      });
    }

    // ==================================================
    // NUMÉRO COMPLET
    // ==================================================

    const telephoneComplet = buildFullPhone(
      telephone,
      indicatif
    );

    if (!telephoneComplet) {
      return res.status(400).json({
        message: "Numéro de téléphone invalide.",
      });
    }

    // ==================================================
    // VÉRIFIER SI LE NUMÉRO EST DÉJÀ UTILISÉ
    // ==================================================

    const existingUser = await User.findOne({
      telephoneComplet,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Ce numéro de téléphone est déjà utilisé.",
      });
    }

    // ==================================================
    // PHOTO
    // ==================================================

    let photo = user.photo;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "agriconnect/profils",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(stream);
      });

      photo = result.secure_url;
    }

    // ==================================================
    // MISE À JOUR
    // ==================================================

    user.nom = nom;
    user.telephone = telephone;
    user.pays = pays;
    user.indicatif = indicatif;
    user.telephoneComplet = telephoneComplet;
    user.localisation = localisation;
    user.bio = bio;
    user.photo = photo;

    await user.save();

    // ==================================================
    // RÉPONSE
    // ==================================================

    const userResponse = user.toObject();

    delete userResponse.motDePasse;

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: userResponse,
    });
  } catch (error) {
    console.error("Erreur modification profil :", error);

    // Gestion numéro unique
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Ce numéro de téléphone est déjà associé à un autre compte.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================================================
// RÉCUPÉRER MON PROFIL
// ==================================================

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
    console.error("Erreur récupération profil :", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================================================
// METTRE À JOUR LA POSITION
// ==================================================

const updateLocation = async (req, res) => {
  try {
    console.log("REQ.USER =", req.user);

    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "Latitude et longitude sont obligatoires.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      },
      { 
        returnDocument: "after",
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    res.status(200).json({
      message: "Position mise à jour avec succès",
      latitude: user.latitude,
      longitude: user.longitude,
    });
  } catch (error) {
    console.error("Erreur position :", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================================================
// VENDEURS AVEC LOCALISATION
// ==================================================

const getSellersWithLocation = async (req, res) => {
  try {
    const sellers = await User.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    }).select(
      "nom telephone telephoneComplet latitude longitude role"
    );

    console.log(sellers);

    res.status(200).json(sellers);
  } catch (error) {
    console.error("Erreur vendeurs avec localisation :", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  getSellerProfile,
  updateProfile,
  getMyProfile,
  updateLocation,
  getSellersWithLocation,
};