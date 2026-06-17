const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

async function createLostItem(userId, data, file) {
  const {
    title,
    description,
    keywords,
    lost_location,
    lost_time,
  } = data;

  if (!title) {
    throw new AppError("분실물 제목은 필수입니다.", 400);
  }

  if (!keywords) {
    throw new AppError("분실물 특징 키워드는 필수입니다.", 400);
  }

  let parsedKeywords;

  try {
    parsedKeywords = Array.isArray(keywords) ? keywords : JSON.parse(keywords);
  } catch (err) {
    throw new AppError("keywords는 JSON 배열 형식이어야 합니다.", 400);
  }

  if (!Array.isArray(parsedKeywords) || parsedKeywords.length === 0) {
    throw new AppError("분실물 특징 키워드는 1개 이상 필요합니다.", 400);
  }

  const imageUrl = file ? `/uploads/${file.filename}` : null;

  const lostItem = await prisma.lostItem.create({
    data: {
      ownerId: userId,
      title,
      description,
      imageUrl,
      lostLocation: lost_location,
      lostTime: new Date(lost_time),
      status: "REGISTERED",
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      lostLocation: true,
      lostTime: true,
      status: true,
      createdAt: true,
    },
  });

  await prisma.itemKeyword.createMany({
    data: parsedKeywords.map((keyword) => ({
      ownerType: "LOST",
      ownerId: lostItem.id,
      keyword,
    })),
  });

  return {
    lost_item_id: lostItem.id,
    title: lostItem.title,
    description: lostItem.description,
    image_url: lostItem.imageUrl,
    lost_location: lostItem.lostLocation,
    lost_time: lostItem.lostTime,
    status: lostItem.status,
    keywords: parsedKeywords,
    created_at: lostItem.createdAt,
  };
}

async function getLostItems() {
  const lostItems = await prisma.lostItem.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      lostLocation: true,
      lostTime: true,
      status: true,
      createdAt: true,
    },
  });

  return lostItems.map((item) => ({
    lost_item_id: item.id,
    title: item.title,
    description: item.description,
    image_url: item.imageUrl,
    lost_location: item.lostLocation,
    lost_time: item.lostTime,
    status: item.status,
    created_at: item.createdAt,
  }));
}

async function getLostItemById(lostItemId) {
  const lostItem = await prisma.lostItem.findUnique({
    where: {
      id: Number(lostItemId),
    },
    select: {
      id: true,
      ownerId: true,
      title: true,
      description: true,
      imageUrl: true,
      lostLocation: true,
      lostTime: true,
      status: true,
      createdAt: true,
    },
  });

  if (!lostItem) {
    throw new AppError("존재하지 않는 분실물입니다.", 404);
  }

  const keywords = await prisma.itemKeyword.findMany({
    where: {
      ownerType: "LOST",
      ownerId: lostItem.id,
    },
    select: {
      keyword: true,
    },
  });

  return {
    lost_item_id: lostItem.id,
    owner_id: lostItem.ownerId,
    title: lostItem.title,
    description: lostItem.description,
    image_url: lostItem.imageUrl,
    lost_location: lostItem.lostLocation,
    lost_time: lostItem.lostTime,
    status: lostItem.status,
    keywords: keywords.map((item) => item.keyword),
    created_at: lostItem.createdAt,
  };
}
async function getSimilarFoundItems(userId, lostItemId) {
  const lostItem = await prisma.lostItem.findUnique({
    where: {
      id: Number(lostItemId),
    },
  });

  if (!lostItem) {
    throw new AppError("존재하지 않는 분실물입니다.", 404);
  }

  if (lostItem.ownerId !== userId) {
    throw new AppError("권한 없는 조회 요청입니다.", 403);
  }

  const lostKeywords = await prisma.itemKeyword.findMany({
    where: {
      ownerType: "LOST",
      ownerId: lostItem.id,
    },
    select: {
      keyword: true,
    },
  });

  const lostKeywordList = lostKeywords.map((item) =>
    item.keyword.trim().toLowerCase()
  );

  const foundItems = await prisma.foundItem.findMany({
    where: {
      status: "REGISTERED",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      imageUrl: true,
      description: true,
      foundLocation: true,
      foundTime: true,
      status: true,
      createdAt: true,
    },
  });

  const results = [];

  for (const foundItem of foundItems) {
    const foundKeywords = await prisma.itemKeyword.findMany({
      where: {
        ownerType: "FOUND",
        ownerId: foundItem.id,
      },
      select: {
        keyword: true,
      },
    });

    const foundKeywordList = foundKeywords.map((item) =>
      item.keyword.trim().toLowerCase()
    );

    const intersection = lostKeywordList.filter((keyword) =>
      foundKeywordList.includes(keyword)
    );

    const union = Array.from(new Set([...lostKeywordList, ...foundKeywordList]));

    const similarityScore =
      union.length === 0 ? 0 : intersection.length / union.length;

    results.push({
      found_item_id: foundItem.id,
      image_url: foundItem.imageUrl,
      description: foundItem.description,
      found_location: foundItem.foundLocation,
      found_time: foundItem.foundTime,
      status: foundItem.status,
      similarity_score: Number(similarityScore.toFixed(2)),
      matched_keywords: intersection,
    });
  }

  return results
    .filter((item) => item.similarity_score > 0)
    .sort((a, b) => b.similarity_score - a.similarity_score);
}

module.exports = {
  createLostItem,
  getLostItems,
  getLostItemById,
  getSimilarFoundItems,
};