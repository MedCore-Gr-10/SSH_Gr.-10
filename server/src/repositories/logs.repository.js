import prisma from "../prisma.js";

class LogsRepository {

  async create(data) {
    return prisma.logs.create({
      data
    });
  }

  async findUserLogs(userId) {
    return prisma.logs.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        timestamp: "desc"
      }
    });
  }

}

export default new LogsRepository();