import appointmentTemplatesService from "../../services/doctor-services/appointmentTemplates.service.js";
import slotGeneratorService from "../../services/doctor-services/slotGenerator.service.js";
import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";
import appointmentsMadeRepository from "../../repositories/appointments-made.repository.js";
import diagnosesRepository from "../../repositories/diagnoses.repository.js";
import prescriptionsRepository from "../../repositories/prescriptions.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

class DoctorAppointmentTemplatesController {
  async getAssignments(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;

      if (!hospitalId) {
        return res.status(400).json({ error: "Hospital ID is required" });
      }

      const assignments = await appointmentTemplatesService.getDoctorAssignments(
        doctorId,
        hospitalId
      );

      await logsRepository.create({
        user_id: doctorId,
        action: "view doctor assignments",
        reason: "Doctor viewed hospital and department assignments",
      });

      res.status(200).json({ success: true, data: assignments });
    } catch (err) {
      next(err);
    }
  }

  async getTemplates(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;

      if (!hospitalId) {
        return res.status(400).json({ error: "Hospital ID is required" });
      }

      const templates = await appointmentTemplatesService.getTemplates(doctorId, hospitalId);
      await logsRepository.create({
        user_id: doctorId,
        action: "view doctor appointment templates",
        reason: "Doctor viewed appointment templates",
      });
      res.status(200).json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  }

  async getTemplatesByDay(req, res, next) {
    try {
      const { day } = req.params;
      const doctorId = req.user.user_id;

      const templates = await appointmentTemplatesService.getTemplatesByDay(doctorId, day);
      await logsRepository.create({
        user_id: doctorId,
        action: "view doctor appointment templates by day",
        reason: `Doctor viewed appointment templates for ${day}`,
      });
      res.status(200).json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  }

  async getTemplateSummary(req, res, next) {
    try {
      const doctorId = req.user.user_id;

      const summary = await appointmentTemplatesService.getTemplateSummary(doctorId);
      await logsRepository.create({
        user_id: doctorId,
        action: "view doctor appointment template summary",
        reason: "Doctor viewed appointment template summary",
      });
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }


  async createTemplate(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;
      const departmentId = req.query.department_id ?? req.body.department_id;

      if (!hospitalId) {
        return res.status(400).json({ error: "Hospital ID is required" });
      }

      const template = await appointmentTemplatesService.createTemplate(
        req.body,
        doctorId,
        hospitalId,
        departmentId ? Number(departmentId) : null,
        doctorId
      );

      res.status(201).json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  }

  
  async updateTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;

      const template = await appointmentTemplatesService.updateTemplate(
        Number(id),
        req.body,
        doctorId,
        hospitalId,
        doctorId
      );

      res.status(200).json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  }

  
  async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;

      const result = await appointmentTemplatesService.deleteTemplate(
        Number(id),
        doctorId,
        hospitalId,
        doctorId
      );

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}


class DoctorAppointmentSlotsController {
  doctorOwnsAppointment(appointment, doctorId) {
    const slot = appointment?.appointments_booking_slots;
    const template = slot?.appointments_templates;
    return slot?.doctor_id === doctorId || template?.staff_id === doctorId;
  }

  patientDisplayName(patient) {
    if (!patient) return null;

    const profile = patient.users_profiles?.[0]?.profiles;
    const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();

    return fullName || patient.username || null;
  }

  withPatientDisplayNames(slots) {
    return slots.map((slot) => ({
      ...slot,
      appointments_made: (slot.appointments_made || []).map((appointment) => ({
        ...appointment,
        patient_name: this.patientDisplayName(appointment.users),
      })),
    }));
  }


