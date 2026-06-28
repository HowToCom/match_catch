const lostItemService = require("../services/lost-item.service");
const AppError = require("../utils/AppError");

async function createLostItem(req, res, next) {
  try {
    const { title, keywords, lost_location, lost_time } = req.body;

    if (!title) {
      throw new AppError("분실물 제목은 필수입니다.", 400);
    }

    if (!keywords) {
      throw new AppError("분실물 특징 키워드는 필수입니다.", 400);
    }

    if (!lost_location || !lost_time) {
      throw new AppError("분실 장소와 분실 시간은 필수입니다.", 400);
    }

    const result = await lostItemService.createLostItem(
      req.user.id,
      req.body,
      req.file
    );

    res.status(201).json({
      success: true,
      message: "분실물 등록이 완료되었습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function updateLostItem(req, res, next) {
  try {
    const result = await lostItemService.updateLostItem(
      req.user.id,
      req.params.lost_item_id,
      req.body,
      req.file
    );

    res.status(200).json({
      success: true,
      message: "분실물 수정에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getLostItems(req, res, next) {
  try {
    const result = await lostItemService.getLostItems();

    res.status(200).json({
      success: true,
      message: "분실물 목록 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getLostItemById(req, res, next) {
  try {
    const result = await lostItemService.getLostItemById(
      req.params.lost_item_id
    );

    res.status(200).json({
      success: true,
      message: "분실물 상세 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
async function getSimilarFoundItems(req, res, next) {
  try {
    const result = await lostItemService.getSimilarFoundItems(
      req.user.id,
      req.params.lost_item_id
    );

    res.status(200).json({
      success: true,
      message: "유사 습득물 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createLostItem,
  updateLostItem,
  getLostItems,
  getLostItemById,
  getSimilarFoundItems,
};