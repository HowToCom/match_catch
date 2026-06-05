const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

async function auth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError("인증 토큰이 없습니다.", 401);
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      throw new AppError("토큰 형식이 올바르지 않습니다.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
      select: {
        id: true,
        studentId: true,
        username: true,
        temperature: true,
      },
    });

    if (!user) {
      throw new AppError("존재하지 않는 사용자입니다.", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new AppError("유효하지 않은 토큰입니다.", 401));
    }

    next(err);
  }
}

module.exports = auth;