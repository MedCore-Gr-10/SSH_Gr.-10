import prisma from "../prisma.js";

class AllergiesRepository {

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(data) {
    return prisma.allergies.create({
      data
    });
  }

  async createMany(allergies) {
    return prisma.allergies.createMany({
      data: allergies,
      skipDuplicates: true
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND UNIQUE
  |--------------------------------------------------------------------------
  */

  async findById(id) {
    return prisma.allergies.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            users_profiles: {
              include: {
                profiles: true
              }
            }
          }
        }
      }
    });
  }

  async findPatientAllergy(patientId, allergyName) {
    return prisma.allergies.findFirst({
      where: {
        patient_id: patientId,
        allergy_name: allergyName
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND MANY
  |--------------------------------------------------------------------------
  */

  async findAll() {
    return prisma.allergies.findMany({
      include: {
        users: true
      }
    });
  }

  async findByPatientId(patientId) {
    return prisma.allergies.findMany({
      where: {
        patient_id: patientId
      },
      orderBy: {
        allergy_name: "asc"
      }
    });
  }

  async searchByAllergyName(search) {
    return prisma.allergies.findMany({
      where: {
        allergy_name: {
          contains: search,
          mode: "insensitive"
        }
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  async update(id, data) {
    return prisma.allergies.update({
      where: { id },
      data
    });
  }

  async updateAllergyName(id, allergy_name) {
    return prisma.allergies.update({
      where: { id },
      data: {
        allergy_name
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async delete(id) {
    return prisma.allergies.delete({
      where: { id }
    });
  }

  async deletePatientAllergy(patientId, allergyName) {
    return prisma.allergies.deleteMany({
      where: {
        patient_id: patientId,
        allergy_name: allergyName
      }
    });
  }

  async deleteAllPatientAllergies(patientId) {
    return prisma.allergies.deleteMany({
      where: {
        patient_id: patientId
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | EXISTS / COUNT
  |--------------------------------------------------------------------------
  */

  async exists(patientId, allergyName) {
    const allergy = await prisma.allergies.findFirst({
      where: {
        patient_id: patientId,
        allergy_name: allergyName
      }
    });

    return !!allergy;
  }

  async countPatientAllergies(patientId) {
    return prisma.allergies.count({
      where: {
        patient_id: patientId
      }
    });
  }

}

export default new AllergiesRepository();