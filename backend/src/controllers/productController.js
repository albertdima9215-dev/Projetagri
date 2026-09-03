const Product = require("../models/Product.js");
const cloudinary = require("../config/cloudinary.js");
const streamifier = require("streamifier");
const User = require("../models/User");
const Review = require("../models/Review");

/*
====================================================
UTILITAIRE : VALIDATION DES INFORMATIONS DE VENTE
====================================================
*/

const validerVente = ({
  typeVente,
  unite,
  quantiteParLot,
}) => {
  // Vérifier le type de vente
  if (!["poids", "unite", "lot"].includes(typeVente)) {
    return "Type de vente invalide.";
  }

  // Vérifier l'unité
  if (!unite || typeof unite !== "string") {
    return "L'unité de vente est obligatoire.";
  }

  // Pour une vente par lot
  if (typeVente === "lot") {
    if (
      quantiteParLot === undefined ||
      quantiteParLot === null ||
      quantiteParLot === "" ||
      Number(quantiteParLot) < 1
    ) {
      return "La quantité contenue dans le lot est obligatoire.";
    }
  }

  return null;
};


/*
====================================================
CRÉATION DE PRODUIT
====================================================
*/

const createProduct = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    // Un acheteur devient automatiquement vendeur
    // lorsqu'il publie son premier produit.
    if (user.role === "acheteur") {
      user.role = "vendeur";
      await user.save();
    }

    const {
      nom,
      description,
      categorie,
      typeVente,
      prix,
      unite,
      quantiteParLot,
      quantite,
      localisation,
    } = req.body;


    /*
    =========================
    VALIDATION
    =========================
    */

    if (
      !nom ||
      !description ||
      !categorie ||
      !prix ||
      quantite === undefined ||
      quantite === "" ||
      !localisation
    ) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs obligatoires.",
      });
    }

    const erreurVente = validerVente({
      typeVente,
      unite,
      quantiteParLot,
    });

    if (erreurVente) {
      return res.status(400).json({
        message: erreurVente,
      });
    }


    /*
    =========================
    IMAGES CLOUDINARY
    =========================
    */

    let imageUrls = [];

    if (req.files && req.files.length > 0) {

      for (const file of req.files) {

        const result = await new Promise((resolve, reject) => {

          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "agriconnect/products",
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
            .createReadStream(file.buffer)
            .pipe(stream);

        });

        imageUrls.push(result.secure_url);
      }
    }


    /*
    =========================
    CRÉATION DU PRODUIT
    =========================
    */

    if (!["poids", "unite", "lot"].includes(typeVente)) {
  return res.status(400).json({
    message: "Type de vente invalide.",
  });
}

if (!unite) {
  return res.status(400).json({
    message: "L'unité de vente est obligatoire.",
  });
}

if (Number(prix) < 0) {
  return res.status(400).json({
    message: "Le prix ne peut pas être négatif.",
  });
}

if (Number(quantite) < 0) {
  return res.status(400).json({
    message: "La quantité ne peut pas être négative.",
  });
}

