import requestsRepository from "../../repositories/requests.repository.js";
import logsRepository from "../../repositories/logs.repository.js";
import prisma from "../../prisma.js";

class DirectorRequestsService {
  async createRequest(data, currentUserId) {
    const { message, receiver_id } = data;
    if (!message) throw new Error("Message is required");

    let targetReceiver = receiver_id;

    if (!targetReceiver) {
      // find a superuser/sysadmin to receive request
      const superuser = await prisma.users.findFirst({
        where: {
          roles: { role_name: { in: ["superuser", "SUPERUSER", "admin", "ADMIN"] } }
        }
      });
      if (!superuser) throw new Error("No system administrator found to receive the request");
      targetReceiver = superuser.id;
    }

    const created = await requestsRepository.create({
      sender_id: currentUserId,
      receiver_id: targetReceiver,
      message,
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "create_request",
      reason: `Created request to ${targetReceiver}`,
    });

    return created;
  }

  async getRequestsHistory(currentUserId) {
    // return both sent and received for the current user
    const records = await prisma.requests.findMany({
      where: {
        OR: [
          { sender_id: currentUserId },
          { receiver_id: currentUserId }
        ]
      },
      include: {
        // include basic user info
        sender: {
          select: { id: true, username: true }
        },
        // receiver relation not named; use raw include via users relation names
        receiver: {
          select: { id: true, username: true }
        }
      },
      orderBy: { created_at: "desc" }
    });

    return records;
  }
}

export default new DirectorRequestsService();
