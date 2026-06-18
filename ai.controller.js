const aiService = require("../services/ai.service");
const AppError = require("../utils/AppError");

async function analyze(req, res, next) {
  try {
    const { image, mime_type } = req.body;

    if (!image) {
      throw new AppError("분석할 이미지 필요", 400);
    }

    const analysis = await aiService.analyzeImageBase64(
      image,
      mime_type || "image/jpeg"
    );

    const keywords = [
      ...analysis.general_keywords,
      ...analysis.unique_keywords,
    ];

    res.status(200).json({
      success: true,
      message: "이미지 분석 성공",
      data: {
        object_name: analysis.object_name,
        general_keywords: analysis.general_keywords,
        unique_keywords: analysis.unique_keywords,
        description: analysis.description,
        title: analysis.object_name,
        keywords: keywords.join(", "),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyze,
};
