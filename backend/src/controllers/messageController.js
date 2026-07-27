const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const sendMessage = async (req, res) => {
  try {
    const { destinataireId, contenu } = req.body;

    let conversation = await Conversation.findOne({
      participants: {
        $all: [req.user.id, destinataireId],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, destinataireId],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      expediteur: req.user.id,
      contenu,
    });

    res.status(201).json({
      message: "Message envoyé avec succès",
      data: message,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    }).populate("participants", "nom email");

    res.status(200).json(conversations);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    }).populate("expediteur", "nom");

    res.status(200).json(messages);

  } catch (error) {
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