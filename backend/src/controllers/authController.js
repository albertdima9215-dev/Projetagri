const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetCode } = require("../services/emailService");

const register = async (req, res) => {
  try {
    const {
      nom,
      email,
      telephone,
      pays,
      indicatif,
      motDePasse,
      role,
    } = req.body;

    // Vérifications de base
    if (
      !nom ||
      !email ||
      !telephone ||
      !pays ||
      !indicatif ||
      !motDePasse
    ) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs obligatoires.",
      });
    }

    // Nettoyer l'indicatif
    const indicatifPropre = indicatif.trim().replace(/\s/g, "");

    // Nettoyer le numéro
    const telephonePropre = telephone
      .trim()
      .replace(/\s/g, "")
      .replace(/-/g, "");

    // Vérifier que l'indicatif commence par +
    if (!indicatifPropre.startsWith("+")) {
      return res.status(400).json({
        message: "L'indicatif doit commencer par +.",
      });
    }

    // Vérifier le numéro
    if (!/^\d+$/.test(telephonePropre)) {
      return res.status(400).json({
        message: "Le numéro de téléphone est invalide.",
      });
    }

    // Numéro international
    const telephoneComplet =
      `${indicatifPropre}${telephonePropre}`;

    // Vérifier si l'email existe
    const userExiste = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (userExiste) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé.",
      });
    }

    // Vérifier si le numéro existe
    const telephoneExiste = await User.findOne({
      telephoneComplet,
    });

    if (telephoneExiste) {
      return res.status(400).json({
        message: "Ce numéro de téléphone est déjà utilisé.",
      });
    }

    // Mots de passe trop courants
    const weakPasswords = [
      "12345678",
      "password",
      "azerty123",
      "qwerty123",
      "admin123",
      "motdepasse",
      "agriconnect",
    ];

    if (weakPasswords.includes(motDePasse.toLowerCase())) {
      return res.status(400).json({
        message:
          "Ce mot de passe est trop courant. Choisissez-en un autre.",
      });
    }

    // Sécurité du mot de passe
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(motDePasse)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(
      motDePasse,
      salt
    );

    // Créer l'utilisateur
    const user = await User.create({
      nom: nom.trim(),
      email: email.toLowerCase().trim(),
      telephone: telephonePropre,
      pays: pays.trim(),
      indicatif: indicatifPropre,
      telephoneComplet,
      motDePasse: motDePasseHash,
      role: role || "acheteur",
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        pays: user.pays,
        indicatif: user.indicatif,
        telephoneComplet: user.telephoneComplet,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Erreur inscription :", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*login ,connexion*/
const login = async (req, res) => {
  try {
    const { identifiant, motDePasse } = req.body;

    if (!identifiant || !motDePasse) {
      return res.status(400).json({
        message: "Veuillez renseigner votre email ou numéro de téléphone.",
      });
    }

    const valeur = identifiant.trim();

    // Recherche par email OU numéro international
    const user = await User.findOne({
      $or: [
        { email: valeur.toLowerCase() },
        { telephoneComplet: valeur.replace(/\s/g, "") },
      ],
    });

    if (!user) {
      return res.status(400).json({
        message: "Email, numéro de téléphone ou mot de passe incorrect.",
      });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(
      motDePasse,
      user.motDePasse
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Email, numéro de téléphone ou mot de passe incorrect.",
      });
    }

    // Générer le token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        telephoneComplet: user.telephoneComplet,
        pays: user.pays,
        indicatif: user.indicatif,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Erreur connexion :", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { identifiant } = req.body;

    if (!identifiant) {
      return res.status(400).json({
        message: "Veuillez renseigner votre email ou votre numéro de téléphone.",
      });
    }

    const valeur = identifiant.trim();

    const emailRecherche = valeur.toLowerCase();

    const telephoneRecherche = valeur.replace(/\s/g, "");

    const user = await User.findOne({
      $or: [
        { email: emailRecherche },
        { telephoneComplet: telephoneRecherche },
        { telephone: telephoneRecherche },
      ],
    });

    // Ne pas révéler si le compte existe
    if (!user) {
      return res.status(200).json({
        message:
          "Si un compte correspond à ces informations, un code de récupération a été envoyé par email.",
      });
    }

    if (!user.email) {
      return res.status(200).json({
        message:
          "Si un compte correspond à ces informations, un code de récupération a été envoyé par email.",
      });
    }

    // Générer un code à 6 chiffres
    const code = crypto.randomInt(100000, 1000000).toString();

    // Hasher le code avant de le stocker
    const codeHash = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordCodeHash: codeHash,
          resetPasswordCodeExpiresAt: expiresAt,
          resetPasswordTokenHash: null,
          resetPasswordTokenExpiresAt: null,
        },
      }
    );

    await sendPasswordResetCode(user.email, code);

    res.status(200).json({
      message:
        "Un code de récupération a été envoyé à votre adresse email.",
    });

  } catch (error) {
    console.error(
      "Erreur forgot password :",
      error
    );

    res.status(500).json({
      message:
        "Une erreur est survenue lors de l'envoi du code.",
    });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { identifiant, code } = req.body;

    if (!identifiant || !code) {
      return res.status(400).json({
        message: "Identifiant et code requis.",
      });
    }

    const valeur = identifiant.trim();

    const telephoneRecherche = valeur.replace(/\s/g, "");

    const user = await User.findOne({
      $or: [
        { email: valeur.toLowerCase() },
        { telephoneComplet: telephoneRecherche },
        { telephone: telephoneRecherche },
      ],
    });

    if (!user) {
      return res.status(400).json({
        message: "Code invalide ou expiré.",
      });
    }

    if (
      !user.resetPasswordCodeHash ||
      !user.resetPasswordCodeExpiresAt
    ) {
      return res.status(400).json({
        message: "Code invalide ou expiré.",
      });
    }

    if (
      new Date() >
      new Date(user.resetPasswordCodeExpiresAt)
    ) {
      return res.status(400).json({
        message: "Le code a expiré. Veuillez demander un nouveau code.",
      });
    }

    const codeHash = crypto
      .createHash("sha256")
      .update(code.trim())
      .digest("hex");

    if (codeHash !== user.resetPasswordCodeHash) {
      return res.status(400).json({
        message: "Code incorrect.",
      });
    }

    // Générer un token temporaire
    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordTokenHash: resetTokenHash,
          resetPasswordTokenExpiresAt:
            resetTokenExpiresAt,

          resetPasswordCodeHash: null,
          resetPasswordCodeExpiresAt: null,
        },
      }
    );

    res.status(200).json({
      message: "Code vérifié avec succès.",
      resetToken,
    });

  } catch (error) {
    console.error(
      "Erreur vérification code :",
      error
    );

    res.status(500).json({
      message: "Erreur lors de la vérification du code.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const {
      resetToken,
      nouveauMotDePasse,
    } = req.body;

    if (!resetToken || !nouveauMotDePasse) {
      return res.status(400).json({
        message:
          "Token et nouveau mot de passe requis.",
      });
    }

    if (nouveauMotDePasse.length < 8) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: resetTokenHash,
      resetPasswordTokenExpiresAt: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Le lien de réinitialisation est invalide ou expiré.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      nouveauMotDePasse,
      10
    );

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          motDePasse: hashedPassword,
          resetPasswordTokenHash: null,
          resetPasswordTokenExpiresAt: null,
        },
      }
    );

    res.status(200).json({
      message:
        "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
    });

  } catch (error) {
    console.error(
      "Erreur réinitialisation mot de passe :",
      error
    );

    res.status(500).json({
      message:
        "Impossible de réinitialiser le mot de passe.",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};