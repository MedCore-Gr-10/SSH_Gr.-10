import prisma from "../prisma.js";

class LogsRepository {
  async create(data) {
    return prisma.logs.create({ data });
  }

  async findUserLogs(userId, limit = 100) {
    return prisma.logs.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async countUserLogsSince(userId, since) {
    return prisma.logs.count({
      where: {
        user_id: userId,
        timestamp: { gte: since },
      },
    });
  }

  static MY_PATIENTS_ACTION_PREFIXES = [
    "Search patients",
    "View allergies",
    "View insurance",
    "View emergency contacts",
    "View appointments",
    "View patient history",
  ];

  myPatientsActionFilter() {
    return {
      OR: LogsRepository.MY_PATIENTS_ACTION_PREFIXES.map((prefix) => ({
        action: { startsWith: prefix },
      })),
    };
  }

  async findMyPatientsLogs(userId, limit = 200) {
    return prisma.logs.findMany({
      where: {
        user_id: userId,
        ...this.myPatientsActionFilter(),
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async countMyPatientsAccessSince(userId, since) {
    return prisma.logs.count({
      where: {
        user_id: userId,
        timestamp: { gte: since },
        ...this.myPatientsActionFilter(),
      },
    });
  }

  async findAll() {
    return prisma.logs.findMany({
      include: {
        user: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });
  }
}

export default new LogsRepository();