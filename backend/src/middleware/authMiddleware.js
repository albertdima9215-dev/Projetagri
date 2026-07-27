const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-motDePasse");

      if (!req.user) {
        return res.status(401).json({
          message: "Utilisateur introuvable.",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Token invalide",
      });
    }
  } else {
    return res.status(401).json({
      message: "Accès refusé. Aucun token fourni.",
    });
  }
};

module.exports = protect;