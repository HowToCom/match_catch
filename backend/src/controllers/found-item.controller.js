const foundItemService = require("../services/found-item.service");
const AppError = require("../utils/AppError");

async function createFoundItem(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError("습득물 이미지는 필수입니다.", 400);
    }

    const { found_location, found_time } = req.body;

    if (!found_location || !found_time) {
      throw new AppError("습득 장소와 습득 시간은 필수입니다.", 400);
    }

    const result = await foundItemService.createFoundItem(
      req.user.id,
      req.body,
      req.file
    );

    res.status(201).json({
      success: true,
      message: "습득물 등록이 완료되었습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function updateFoundItem(req, res, next) {
  try {
    const result = await foundItemService.updateFoundItem(
      req.user.id,
      req.params.found_item_id,
      req.body,
      req.file
    );

    res.status(200).json({
      success: true,
      message: "습득물 수정에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getFoundItems(req, res, next) {
  try {
    const result = await foundItemService.getFoundItems();

    res.status(200).json({
      success: true,
      message: "습득물 목록 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getFoundItemById(req, res, next) {
  try {
    const result = await foundItemService.getFoundItemById(
      req.params.found_item_id
    );

    res.status(200).json({
      success: true,
      message: "습득물 상세 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createFoundItem,
  updateFoundItem,
  getFoundItems,
  getFoundItemById,
};