function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "서버 내부 오류가 발생했습니다.",
  });
}

module.exports = errorHandler;