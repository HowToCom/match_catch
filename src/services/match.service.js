const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

async function createMatchRequest(userId, data) {
  const { lost_item_id, found_item_id } = data;

  if (!lost_item_id || !found_item_id) {
    throw new AppError("분실물 ID와 습득물 ID는 필수입니다.", 400);
  }

  const lostItem = await prisma.lostItem.findUnique({
    where: { id: Number(lost_item_id) },
  });

  if (!lostItem) {
    throw new AppError("존재하지 않는 분실물입니다.", 404);
  }

  if (lostItem.ownerId !== userId) {
    throw new AppError("본인이 등록한 분실물만 매칭 요청할 수 있습니다.", 403);
  }

  if (lostItem.status !== "REGISTERED") {
    throw new AppError("현재 매칭 요청이 불가능한 분실물 상태입니다.", 409);
  }

  const foundItem = await prisma.foundItem.findUnique({
    where: { id: Number(found_item_id) },
  });

  if (!foundItem) {
    throw new AppError("존재하지 않는 습득물입니다.", 404);
  }

  if (foundItem.status !== "REGISTERED") {
    throw new AppError("현재 매칭 요청이 불가능한 습득물 상태입니다.", 409);
  }

  if (foundItem.ownerId === userId) {
    throw new AppError("본인이 등록한 습득물에는 매칭 요청할 수 없습니다.", 400);
  }

  const existingMatch = await prisma.match.findFirst({
    where: {
      lostItemId: Number(lost_item_id),
      foundItemId: Number(found_item_id),
      status: {
        in: ["PENDING", "ACCEPTED", "DELIVERED"],
      },
    },
  });

  if (existingMatch) {
    throw new AppError("이미 진행 중인 매칭 요청이 있습니다.", 409);
  }

  const result = await prisma.$transaction(async (tx) => {
    const match = await tx.match.create({
      data: {
        lostItemId: Number(lost_item_id),
        foundItemId: Number(found_item_id),
        requesterId: userId,
        receiverId: foundItem.ownerId,
        status: "PENDING",
      },
      select: {
        id: true,
        lostItemId: true,
        foundItemId: true,
        requesterId: true,
        receiverId: true,
        status: true,
        createdAt: true,
      },
    });

    await tx.lostItem.update({
      where: { id: Number(lost_item_id) },
      data: { status: "MATCH_REQUESTED" },
    });

    return match;
  });

  return {
    match_id: result.id,
    lost_item_id: result.lostItemId,
    found_item_id: result.foundItemId,
    requester_id: result.requesterId,
    receiver_id: result.receiverId,
    status: result.status,
    created_at: result.createdAt,
  };
}

async function getMyMatches(userId) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      lostItem: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
        },
      },
      foundItem: {
        select: {
          id: true,
          imageUrl: true,
          description: true,
          status: true,
        },
      },
      requester: {
        select: {
          id: true,
          username: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
        },
      },
      chatRoom: {
        select: {
          id: true,
        },
      },
    },
  });

  return matches.map((match) => ({
    match_id: match.id,
    status: match.status,
    lost_item: {
      lost_item_id: match.lostItem.id,
      title: match.lostItem.title,
      description: match.lostItem.description,
      status: match.lostItem.status,
    },
    found_item: {
      found_item_id: match.foundItem.id,
      image_url: match.foundItem.imageUrl,
      description: match.foundItem.description,
      status: match.foundItem.status,
    },
    requester: {
      user_id: match.requester.id,
      username: match.requester.username,
    },
    receiver: {
      user_id: match.receiver.id,
      username: match.receiver.username,
    },
    chat_room_id: match.chatRoom ? match.chatRoom.id : null,
    created_at: match.createdAt,
  }));
}

