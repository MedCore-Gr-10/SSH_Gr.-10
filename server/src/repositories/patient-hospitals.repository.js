import prisma from "../prisma.js";

class PatientHospitalsRepository {
  async findAllHospitals() {
    return prisma.hospitals.findMany({
      orderBy: {
        hospital_name: "asc",
      },
    });
  }

  async findPatientHospitals(patientId) {
    return prisma.patients_hospitals.findMany({
      where: {
        patient_id: patientId,
      },
      include: {
        hospitals: true,
      },
    });
  }

  async findHospitalsByIds(hospitalIds) {
    return prisma.hospitals.findMany({
      where: {
        id: {
          in: hospitalIds,
        },
      },
      select: {
        id: true,
      },
    });
  }

  async replacePatientHospitals(patientId, hospitalIds) {
    return prisma.$transaction(async (tx) => {
      await tx.patients_hospitals.deleteMany({
        where: {
          patient_id: patientId,
        },
      });

      if (hospitalIds.length) {
        await tx.patients_hospitals.createMany({
          data: hospitalIds.map((hospitalId) => ({
            patient_id: patientId,
            hospital_id: hospitalId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.patients_hospitals.findMany({
        where: {
          patient_id: patientId,
        },
        include: {
          hospitals: true,
        },
      });
    });
  }
}

export default new PatientHospitalsRepository();
