const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const aiService = require("./ai.service");

async function createFoundItem(userId, data, file) {
  const { description, found_location, found_time, keywords } = data;

  const imageUrl = `/uploads/${file.filename}`;

  let parsedKeywords = [];

  if (keywords) {
    try {
      parsedKeywords = Array.isArray(keywords) ? keywords : JSON.parse(keywords);
    } catch (err) {
      parsedKeywords = [];
    }
  }

  let aiStatus = parsedKeywords.length > 0 ? "SUCCESS" : "PENDING";
  let finalDescription = description;

  if (parsedKeywords.length === 0) {
    try {
      const analysis = await aiService.analyzeImageFile(
        file.path,
        file.mimetype
      );

      parsedKeywords = [
        ...analysis.general_keywords,
        ...analysis.unique_keywords,
      ];

      if (!finalDescription && analysis.description) {
        finalDescription = analysis.description;
      }

      aiStatus = parsedKeywords.length > 0 ? "SUCCESS" : "FAILED";
    } catch (err) {
      aiStatus = "FAILED";
    }
  }

  const foundItem = await prisma.foundItem.create({
    data: {
      ownerId: userId,
      imageUrl,
      description: finalDescription,
      foundLocation: found_location,
      foundTime: new Date(found_time),
      status: "REGISTERED",
      aiStatus,
    },
    select: {
      id: true,
      imageUrl: true,
      description: true,
      foundLocation: true,
      foundTime: true,
      status: true,
      aiStatus: true,
      createdAt: true,
    },
  });

  if (parsedKeywords.length > 0) {
    await prisma.itemKeyword.createMany({
      data: parsedKeywords.map((keyword) => ({
        ownerType: "FOUND",
        ownerId: foundItem.id,
        keyword,
      })),
    });
  }

  return {
    found_item_id: foundItem.id,
    image_url: foundItem.imageUrl,
    description: foundItem.description,
    found_location: foundItem.foundLocation,
    found_time: foundItem.foundTime,
    status: foundItem.status,
    ai_status: foundItem.aiStatus,
    keywords: parsedKeywords,
    created_at: foundItem.createdAt,
  };
}

async function getFoundItems() {
  const foundItems = await prisma.foundItem.findMany({
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
      aiStatus: true,
      createdAt: true,
    },
  });

  return foundItems.map((item) => ({
    found_item_id: item.id,
    image_url: item.imageUrl,
    description: item.description,
    found_location: item.foundLocation,
    found_time: item.foundTime,
    status: item.status,
    ai_status: item.aiStatus,
    created_at: item.createdAt,
  }));
}

async function getFoundItemById(foundItemId) {
  const foundItem = await prisma.foundItem.findUnique({
    where: {
      id: Number(foundItemId),
    },
    select: {
      id: true,
      ownerId: true,
      imageUrl: true,
      description: true,
      foundLocation: true,
      foundTime: true,
      status: true,
      aiStatus: true,
      createdAt: true,
    },
  });

  if (!foundItem) {
    throw new AppError("존재하지 않는 습득물입니다.", 404);
  }

  return {
    found_item_id: foundItem.id,
    owner_id: foundItem.ownerId,
    image_url: foundItem.imageUrl,
    description: foundItem.description,
    found_location: foundItem.foundLocation,
    found_time: foundItem.foundTime,
    status: foundItem.status,
    ai_status: foundItem.aiStatus,
    created_at: foundItem.createdAt,
  };
}

module.exports = {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
};