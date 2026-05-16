import prisma from "../prisma.js";

class RequestsRepository {

  async create(data) {
    return prisma.requests.create({
      data
    });
  }

  async findSent(senderId) {
    return prisma.requests.findMany({
      where: {
        sender_id: senderId
      }
    });
  }

  async findReceived(receiverId) {
    return prisma.requests.findMany({
      where: {
        receiver_id: receiverId
      }
    });
  }

}

export default new RequestsRepository();