if (
  typeVente === "lot" &&
  (!quantiteParLot || Number(quantiteParLot) < 1)
) {
  return res.status(400).json({
    message: "Le nombre d'éléments par lot est obligatoire.",
  });
}

    const produit = await Product.create({

      nom: nom.trim(),

      description: description.trim(),

      categorie: categorie.trim(),

      typeVente,

      prix: Number(prix),

      unite: unite.trim(),

      quantiteParLot:
        typeVente === "lot"
          ? Number(quantiteParLot)
          : null,

      quantite: Number(quantite),

      localisation: localisation.trim(),

      images: imageUrls,

      image:
        imageUrls.length > 0
          ? imageUrls[0]
          : "",

      vendeur: req.user.id,
    });


    res.status(201).json({

      message: "Produit publié avec succès",

      produit,

    });

  } catch (error) {

    console.error(
      "Erreur création produit :",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/*
====================================================
OBTENIR LES PRODUITS
====================================================
*/

const getProducts = async (req, res) => {

  try {

    const {
      search,
      localisation,
      categorie,
      page = 1,
      limit = 50,
    } = req.query;

    let filtre = {};


    if (search) {

      filtre.nom = {
        $regex: search,
        $options: "i",
      };

    }


    if (localisation) {

      filtre.localisation = {
        $regex: localisation,
        $options: "i",
      };

    }


    if (categorie) {

      filtre.categorie = categorie;

    }


    const total =
      await Product.countDocuments(filtre);


    const produits =
      await Product.find(filtre)

        .populate(
          "vendeur",
          "nom email telephone"
        )

        .skip(
          (page - 1) * Number(limit)
        )

        .limit(Number(limit))

        .sort({
          createdAt: -1,
        });


    /*
    =========================
    AVIS
    =========================
    */

    const produitsAvecAvis =
      await Promise.all(

        produits.map(
          async (produit) => {

            const reviews =
              await Review.find({
                produit: produit._id,
              });


            const totalReviews =
              reviews.length;


            const averageRating =
              totalReviews > 0
                ? (
                    reviews.reduce(
                      (sum, r) =>
                        sum + r.note,
                      0
                    ) / totalReviews
                  ).toFixed(1)
                : 0;


            return {

              ...produit.toObject(),

              averageRating,

              totalReviews,

            };

          }
        )
      );


    res.status(200).json({

      total,

      page: Number(page),

      totalPages:
        Math.ceil(
          total / Number(limit)
        ),

      produits:
        produitsAvecAvis,

    });

  } catch (error) {

    console.error(
      "Erreur récupération produits :",
      error
    );

    res.status(500).json({
      message: error.message,
    });

  }
};


/*
====================================================
OBTENIR UN PRODUIT PAR ID
====================================================
*/

const getProductById = async (req, res) => {

  try {

    const produit =
      await Product.findById(
        req.params.id
      ).populate(
        "vendeur",
        "nom email telephone telephoneComplet pays indicatif"
      );


    if (!produit) {

      return res.status(404).json({

        message:
          "Produit introuvable",

      });

    }


    res.status(200).json(produit);

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }
};


/*
====================================================
MODIFICATION D'UN PRODUIT
====================================================
*/

const updateProduct = async (req, res) => {

  try {

    const produit =
      await Product.findById(
        req.params.id
      );


    if (!produit) {

      return res.status(404).json({

        message:
          "Produit introuvable",

      });

    }


    /*
    =========================
    VÉRIFICATION VENDEUR
    =========================
    */

    if (
      produit.vendeur.toString() !==
      req.user.id
    ) {

      return res.status(403).json({

        message:
          "Vous n'êtes pas autorisé à modifier ce produit.",

      });

    }


    /*
    =========================
    IMAGES
    =========================
    */

    let imageUrls =
      produit.images || [];


    if (
      req.files &&
      req.files.length > 0
    ) {

      imageUrls = [];


      for (const file of req.files) {

        const result =
          await new Promise(
            (resolve, reject) => {

              const stream =
                cloudinary.uploader.upload_stream(

                  {
                    folder:
                      "agriconnect/products",
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
                .createReadStream(
                  file.buffer
                )
                .pipe(stream);

            }
          );


        imageUrls.push(
          result.secure_url
        );

      }

    }


    /*
    =========================
    DONNÉES
    =========================
    */

    const {
      nom,
      description,
      categorie,
      typeVente,
      prix,
      unite,
      quantiteParLot,
      quantite,
      localisation,
    } = req.body;


    /*
    =========================
    VALIDATION VENTE
    =========================
    */

    const erreurVente =
      validerVente({

        typeVente:
          typeVente ||
          produit.typeVente,

        unite:
          unite ||
          produit.unite,

        quantiteParLot:
          quantiteParLot,

      });


    if (erreurVente) {

      return res.status(400).json({

        message: erreurVente,

      });

    }


    /*
    =========================
    MISE À JOUR
    =========================
    */

    produit.nom =
      nom?.trim() ||
      produit.nom;

    produit.description =
      description?.trim() ||
      produit.description;

    produit.categorie =
      categorie?.trim() ||
      produit.categorie;

    produit.typeVente =
      typeVente ||
      produit.typeVente;

    produit.prix =
      prix !== undefined
        ? Number(prix)
        : produit.prix;

    produit.unite =
      unite?.trim() ||
      produit.unite;

    produit.quantiteParLot =
      produit.typeVente === "lot"
        ? Number(
            quantiteParLot
          )
        : null;

    produit.quantite =
      quantite !== undefined
        ? Number(quantite)
        : produit.quantite;

    produit.localisation =
      localisation?.trim() ||
      produit.localisation;

    produit.images =
      imageUrls;

    produit.image =
      imageUrls.length > 0
        ? imageUrls[0]
        : "";


    await produit.save();


    res.status(200).json({

      message:
        "Produit modifié avec succès",

      produit,

    });

  } catch (error) {

    console.error(
      "Erreur modification produit :",
      error
    );

    res.status(500).json({

      message: error.message,

    });

  }
};


/*
====================================================
SUPPRESSION
====================================================
*/

const deleteProduct = async (req, res) => {

  try {

    const produit =
      await Product.findById(
        req.params.id
      );


    if (!produit) {

      return res.status(404).json({

        message:
          "Produit introuvable",

      });

    }


    if (
      produit.vendeur.toString() !==
      req.user.id
    ) {

      return res.status(403).json({

        message:
          "Vous n'êtes pas autorisé à supprimer ce produit.",

      });

    }


    await Product.findByIdAndDelete(
      req.params.id
    );


    res.status(200).json({

      message:
        "Produit supprimé avec succès",

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }
};


/*
====================================================
MES PRODUITS
====================================================
*/

const getMyProducts = async (req, res) => {

  try {

    const produits =
      await Product.find({

        vendeur: req.user.id,

      }).sort({

        createdAt: -1,

      });


    res.status(200).json(
      produits
    );

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }
};


/*
====================================================
PRODUITS POUR LA CARTE
====================================================
*/

const getProductsForMap = async (req, res) => {
  try {
    const products = await Product.find()
      .populate(
        "vendeur",
        "latitude longitude nom"
      )
      .sort({
        createdAt: -1,
      });

    const result = products
      .filter(
        (p) =>
          p.vendeur &&
          p.vendeur.latitude != null &&
          p.vendeur.longitude != null
      )
      .map((p) => {
        const images = Array.isArray(p.images)
          ? p.images.filter(
              (img) =>
                typeof img === "string" &&
                img.trim() !== ""
            )
          : [];

        return {
          _id: p._id,

          // Produit
          nom: p.nom,
          prix: p.prix,

          // Type de vente
          typeVente: p.typeVente,
          unite: p.unite,
          quantite: p.quantite,
          quantiteParLot: p.quantiteParLot,

          // Images
          images,

          image:
            images.length > 0
              ? images[0]
              : p.image || null,

          // Localisation du vendeur
          latitude: p.vendeur.latitude,
          longitude: p.vendeur.longitude,
        };
      });

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Erreur produits carte :",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/*
====================================================
EXPORTS
====================================================
*/

module.exports = {

  createProduct,

  getProducts,

  getProductById,

  updateProduct,

  deleteProduct,

  getMyProducts,

  getProductsForMap,

};