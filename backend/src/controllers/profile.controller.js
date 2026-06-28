const profileService = require("../services/profile.service");

async function getMyProfile(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      message: "프로필 조회에 성공했습니다.",
      data: {
        user_id: req.user.id,
        student_id: req.user.studentId,
        username: req.user.username,
        temperature: req.user.temperature,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const result = await profileService.updateMyProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: "프로필 수정에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyTemperature(req, res, next) {
  try {
    const result = await profileService.getMyTemperature(req.user.id);

    res.status(200).json({
      success: true,
      message: "온도 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyActivities(req, res, next) {
  try {
    const result = await profileService.getMyActivities(req.user.id);

    res.status(200).json({
      success: true,
      message: "활동 내역 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyTemperature,
  getMyActivities,
};