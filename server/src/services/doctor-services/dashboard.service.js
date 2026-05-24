import appointmentsMadeRepository from "../../repositories/appointments-made.repository.js";
import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";
import cacheService from "../cache.service.js";

class DoctorDashboardService {
  async getDashboard(doctorId) {
    const cacheKey = `doctor_dashboard:${doctorId}`;

    const cached = await cacheService.getJson(cacheKey);
    if (cached) return cached;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const [
      patients,
      todaySlots,
      availableToday,
      generationStatus,
      allSlots,
    ] = await Promise.all([
      appointmentsMadeRepository.findDoctorPatients(doctorId),

      appointmentsBookingSlotsRepository.findDoctorSlots(doctorId, today),

      appointmentsBookingSlotsRepository.findAvailableDoctorSlots(
        doctorId,
        today
      ),

      // reuse your existing service via repository dependency if needed
      Promise.resolve(null),

      appointmentsBookingSlotsRepository.findDoctorSlots(doctorId, null),
    ]);

    const todayAppointments = todaySlots.filter(
      (s) => s.appointments_made?.length > 0
    );

    const upcomingWeek = allSlots
      .filter((s) => {
        if (!s.appointment_date) return false;
        const d = new Date(s.appointment_date);
        const diff = (d - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      })
      .filter((s) => s.appointments_made?.length > 0);

    const recentPatients = patients
      .sort(
        (a, b) =>
          new Date(b.last_appointment_date || 0) -
          new Date(a.last_appointment_date || 0)
      )
      .slice(0, 5);

    const dashboard = {
      stats: {
        todayAppointments: todayAppointments.length,
        freeSlotsToday: availableToday.length,
        totalPatients: patients.length,
        upcomingWeekAppointments: upcomingWeek.length,
      },

      todaySchedule: todaySlots,

      upcomingAppointments: upcomingWeek.slice(0, 10),

      recentPatients,

      alerts: this.buildAlerts({
        todayAppointments,
        availableToday,
        patients,
        todaySlots,
      }),
    };

    await cacheService.setJson(cacheKey, dashboard, 60); // 1 min cache

    return dashboard;
  }

  buildAlerts({ todayAppointments, availableToday, todaySlots }) {
    const alerts = [];

    if (availableToday.length === 0) {
      alerts.push({
        type: "warning",
        message: "No available slots today",
      });
    }

    if (todayAppointments.length > 20) {
      alerts.push({
        type: "warning",
        message: "High workload today",
      });
    }

    const bookedRatio =
      todaySlots.length > 0
        ? todayAppointments.length / todaySlots.length
        : 0;

    if (bookedRatio > 0.9) {
      alerts.push({
        type: "critical",
        message: "Almost fully booked today",
      });
    }

    return alerts;
  }
}

export default new DoctorDashboardService();