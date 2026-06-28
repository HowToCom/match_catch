const matchService = require("../services/match.service");

async function createMatchRequest(req, res, next) {
  try {
    const result = await matchService.createMatchRequest(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "매칭 요청이 완료되었습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyMatches(req, res, next) {
  try {
    const result = await matchService.getMyMatches(req.user.id);

    res.status(200).json({
      success: true,
      message: "매칭 목록 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getMatchById(req, res, next) {
  try {
    const result = await matchService.getMatchById(
      req.user.id,
      req.params.match_id
    );

    res.status(200).json({
      success: true,
      message: "매칭 상세 조회에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function acceptMatchRequest(req, res, next) {
  try {
    const result = await matchService.acceptMatchRequest(
      req.user.id,
      req.params.match_id
    );

    res.status(200).json({
      success: true,
      message: "매칭 요청을 수락했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
async function rejectMatchRequest(req, res, next) {
  try {
    const result = await matchService.rejectMatchRequest(
      req.user.id,
      req.params.match_id
    );

    res.status(200).json({
      success: true,
      message: "매칭 요청을 거절했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function deliverMatch(req, res, next) {
  try {
    const result = await matchService.deliverMatch(
      req.user.id,
      req.params.match_id
    );

    res.status(200).json({
      success: true,
      message: "인도 완료 처리되었습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createMatchRequest,
  getMyMatches,
  getMatchById,
  acceptMatchRequest,
  rejectMatchRequest,
  deliverMatch,
};