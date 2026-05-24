import systemOverviewRepository from "../../repositories/system-overview.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

class DirectorSystemOverviewService {
  async getOverview(hospitalId, currentUserId) {
    const [patientCount, staffCount, appointmentCount, activeAppointments, completedAppointments, activeSchedules, logs] = await Promise.all([
      systemOverviewRepository.countPatients(hospitalId),
      systemOverviewRepository.countStaff(hospitalId),
      systemOverviewRepository.countAppointments(hospitalId),
      systemOverviewRepository.countActiveAppointments(hospitalId),
      systemOverviewRepository.countCompletedAppointments(hospitalId),
      systemOverviewRepository.countActiveSchedules(hospitalId),
      systemOverviewRepository.findHospitalLogs(hospitalId, 10),
    ]);

    await logsRepository.create({
      user_id: currentUserId,
      action: "view system overview",
      reason: "Director viewed system overview metrics",
    });

    const completionRate = appointmentCount > 0 ? Math.round((completedAppointments / appointmentCount) * 100) : 0;
    const utilization = activeSchedules > 0 ? Math.round((appointmentCount / activeSchedules) * 10) / 10 : 0;

    return {
      statistics: {
        patientCount,
        staffCount,
        appointmentCount,
        activeAppointments,
        completedAppointments,
        activeSchedules,
      },
      metrics: {
        appointmentCompletionRate: completionRate,
        staffUtilization: utilization,
      },
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        reason: log.reason,
        timestamp: log.timestamp,
        user: {
          id: log.user.id,
          username: log.user.username,
          name: log.user.users_profiles?.[0]?.profiles ? `${log.user.users_profiles[0].profiles.first_name || ""} ${log.user.users_profiles[0].profiles.last_name || ""}`.trim() : log.user.username,
        },
      })),
    };
  }
}

export default new DirectorSystemOverviewService();