  async getSlots(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const { date } = req.query;

      const slots = await appointmentsBookingSlotsRepository.findDoctorSlots(
        doctorId,
        date ? new Date(date) : null
      );
      const slotsWithPatientNames = this.withPatientDisplayNames(slots);

      await logsRepository.create({
        user_id: doctorId,
        action: "view doctor appointment slots",
        reason: date
          ? `Doctor viewed appointment slots for ${date}`
          : "Doctor viewed appointment slots",
      });

      res.status(200).json({ success: true, data: slotsWithPatientNames });
    } catch (err) {
      next(err);
    }
  }

 
  async getAvailableSlots(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" });
      }

      const slots = await appointmentsBookingSlotsRepository.findAvailableDoctorSlots(
        doctorId,
        new Date(date)
      );

      await logsRepository.create({
        user_id: doctorId,
        action: "view available doctor appointment slots",
        reason: `Doctor viewed available appointment slots for ${date}`,
      });

      res.status(200).json({ success: true, data: slots });
    } catch (err) {
      next(err);
    }
  }

  async getSlot(req, res, next) {
    try {
      const { id } = req.params;
      const slot = await appointmentsBookingSlotsRepository.findById(Number(id));

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      if (slot.doctor_id !== req.user.user_id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await logsRepository.create({
        user_id: req.user.user_id,
        action: "view doctor appointment slot",
        reason: `Doctor viewed appointment slot ${id}`,
      });

      res.status(200).json({ success: true, data: slot });
    } catch (err) {
      next(err);
    }
  }

  async getGenerationStatus(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const status = await slotGeneratorService.getGenerationStatus(doctorId);

      await logsRepository.create({
        user_id: doctorId,
        action: "view doctor slot generation status",
        reason: "Doctor viewed appointment slot generation status",
      });

      res.status(200).json({ success: true, data: status });
    } catch (err) {
      next(err);
    }
  }

  async generateWeeklySlots(req, res, next) {
    try {
      const doctorId = req.user.user_id;

      const result = await slotGeneratorService.generateWeeklySlots(
        doctorId,
        new Date(),
        doctorId
      );

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async generateSlotsForRange(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const { from_date, to_date } = req.body;

      if (!from_date || !to_date) {
        return res.status(400).json({ error: "from_date and to_date are required" });
      }

      const result = await slotGeneratorService.generateSlotsForDateRange(
        doctorId,
        new Date(from_date),
        new Date(to_date),
        doctorId
      );

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async generateSlotsForTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.body;

      if (!start_date || !end_date) {
        return res.status(400).json({ error: "start_date and end_date are required" });
      }

      const result = await slotGeneratorService.generateSlotsForTemplate(
        Number(id),
        new Date(start_date),
        new Date(end_date),
        req.user.user_id
      );

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }


  async deactivateSlot(req, res, next) {
    try {
      const { id } = req.params;
      const slot = await appointmentsBookingSlotsRepository.findById(Number(id));

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      if (slot.doctor_id !== req.user.user_id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const isBooked = await appointmentsBookingSlotsRepository.isBooked(Number(id));
      if (isBooked) {
        return res.status(400).json({ error: "Cannot deactivate a booked slot" });
      }

      const deactivated = await appointmentsBookingSlotsRepository.deactivate(Number(id));
      res.status(200).json({ success: true, data: deactivated });
    } catch (err) {
      next(err);
    }
  }

  async markAppointmentComplete(req, res, next) {
    try {
      const appointmentId = Number(req.params.appointmentId);
      if (!Number.isInteger(appointmentId)) {
        return res.status(400).json({ error: "Invalid appointment" });
      }

      const appointment = await appointmentsMadeRepository.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      if (!this.doctorOwnsAppointment(appointment, req.user.user_id)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (appointment.appointment_is_complete === true) {
        return res.status(400).json({ error: "Appointment is already complete" });
      }

      const updated = await appointmentsMadeRepository.update(appointmentId, {
        appointment_is_complete: true,
      });

      await logsRepository.create({
        user_id: req.user.user_id,
        action: "complete appointment",
        reason: `Doctor marked appointment ${appointmentId} as complete`,
      });

      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async saveAppointmentRecord(req, res, next) {
    try {
      const appointmentId = Number(req.params.appointmentId);
      if (!Number.isInteger(appointmentId)) {
        return res.status(400).json({ error: "Invalid appointment" });
      }

      const appointment = await appointmentsMadeRepository.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      if (!this.doctorOwnsAppointment(appointment, req.user.user_id)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (appointment.appointment_is_complete === true) {
        return res.status(400).json({ error: "Appointment is already complete" });
      }

      const description = String(req.body.description || "").trim();
      const medicationName = String(req.body.medicationName || "").trim();
      const dosage = String(req.body.dosage || "").trim();
      const instructions = String(req.body.prescription || "").trim();

      if (!description) {
        return res.status(400).json({ error: "Description is required" });
      }

      if ((dosage || instructions) && !medicationName) {
        return res.status(400).json({ error: "Medication name is required for a prescription" });
      }

      const diagnosis = await diagnosesRepository.create({
        appointment_made_id: appointmentId,
        diagnosis: description,
      });

      const prescription = medicationName
        ? await prescriptionsRepository.create({
            appointment_made_id: appointmentId,
            medication_name: medicationName,
            dosage: dosage || null,
            instructions: instructions || null,
          })
        : null;

      const updated = await appointmentsMadeRepository.update(appointmentId, {
        appointment_is_complete: true,
      });

      await logsRepository.create({
        user_id: req.user.user_id,
        action: "save appointment record",
        reason: `Doctor saved record for appointment ${appointmentId}`,
      });

      res.status(201).json({
        success: true,
        data: {
          appointment: updated,
          diagnosis,
          prescription,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export { DoctorAppointmentTemplatesController, DoctorAppointmentSlotsController };
