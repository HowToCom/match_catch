const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

async function createReview(userId, data) {
  const { match_id, target_user_id, review_type, content } = data;

  if (!match_id || !target_user_id || !review_type) {
    throw new AppError("매칭 ID, 후기 대상자 ID, 후기 유형은 필수입니다.", 400);
  }

  if (!["POSITIVE", "NEGATIVE"].includes(review_type)) {
    throw new AppError("후기 유형은 POSITIVE 또는 NEGATIVE만 가능합니다.", 400);
  }

  const match = await prisma.match.findUnique({
    where: {
      id: Number(match_id),
    },
  });

  if (!match) {
    throw new AppError("존재하지 않는 매칭입니다.", 404);
  }

  if (match.status !== "DELIVERED") {
    throw new AppError("인도 완료된 매칭에만 후기를 작성할 수 있습니다.", 409);
  }

  const isParticipant =
    match.requesterId === userId || match.receiverId === userId;

  if (!isParticipant) {
    throw new AppError("거래 당사자만 후기를 작성할 수 있습니다.", 403);
  }

  const targetUserId = Number(target_user_id);

  const isTargetValid =
    targetUserId === match.requesterId || targetUserId === match.receiverId;

  if (!isTargetValid) {
    throw new AppError("후기 대상자는 해당 거래 당사자여야 합니다.", 400);
  }

  if (targetUserId === userId) {
    throw new AppError("자기 자신에게 후기를 작성할 수 없습니다.", 400);
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      matchId_writerId: {
        matchId: Number(match_id),
        writerId: userId,
      },
    },
  });

  if (existingReview) {
    throw new AppError("이미 해당 거래에 후기를 작성했습니다.", 409);
  }

  const temperatureChange = review_type === "POSITIVE" ? 5 : -5;

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        matchId: Number(match_id),
        writerId: userId,
        targetUserId,
        reviewType: review_type,
        content,
      },
      select: {
        id: true,
        matchId: true,
        writerId: true,
        targetUserId: true,
        reviewType: true,
        content: true,
        createdAt: true,
      },
    });

    const updatedUser = await tx.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        temperature: {
          increment: temperatureChange,
        },
      },
      select: {
        id: true,
        username: true,
        temperature: true,
      },
    });

    await tx.activity.create({
      data: {
        userId,
        activityType: "REVIEW_CREATED",
        description: `매칭 ID ${match.id}에 대한 후기를 작성했습니다.`,
      },
    });

    return {
      review,
      updatedUser,
      temperatureChange,
    };
  });

  return {
    review_id: result.review.id,
    match_id: result.review.matchId,
    writer_id: result.review.writerId,
    target_user_id: result.review.targetUserId,
    review_type: result.review.reviewType,
    content: result.review.content,
    temperature_change: result.temperatureChange,
    target_user_temperature: result.updatedUser.temperature,
    created_at: result.review.createdAt,
  };
}

module.exports = {
  createReview,
};