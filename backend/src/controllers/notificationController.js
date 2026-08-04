const Notification = require("../models/Notification");

// Mes notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      utilisateur: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Marquer comme lue
const markAsRead = async (req, res) => {
  try {

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification introuvable",
      });
    }

    notification.lu = true;

    await notification.save();

    res.status(200).json(notification);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        utilisateur: req.user.id,
        lu: false,
      },
      {
        $set: { lu: true },
      }
    );

    res.status(200).json({
      message: "Toutes les notifications sont lues",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};