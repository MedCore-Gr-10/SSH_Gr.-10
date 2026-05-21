import userRepository from "../../repositories/user.repository.js";
import staffScheduleRepository from "../../repositories/staff-working-schedules.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

class DirectorStaffScheduleService {
  normalizeTime(value) {
    if (!value) return null;
    let hour = 0;
    let minute = 0;
    let second = 0;

    if (/^\d{1,2}:\d{2}$/.test(value)) {
      [hour, minute] = value.split(":").map(Number);
    } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
      [hour, minute, second] = value.split(":").map(Number);
    } else {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid time format");
      }
      hour = parsed.getUTCHours();
      minute = parsed.getUTCMinutes();
      second = parsed.getUTCSeconds();
    }

    const isoString = new Date(Date.UTC(1970, 0, 1, hour, minute, second)).toISOString();
    return isoString;
  }

  async getHospitalSchedules(hospitalId, currentUserId) {
    if (!hospitalId) {
      throw new Error("Hospital ID is required to list schedules");
    }

    const schedules = await staffScheduleRepository.findByHospital(hospitalId);

    await logsRepository.create({
      user_id: currentUserId,
      action: "view staff schedules",
      reason: "Director viewed staff working schedules",
    });

    return schedules;
  }

  async getRelevantSchedules(userId, hospitalId, role, currentUserId) {
    if (!hospitalId) {
      throw new Error("Hospital ID is required to list schedules");
    }

    if (role === "director") {
      return this.getHospitalSchedules(hospitalId, currentUserId);
    }

    if (role === "doctor" || role === "nurse") {
      const schedules = await staffScheduleRepository.findStaffSchedule(userId, hospitalId);

      await logsRepository.create({
        user_id: currentUserId,
        action: "view own schedule",
        reason: "Staff member viewed own working schedule",
      });

      return schedules;
    }

    throw new Error("Insufficient permissions to view schedules");
  }

  async createSchedule(data, hospitalId, currentUserId) {
    const { staff_id, department_id, day_of_week, start_time, end_time, active_schedule } = data;

    if (!staff_id || !department_id || !day_of_week || !start_time || !end_time) {
      throw new Error("Staff, department, day of week, and shift times are required");
    }

    const staff = await userRepository.findById(staff_id);
    if (!staff) {
      throw new Error("Staff member not found");
    }

    const assignment = staff.staff_hospitals_departments?.find(
      (entry) => entry.hospital_id === hospitalId && entry.department_id === Number(department_id)
    );
    if (!assignment) {
      throw new Error("Staff member is not assigned to this hospital and department");
    }

    const schedule = await staffScheduleRepository.create({
      staff_id,
      hospital_id: hospitalId,
      department_id: Number(department_id),
      day_of_week,
      start_time: this.normalizeTime(start_time),
      end_time: this.normalizeTime(end_time),
      active_schedule: active_schedule !== false,
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "create staff schedule",
      reason: "Director created a staff shift",
    });

    return staffScheduleRepository.findById(schedule.id);
  }

  async updateSchedule(id, data, hospitalId, currentUserId) {
    const schedule = await staffScheduleRepository.findById(Number(id));
    if (!schedule) {
      throw new Error("Schedule slot not found");
    }

    if (schedule.hospital_id !== hospitalId) {
      throw new Error("Schedule slot does not belong to this hospital");
    }

    if (data.staff_id && data.staff_id !== schedule.staff_id) {
      const staff = await userRepository.findById(data.staff_id);
      if (!staff) {
        throw new Error("Staff member not found");
      }
      const assignment = staff.staff_hospitals_departments?.find(
        (entry) => entry.hospital_id === hospitalId && entry.department_id === Number(data.department_id || schedule.department_id)
      );
      if (!assignment) {
        throw new Error("Staff member is not assigned to this hospital and department");
      }
    }

    const updateData = {};
    if (data.staff_id) updateData.staff_id = data.staff_id;
    if (data.department_id) updateData.department_id = Number(data.department_id);
    if (data.day_of_week) updateData.day_of_week = data.day_of_week;
    if (data.start_time) updateData.start_time = this.normalizeTime(data.start_time);
    if (data.end_time) updateData.end_time = this.normalizeTime(data.end_time);
    if (typeof data.active_schedule !== "undefined") updateData.active_schedule = data.active_schedule;

    await staffScheduleRepository.update(Number(id), updateData);

    await logsRepository.create({
      user_id: currentUserId,
      action: "update staff schedule",
      reason: "Director updated a staff shift",
    });

    return staffScheduleRepository.findById(Number(id));
  }

  async deleteSchedule(id, hospitalId, currentUserId) {
    const schedule = await staffScheduleRepository.findById(Number(id));
    if (!schedule) {
      throw new Error("Schedule slot not found");
    }

    if (schedule.hospital_id !== hospitalId) {
      throw new Error("Schedule slot does not belong to this hospital");
    }

    await staffScheduleRepository.delete(Number(id));

    await logsRepository.create({
      user_id: currentUserId,
      action: "delete staff schedule",
      reason: "Director deleted a staff shift",
    });

    return { id };
  }
}

export default new DirectorStaffScheduleService();
