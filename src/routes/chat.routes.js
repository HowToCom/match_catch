const express = require("express");

const auth = require("../middlewares/auth");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

router.post("/:chat_room_id/messages", auth, chatController.sendMessage);

router.get("/:chat_room_id/messages", auth, chatController.getMessages);

module.exports = router;