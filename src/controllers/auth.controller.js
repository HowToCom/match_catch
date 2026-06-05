const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "로그인에 성공했습니다.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
};