async function getMatchById(userId, matchId) {
  const match = await prisma.match.findUnique({
    where: {
      id: Number(matchId),
    },
    include: {
      lostItem: true,
      foundItem: true,
      requester: {
        select: {
          id: true,
          username: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
        },
      },
      chatRoom: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!match) {
    throw new AppError("존재하지 않는 매칭입니다.", 404);
  }

  const isParticipant =
    match.requesterId === userId || match.receiverId === userId;

  if (!isParticipant) {
    throw new AppError("권한 없는 조회 요청입니다.", 403);
  }

  return {
    match_id: match.id,
    status: match.status,
    lost_item: {
      lost_item_id: match.lostItem.id,
      title: match.lostItem.title,
      description: match.lostItem.description,
      status: match.lostItem.status,
    },
    found_item: {
      found_item_id: match.foundItem.id,
      image_url: match.foundItem.imageUrl,
      description: match.foundItem.description,
      status: match.foundItem.status,
    },
    requester: {
      user_id: match.requester.id,
      username: match.requester.username,
    },
    receiver: {
      user_id: match.receiver.id,
      username: match.receiver.username,
    },
    chat_room_id: match.chatRoom ? match.chatRoom.id : null,
    created_at: match.createdAt,
    updated_at: match.updatedAt,
  };
}

async function acceptMatchRequest(userId, matchId) {
  const match = await prisma.match.findUnique({
    where: {
      id: Number(matchId),
    },
    include: {
      lostItem: true,
      foundItem: true,
      chatRoom: true,
    },
  });

  if (!match) {
    throw new AppError("존재하지 않는 매칭입니다.", 404);
  }

  if (match.receiverId !== userId) {
    throw new AppError("매칭 요청을 받은 사용자만 수락할 수 있습니다.", 403);
  }

  if (match.status !== "PENDING") {
    throw new AppError("수락할 수 없는 매칭 상태입니다.", 409);
  }

  if (match.lostItem.status !== "MATCH_REQUESTED") {
    throw new AppError("분실물 상태가 매칭 수락 가능한 상태가 아닙니다.", 409);
  }

  if (match.foundItem.status !== "REGISTERED") {
    throw new AppError("습득물 상태가 매칭 수락 가능한 상태가 아닙니다.", 409);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedMatch = await tx.match.update({
      where: {
        id: Number(matchId),
      },
      data: {
        status: "ACCEPTED",
      },
      select: {
        id: true,
        lostItemId: true,
        foundItemId: true,
        requesterId: true,
        receiverId: true,
        status: true,
        updatedAt: true,
      },
    });

    await tx.lostItem.update({
      where: {
        id: match.lostItemId,
      },
      data: {
        status: "MATCHING",
      },
    });

    await tx.foundItem.update({
      where: {
        id: match.foundItemId,
      },
      data: {
        status: "MATCHING",
      },
    });

    const chatRoom = await tx.chatRoom.create({
      data: {
        matchId: Number(matchId),
      },
      select: {
        id: true,
        matchId: true,
        createdAt: true,
      },
    });

    return {
      updatedMatch,
      chatRoom,
    };
  });

  return {
    match_id: result.updatedMatch.id,
    lost_item_id: result.updatedMatch.lostItemId,
    found_item_id: result.updatedMatch.foundItemId,
    requester_id: result.updatedMatch.requesterId,
    receiver_id: result.updatedMatch.receiverId,
    status: result.updatedMatch.status,
    chat_room_id: result.chatRoom.id,
    updated_at: result.updatedMatch.updatedAt,
  };
}
async function deliverMatch(userId, matchId) {
  const match = await prisma.match.findUnique({
    where: {
      id: Number(matchId),
    },
    include: {
      lostItem: true,
      foundItem: true,
    },
  });

  if (!match) {
    throw new AppError("존재하지 않는 매칭입니다.", 404);
  }

  const isParticipant =
    match.requesterId === userId || match.receiverId === userId;

  if (!isParticipant) {
    throw new AppError("거래 당사자만 인도 완료 처리할 수 있습니다.", 403);
  }

  if (match.status !== "ACCEPTED") {
    throw new AppError("인도 완료 처리할 수 없는 매칭 상태입니다.", 409);
  }

  if (match.lostItem.status !== "MATCHING") {
    throw new AppError("분실물 상태가 인도 완료 가능한 상태가 아닙니다.", 409);
  }

  if (match.foundItem.status !== "MATCHING") {
    throw new AppError("습득물 상태가 인도 완료 가능한 상태가 아닙니다.", 409);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedMatch = await tx.match.update({
      where: {
        id: Number(matchId),
      },
      data: {
        status: "DELIVERED",
      },
      select: {
        id: true,
        lostItemId: true,
        foundItemId: true,
        requesterId: true,
        receiverId: true,
        status: true,
        updatedAt: true,
      },
    });

    await tx.lostItem.update({
      where: {
        id: match.lostItemId,
      },
      data: {
        status: "DELIVERED",
      },
    });

    await tx.foundItem.update({
      where: {
        id: match.foundItemId,
      },
      data: {
        status: "DELIVERED",
      },
    });

    await tx.activity.createMany({
      data: [
        {
          userId: match.requesterId,
          activityType: "DELIVERY_COMPLETED",
          description: `매칭 ID ${match.id}의 분실물 인도가 완료되었습니다.`,
        },
        {
          userId: match.receiverId,
          activityType: "DELIVERY_COMPLETED",
          description: `매칭 ID ${match.id}의 습득물 인도가 완료되었습니다.`,
        },
      ],
    });

    return updatedMatch;
  });

  return {
    match_id: result.id,
    lost_item_id: result.lostItemId,
    found_item_id: result.foundItemId,
    requester_id: result.requesterId,
    receiver_id: result.receiverId,
    status: result.status,
    updated_at: result.updatedAt,
  };
}

module.exports = {
  createMatchRequest,
  getMyMatches,
  getMatchById,
  acceptMatchRequest,
  deliverMatch,
};