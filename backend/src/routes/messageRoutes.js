const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  sendMessage,
  getConversations,
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", protect, sendMessage);

router.get("/conversations", protect, getConversations);

router.get("/:conversationId", protect, getMessages);

module.exports = router;