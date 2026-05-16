import prisma from "../prisma.js";

class InsuranceRepository {

  async create(data) {
    return prisma.insurance.create({
      data
    });
  }

  async findPatientInsurance(patientId) {
    return prisma.insurance.findMany({
      where: {
        patient_id: patientId
      }
    });
  }

  async update(id, data) {
    return prisma.insurance.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.insurance.delete({
      where: { id }
    });
  }

}

export default new InsuranceRepository();