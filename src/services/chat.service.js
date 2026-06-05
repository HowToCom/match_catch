const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

async function checkChatRoomParticipant(userId, chatRoomId) {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: {
      id: Number(chatRoomId),
    },
    include: {
      match: true,
    },
  });

  if (!chatRoom) {
    throw new AppError("존재하지 않는 채팅방입니다.", 404);
  }

  const isParticipant =
    chatRoom.match.requesterId === userId ||
    chatRoom.match.receiverId === userId;

  if (!isParticipant) {
    throw new AppError("채팅방 참여자가 아닙니다.", 403);
  }

  if (chatRoom.match.status !== "ACCEPTED") {
    throw new AppError("현재 채팅을 사용할 수 없는 매칭 상태입니다.", 409);
  }

  return chatRoom;
}

async function sendMessage(userId, chatRoomId, data) {
  const { message } = data;

  if (!message || message.trim() === "") {
    throw new AppError("메시지 내용은 필수입니다.", 400);
  }

  await checkChatRoomParticipant(userId, chatRoomId);

  const savedMessage = await prisma.message.create({
    data: {
      chatRoomId: Number(chatRoomId),
      senderId: userId,
      message: message.trim(),
    },
    select: {
      id: true,
      chatRoomId: true,
      senderId: true,
      message: true,
      createdAt: true,
    },
  });

  return {
    message_id: savedMessage.id,
    chat_room_id: savedMessage.chatRoomId,
    sender_id: savedMessage.senderId,
    message: savedMessage.message,
    created_at: savedMessage.createdAt,
  };
}

async function getMessages(userId, chatRoomId, query) {
  const size = Number(query.size) || 20;
  const cursor = query.cursor ? Number(query.cursor) : null;

  if (size < 1 || size > 100) {
    throw new AppError("size는 1 이상 100 이하만 가능합니다.", 400);
  }

  await checkChatRoomParticipant(userId, chatRoomId);

  const messages = await prisma.message.findMany({
    where: {
      chatRoomId: Number(chatRoomId),
      ...(cursor && {
        id: {
          lt: cursor,
        },
      }),
    },
    orderBy: {
      id: "desc",
    },
    take: size + 1,
    select: {
      id: true,
      chatRoomId: true,
      senderId: true,
      message: true,
      createdAt: true,
    },
  });

  const hasNext = messages.length > size;
  const slicedMessages = hasNext ? messages.slice(0, size) : messages;

  const resultMessages = slicedMessages.reverse().map((message) => ({
    message_id: message.id,
    chat_room_id: message.chatRoomId,
    sender_id: message.senderId,
    message: message.message,
    created_at: message.createdAt,
  }));

  return {
    messages: resultMessages,
    next_cursor:
      slicedMessages.length > 0
        ? slicedMessages[slicedMessages.length - 1].id
        : null,
    has_next: hasNext,
  };
}

module.exports = {
  sendMessage,
  getMessages,
};