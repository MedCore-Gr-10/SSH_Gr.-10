import prisma from "../prisma.js";

class EmergencyContactsRepository {

  async create(data) {
    return prisma.emergency_contacts.create({
      data
    });
  }

  async findPatientContacts(patientId) {
    return prisma.emergency_contacts.findMany({
      where: {
        patient_id: patientId
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