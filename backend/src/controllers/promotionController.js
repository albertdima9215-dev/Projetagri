const Promotion = require("../models/Promotion");


// ==========================================
// PROMOTIONS ACTIVES
// ==========================================

const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    const promotions = await Promotion.find({
      active: true,
      dateDebut: { $lte: now },
      dateFin: { $gte: now },
    })
      .populate("produit")
      .sort({ createdAt: -1 });

    res.json(promotions);

  } catch (error) {
    console.error("Erreur promotions actives :", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des promotions.",
    });
  }
};


// ==========================================
// TOUTES LES PROMOTIONS
// ==========================================

const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate("produit")
      .sort({ createdAt: -1 });

    res.json(promotions);

  } catch (error) {
    console.error("Erreur récupération promotions :", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des promotions.",
    });
  }
};


// ==========================================
// CRÉER UNE PROMOTION
// ==========================================

const createPromotion = async (req, res) => {
  try {
    const {
      titre,
      description,
      image,
      produit,
      prixAvant,
      prixPromotion,
      reduction,
      dateDebut,
      dateFin,
      active,
    } = req.body;

    if (!titre || !dateDebut || !dateFin) {
      return res.status(400).json({
        message: "Le titre, la date de début et la date de fin sont obligatoires.",
      });
    }

    if (new Date(dateFin) <= new Date(dateDebut)) {
      return res.status(400).json({
        message: "La date de fin doit être après la date de début.",
      });
    }

    const promotion = await Promotion.create({
      titre,
      description,
      image,
      produit: produit || null,
      prixAvant,
      prixPromotion,
      reduction,
      dateDebut,
      dateFin,
      active: active !== false,
    });

    const result = await promotion.populate("produit");

    res.status(201).json({
      message: "Promotion créée avec succès.",
      promotion: result,
    });

  } catch (error) {
    console.error("Erreur création promotion :", error);

    res.status(500).json({
      message: "Erreur lors de la création de la promotion.",
      error: error.message,
    });
  }
};


// ==========================================
// MODIFIER UNE PROMOTION
// ==========================================

const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("produit");

    if (!promotion) {
      return res.status(404).json({
        message: "Promotion introuvable.",
      });
    }

    res.json({
      message: "Promotion modifiée avec succès.",
      promotion,
    });

  } catch (error) {
    console.error("Erreur modification promotion :", error);

    res.status(500).json({
      message: "Erreur lors de la modification de la promotion.",
    });
  }
};


// ==========================================
// SUPPRIMER UNE PROMOTION
// ==========================================

const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(
      req.params.id
    );

    if (!promotion) {
      return res.status(404).json({
        message: "Promotion introuvable.",
      });
    }

    res.json({
      message: "Promotion supprimée avec succès.",
    });

  } catch (error) {
    console.error("Erreur suppression promotion :", error);

    res.status(500).json({
      message: "Erreur lors de la suppression de la promotion.",
    });
  }
};


module.exports = {
  getActivePromotions,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
};