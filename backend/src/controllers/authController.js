const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExiste = await User.findOne({ email });

    if (userExiste) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé.",
      });
    }

    // Chiffrer le mot de passe
    const salt = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasse, salt);

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      email,
      telephone,
      motDePasse: motDePasseHash,
      role,
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*login ,connexion*/
const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Rechercher l'utilisateur
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email ou mot de passe incorrect."
      });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!isMatch) {
      return res.status(400).json({
        message: "Email ou mot de passe incorrect."
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {register,login,};