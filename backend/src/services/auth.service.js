const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

async function register({ student_id, username, password }) {
  const existingStudent = await prisma.user.findUnique({
    where: { studentId: student_id },
  });

  if (existingStudent) {
    throw new AppError("이미 가입된 학번입니다.", 409);
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new AppError("이미 사용 중인 아이디입니다.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      studentId: student_id,
      username,
      password: hashedPassword,
    },
    select: {
      id: true,
      studentId: true,
      username: true,
      temperature: true,
      createdAt: true,
    },
  });

  return {
    user_id: user.id,
    student_id: user.studentId,
    username: user.username,
    temperature: user.temperature,
    created_at: user.createdAt,
  };
}

async function login({ username, password }) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new AppError("아이디 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("아이디 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  const accessToken = jwt.sign(
    {
      user_id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

  return {
    access_token: accessToken,
    user_id: user.id,
    username: user.username,
  };
}

module.exports = {
  register,
  login,
};