const Product = require("../models/Product.js");
const cloudinary = require("../config/cloudinary.js");
const streamifier = require("streamifier");

/*création de produit*/
const createProduct = async (req, res) => {
  try {
    const {
      nom,
      description,
      categorie,
      prix,
      quantite,
      localisation,
    } = req.body;

    let imageUrl = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "agriconnect" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      imageUrl = result.secure_url;
    }

    const produit = await Product.create({
      nom,
      description,
      categorie,
      prix,
      quantite,
      localisation,
      image: imageUrl,
      vendeur: req.user.id,
    });

    res.status(201).json({
      message: "Produit publié avec succès",
      produit,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*obtention de produit*/
const getProducts = async (req, res) => {
  try {
    const { search, localisation, categorie, page = 1, limit = 10 } = req.query;

    let filtre = {};

    if (search) {
      filtre.nom = { $regex: search, $options: "i" };
    }

    if (localisation) {
      filtre.localisation = { $regex: localisation, $options: "i" };
    }

    if (categorie) {
      filtre.categorie = categorie;
    }

    const total = await Product.countDocuments(filtre);

    const produits = await Product.find(filtre)
      .populate("vendeur", "nom email telephone")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      produits,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*obtenir le produit par son id*/
const getProductById = async (req, res) => {
  try {
    const produit = await Product.findById(req.params.id).populate(
      "vendeur",
      "nom email telephone"
    );

    if (!produit) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    res.status(200).json(produit);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* suppression et modification de ses propres produits*/
const updateProduct = async (req, res) => {
  try {
    const produit = await Product.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    if (produit.vendeur.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier ce produit.",
      });
    }

    let imageUrl = produit.image;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "agriconnect" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      imageUrl = result.secure_url;
    }

    produit.nom = req.body.nom;
    produit.description = req.body.description;
    produit.categorie = req.body.categorie;
    produit.prix = req.body.prix;
    produit.quantite = req.body.quantite;
    produit.localisation = req.body.localisation;
    produit.image = imageUrl;

    await produit.save();

    res.status(200).json({
      message: "Produit modifié avec succès",
      produit,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*suppression*/
const deleteProduct = async (req, res) => {
  try {
    const produit = await Product.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    if (produit.vendeur.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce produit.",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Produit supprimé avec succès",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const produits = await Product.find({
      vendeur: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(produits);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {createProduct,getProducts,getProductById,updateProduct,deleteProduct, getMyProducts,};