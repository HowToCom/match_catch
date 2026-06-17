const reviewService = require("../services/review.service");

async function createReview(req, res, next) {
  try {
    const result = await reviewService.createReview(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "후기 작성이 완료되었습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReview,
};