const prisma = require("../config/prisma");

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
  getMyActivities,
};