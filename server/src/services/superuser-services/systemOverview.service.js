import prisma from "../../prisma.js";
import userRepository from "../../repositories/user.repository.js";

class SystemOverviewService {
  async getGlobalStats() {
    try {
      const [
        userSummary,
        totalHospitals,
        totalDepartments,
        totalSpecializations,
        totalAppointments,
        totalRequests 
      ] = await Promise.all([
        userRepository.getUserStatsSummary(),
        prisma.hospitals.count(),
        prisma.departments.count(),
        prisma.specializations.count(),
        prisma.appointments_made.count(),
        prisma.requests.count() 
      ]);

      return {
        totalUsers: userSummary.totalUsers || 0,
        activeUsers: userSummary.activeUsers || 0,
        inactiveUsers: userSummary.inactiveUsers || 0,
        superusers: userSummary.superusers || 0,
        directors: userSummary.directors || 0,
        doctors: userSummary.doctors || 0,
        nurses: userSummary.nurses || 0,
        patients: userSummary.patients || 0,
        hospitals: totalHospitals || 0,
        departments: totalDepartments || 0,
        specializations: totalSpecializations || 0,
        totalAppointments: totalAppointments || 0,
        totalRequests: totalRequests || 0 
      };
    } catch (error) {
      console.error("Gabim në SystemOverviewService:", error);
      throw new Error("Gabim gjatë grumbullimit të statistikave: " + error.message);
    }
  }
}

export default new SystemOverviewService();