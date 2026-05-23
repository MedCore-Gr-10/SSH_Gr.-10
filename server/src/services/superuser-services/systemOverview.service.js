import prisma from "../../prisma.js";
import userRepository from "../../repositories/user.repository.js";
import hospitalRepository from "../../repositories/hospitals.repository.js";
import departmentsRepository from "../../repositories/departments.repository.js";
import specializationsRepository from "../../repositories/specializations.repository.js"; // Sigurohu që emri i skedarit përputhet (specialties.repository.js ose specializations.repository.js)

class SystemOverviewService {
  async getGlobalStats() {
    try {
      // 1. Marrim përmbledhjen e përdoruesve sipas roleve dhe statuseve
      const userSummary = await userRepository.getUserStatsSummary();

      // 2. Numërojmë spitalet
      const totalHospitals = await prisma.hospitals.count();

      // 3. Numërojmë departamentet globale nga tabela e departamenteve
      const totalDepartments = await prisma.departments.count();

      // 4. Numërojmë specializimet globale nga tabela e specializimeve
      const totalSpecializations = await prisma.specializations.count();

      // 5. Bashkojmë të gjitha të dhënat në një strukturë të vetme për Front-end
      return {
        totalUsers: userSummary.totalUsers || 0,
        activeUsers: userSummary.activeUsers || 0,
        inactiveUsers: userSummary.inactiveUsers || 0,
        superusers: userSummary.superusers || 0,
        directors: userSummary.directors || 0,
        doctors: userSummary.doctors || 0,
        nurses: userSummary.nurses || 0,
        patients: userSummary.patients || 0,
        hospitals: totalHospitals,
        departments: totalDepartments,      // 🌟 SHTUAR
        specializations: totalSpecializations // 🌟 SHTUAR
      };
    } catch (error) {
      console.error("Gabim në SystemOverviewService:", error);
      throw new Error("Gabim gjatë grumbullimit të statistikave: " + error.message);
    }
  }
}

export default new SystemOverviewService();