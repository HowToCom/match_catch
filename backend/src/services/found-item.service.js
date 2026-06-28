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

async function updateFoundItem(userId, foundItemId, data, file) {
  const foundItem = await prisma.foundItem.findUnique({
    where: { id: Number(foundItemId) },
  });

  if (!foundItem) {
    throw new AppError("존재하지 않는 습득물입니다.", 404);
  }

  if (foundItem.ownerId !== userId) {
    throw new AppError("본인이 등록한 습득물만 수정할 수 있습니다.", 403);
  }

  if (foundItem.status !== "REGISTERED") {
    throw new AppError("매칭 진행 중이거나 인도 완료된 습득물은 수정할 수 없습니다.", 409);
  }

  const updateData = {};

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.found_location !== undefined) {
    if (!data.found_location || !data.found_location.trim()) {
      throw new AppError("습득 장소는 필수입니다.", 400);
    }

    updateData.foundLocation = data.found_location.trim();
  }

  if (data.found_time !== undefined) {
    updateData.foundTime = new Date(data.found_time);
  }

  if (file) {
    updateData.imageUrl = `/uploads/${file.filename}`;
    updateData.aiStatus = "PENDING";
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("수정할 습득물 정보가 없습니다.", 400);
  }

  const updatedFoundItem = await prisma.foundItem.update({
    where: { id: Number(foundItemId) },
    data: updateData,
    select: {
      id: true,
      imageUrl: true,
      description: true,
      foundLocation: true,
      foundTime: true,
      status: true,
      aiStatus: true,
      updatedAt: true,
    },
  });

  return {
    found_item_id: updatedFoundItem.id,
    image_url: updatedFoundItem.imageUrl,
    description: updatedFoundItem.description,
    found_location: updatedFoundItem.foundLocation,
    found_time: updatedFoundItem.foundTime,
    status: updatedFoundItem.status,
    ai_status: updatedFoundItem.aiStatus,
    updated_at: updatedFoundItem.updatedAt,
  };
}

module.exports = {
  createFoundItem,
  updateFoundItem,
  getFoundItems,
  getFoundItemById,
};
