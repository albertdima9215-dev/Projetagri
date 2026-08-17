const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

module.exports = {register,login,};