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

  async findProfileAllergy(profileId, allergyName) {
    return prisma.allergies.findFirst({
      where: {
        profile_id: profileId,
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

  async findByProfileId(profileId) {
    return prisma.allergies.findMany({
      where: {
        profile_id: profileId
      },
      orderBy: {
        allergy_name: "asc"
      }
    });
  }

  async findProfileAllergyById(profileId, allergyId) {
    return prisma.allergies.findFirst({
      where: {
        id: Number(allergyId),
        profile_id: profileId
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

  /*
  |--------------------------------------------------------------------------
  | EXISTS / COUNT
  |--------------------------------------------------------------------------
  */

  async exists(profileId, allergyName) {
    const allergy = await prisma.allergies.findFirst({
      where: {
        profile_id: profileId,
        allergy_name: allergyName
      }
    });

    return !!allergy;
  }

  async countProfileAllergies(profileId) {
    return prisma.allergies.count({
      where: {
        profile_id: profileId
      }
    });
  }

}

export default new AllergiesRepository();
