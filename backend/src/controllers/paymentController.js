const Order = require("../models/Order");
const Notification = require("../models/Notification");

const payOrder = async (req, res) => {
  try {
    const { orderId, methodePaiement } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Commande introuvable",
      });
    }

    if (order.acheteur.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Accès refusé",
      });
    }

    if (order.paiement === "Payé") {
      return res.status(400).json({
        message: "Cette commande est déjà payée.",
      });
    }

    // Simulation du paiement
    order.paiement = "Payé";
    order.methodePaiement = methodePaiement;
    order.referencePaiement = `PAY-${Date.now()}`;

    await order.save();

    await Notification.create({
      utilisateur: order.vendeur,
      type: "commande",
      titre: "Paiement reçu",
      message: "Une commande a été payée avec succès.",
      lien: "/seller-orders",
    });

    res.status(200).json({
      message: "Paiement effectué avec succès.",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  payOrder,
};