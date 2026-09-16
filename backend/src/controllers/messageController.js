const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// ===============================
// ENVOYER UN MESSAGE
// ===============================

const sendMessage = async (req, res) => {
  try {
    const {
      destinataireId,
      contenu,
      automatique = false,
    } = req.body;

    // Vérifications
    if (!destinataireId) {
      return res.status(400).json({
        message: "Destinataire requis.",
      });
    }

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({
        message: "Le message ne peut pas être vide.",
      });
    }

    // ===============================
    // RECHERCHE DE LA CONVERSATION
    // ===============================

    let conversation = await Conversation.findOne({
      participants: {
        $all: [req.user.id, destinataireId],
      },
    });

    // ===============================
    // CRÉATION SI ELLE N'EXISTE PAS
    // ===============================

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, destinataireId],
      });
    }

    // ===============================
    // MESSAGE AUTOMATIQUE
    // ===============================

    if (automatique) {
      const messageAutomatiqueExiste = await Message.findOne({
        conversation: conversation._id,
        automatique: true,
      });

      // Si déjà envoyé → on ne crée rien
      if (messageAutomatiqueExiste) {
        return res.status(200).json({
          message: "La conversation existe déjà.",
          data: messageAutomatiqueExiste,
          dejaEnvoye: true,
          conversationId: conversation._id,
        });
      }
    }

    // ===============================
    // CRÉATION DU MESSAGE
    // ===============================

    const message = await Message.create({
      conversation: conversation._id,
      expediteur: req.user.id,
      contenu: contenu.trim(),
      automatique: Boolean(automatique),
    });

    // ===============================
    // RÉPONSE
    // ===============================

    res.status(201).json({
      message: "Message envoyé avec succès",
      data: message,
      dejaEnvoye: false,
      conversationId: conversation._id,
    });

  } catch (error) {
    console.error("Erreur sendMessage :", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ===============================
// RÉCUPÉRER LES CONVERSATIONS
// ===============================

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate(
        "participants",
        "nom email telephone telephoneComplet photo"
      )
      .sort({
        updatedAt: -1,
      });

    res.status(200).json(conversations);

  } catch (error) {
    console.error(
      "Erreur récupération conversations :",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ===============================
// RÉCUPÉRER LES MESSAGES
// ===============================

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate(
        "expediteur",
        "nom email telephone telephoneComplet photo"
      )
      .sort({
        createdAt: 1,
      });

    res.status(200).json(messages);

  } catch (error) {
    console.error(
      "Erreur récupération messages :",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  sendMessage,
  getConversations,
  getMessages,
};