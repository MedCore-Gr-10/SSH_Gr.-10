import appointmentsTemplatesRepository from "../../repositories/appointments-templates.repository.js";
import logsRepository from "../../repositories/logs.repository.js";
import prisma from "../../prisma.js";

const normalizeTime = (value) => {
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
};

class DirectorAppointmentsTemplatesService {
  async listTemplates(hospitalId, currentUserId) {
    if (!hospitalId) throw new Error("Hospital ID required");
    const templates = await appointmentsTemplatesRepository.findByHospital(hospitalId);

    await logsRepository.create({
      user_id: currentUserId,
      action: "view appointment templates",
      reason: "Director viewed appointment templates"
    });

    return templates;
  }

  async createTemplate(data, hospitalId, currentUserId) {
    const { staff_id, department_id, day_of_week, start_time, end_time } = data;
    if (!staff_id || !department_id || !day_of_week || !start_time || !end_time) {
      throw new Error("staff_id, department_id, day_of_week, start_time and end_time are required");
    }

    // ensure staff belongs to hospital & department
    const link = await prisma.staff_hospitals_departments.findUnique({
      where: {
        staff_id_hospital_id_department_id: {
          staff_id: staff_id,
          hospital_id: hospitalId,
          department_id: Number(department_id),
        }
      }
    });

    if (!link) throw new Error("Staff not linked to this hospital/department");

    const createData = {
      staff_id,
      hospital_id: hospitalId,
      department_id: Number(department_id),
      day_of_week,
      start_time: normalizeTime(start_time),
      end_time: normalizeTime(end_time),
      active_appointment_template: true,
    };

    const template = await appointmentsTemplatesRepository.create(createData);

    await logsRepository.create({
      user_id: currentUserId,
      action: "create appointment template",
      reason: `Created template for staff ${staff_id}`
    });

    return template;
  }

  async updateTemplate(id, data, hospitalId, currentUserId) {
    const existing = await appointmentsTemplatesRepository.findById(Number(id));
    if (!existing) throw new Error("Template not found");
    if (existing.hospital_id !== hospitalId) throw new Error("Template does not belong to this hospital");

    const updateData = { ...data };
    if (data.start_time) updateData.start_time = normalizeTime(data.start_time);
    if (data.end_time) updateData.end_time = normalizeTime(data.end_time);

    const updated = await appointmentsTemplatesRepository.update(Number(id), updateData);

    await logsRepository.create({ user_id: currentUserId, action: "update appointment template", reason: `Updated template ${id}` });
    return updated;
  }

  async deleteTemplate(id, hospitalId, currentUserId) {
    const existing = await appointmentsTemplatesRepository.findById(Number(id));
    if (!existing) throw new Error("Template not found");
    if (existing.hospital_id !== hospitalId) throw new Error("Template does not belong to this hospital");

    await appointmentsTemplatesRepository.delete(Number(id));

    await logsRepository.create({ user_id: currentUserId, action: "delete appointment template", reason: `Deleted template ${id}` });
    return { id };
  }
}

export default new DirectorAppointmentsTemplatesService();
