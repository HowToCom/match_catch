const bcrypt = require("bcrypt");

const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

async function updateMyProfile(userId, data) {
  const { username, student_id, password } = data;

  const updateData = {};

  if (username && username.trim()) {
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUsername && existingUsername.id !== userId) {
      throw new AppError("이미 사용 중인 아이디입니다.", 409);
    }

    updateData.username = username.trim();
  }

  if (student_id && student_id.trim()) {
    const existingStudent = await prisma.user.findUnique({
      where: { studentId: student_id.trim() },
    });

    if (existingStudent && existingStudent.id !== userId) {
      throw new AppError("이미 가입된 학번입니다.", 409);
    }

    updateData.studentId = student_id.trim();
  }

  if (password && password.trim()) {
    updateData.password = await bcrypt.hash(password.trim(), 10);
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("수정할 프로필 정보가 없습니다.", 400);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      studentId: true,
      username: true,
      temperature: true,
      updatedAt: true,
    },
  });

  return {
    user_id: user.id,
    student_id: user.studentId,
    username: user.username,
    temperature: user.temperature,
    updated_at: user.updatedAt,
  };
}

async function getMyTemperature(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      temperature: true,
    },
  });

  if (!user) {
    throw new AppError("존재하지 않는 사용자입니다.", 404);
  }

  return {
    user_id: user.id,
    temperature: user.temperature,
  };
}

async function getMyActivities(userId) {
  const activities = await prisma.activity.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      activityType: true,
      description: true,
      createdAt: true,
    },
  });

  return activities.map((activity) => ({
    activity_id: activity.id,
    activity_type: activity.activityType,
    description: activity.description,
    created_at: activity.createdAt,
  }));
}

module.exports = {
  updateMyProfile,
  getMyTemperature,
  getMyActivities,
};
