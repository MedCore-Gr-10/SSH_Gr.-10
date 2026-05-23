import prisma from "../prisma.js";

class EmergencyContactsRepository {

  async create(data) {
    return prisma.emergency_contacts.create({
      data
    });
  }

  async findProfileContacts(profileId) {
    return prisma.emergency_contacts.findMany({
      where: {
        profile_id: profileId
      },
      orderBy: {
        first_name: "asc"
      }
    });
  }

  async findProfileContactById(profileId, contactId) {
    return prisma.emergency_contacts.findFirst({
      where: {
        id: contactId,
        profile_id: profileId
      }
    });
  }

  async update(id, data) {
    return prisma.emergency_contacts.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.emergency_contacts.delete({
      where: { id }
    });
  }

}

export default new EmergencyContactsRepository();
