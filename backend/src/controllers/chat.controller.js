const chatService = require("../services/chat.service");

async function sendMessage(req, res, next) {
  try {
    const result = await chatService.sendMessage(
      req.user.id,
      req.params.chat_room_id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "메시지 전송에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const result = await chatService.getMessages(
      req.user.id,
      req.params.chat_room_id,
      req.query
    );

    res.status(200).json({
      success: true,
      message: "메시지 목록 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendMessage,
  getMessages,
};