import prisma from "../prisma.js";

/**
 * Repository for managing appointment booking slots (actual dated slots)
 * These are generated from appointment templates
 */
class AppointmentsBookingSlotsRepository {

  /**
   * Create a single booking slot
   * @param {Object} data - Slot data with doctor_id, appointment_template_id, appointment_date, start_time, end_time
   * @returns {Promise<Object>} Created slot
   */
  async create(data) {
    return prisma.appointments_booking_slots.create({
      data,
      include: {
        appointments_templates: true,
        users: true
      }
    });
  }

  /**
   * Bulk create multiple slots efficiently
   * @param {Array} slots - Array of slot objects
   * @returns {Promise<number>} Count of created slots
   */
  async createBulk(slots) {
    return prisma.appointments_booking_slots.createMany({
      data: slots,
      skipDuplicates: true // Skip if unique constraint already exists
    });
  }

  /**
   * Find slot by ID with full relations
   * @param {number} id - Slot ID
   * @returns {Promise<Object>} Slot with relations
   */
  async findById(id) {
    return prisma.appointments_booking_slots.findUnique({
      where: { id },
      include: {
        appointments_templates: true,
        appointments_made: true,
        users: {
          include: {
            users_profiles: { include: { profiles: true } },
            roles: true
          }
        }
      }
    });
  }

  /**
   * Find all slots for a doctor (optionally filtered by date)
   * @param {string} doctorId - Doctor UUID
   * @param {Date} date - Optional specific date
   * @returns {Promise<Array>} Doctor's slots
   */
  async findDoctorSlots(doctorId, date = null) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        doctor_id: doctorId,
        active_appointment_booking_slot: true,
        ...(date && { appointment_date: date })
      },
      include: {
        appointments_templates: true,
        appointments_made: true
      },
      orderBy: [
        { appointment_date: "asc" },
        { slot_start_time: "asc" }
      ]
    });
  }

  /**
   * Find all slots for a doctor on a specific date
   * @param {string} doctorId - Doctor UUID
   * @param {Date} date - Appointment date
   * @returns {Promise<Array>} Slots on that date
   */
  async findDoctorSlotsByDate(doctorId, date) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: date,
        active_appointment_booking_slot: true
      },
      orderBy: { slot_start_time: "asc" }
    });
  }

  /**
   * Find all available (not booked) slots for a doctor on a date
   * @param {string} doctorId - Doctor UUID
   * @param {Date} date - Appointment date
   * @returns {Promise<Array>} Available slots
   */
  async findAvailableDoctorSlots(doctorId, date) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: date,
        active_appointment_booking_slot: true,
        appointments_made: {
          none: {} // No appointments booked
        }
      },
      include: { appointments_templates: true },
      orderBy: { slot_start_time: "asc" }
    });
  }

  /**
   * Find all slots for a hospital
   * @param {number} hospitalId - Hospital ID
   * @param {Date} fromDate - Optional: start date
   * @param {Date} toDate - Optional: end date
   * @returns {Promise<Array>} Hospital's slots
   */
  async findHospitalSlots(hospitalId, fromDate = null, toDate = null) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        appointments_templates: {
          hospital_id: hospitalId
        },
        active_appointment_booking_slot: true,
        ...(fromDate && { appointment_date: { gte: fromDate } }),
        ...(toDate && { appointment_date: { lte: toDate } })
      },
      include: {
        appointments_templates: true,
        users: {
          include: {
            users_profiles: { include: { profiles: true } },
            roles: true
          }
        },
        appointments_made: true
      },
      orderBy: [
        { appointment_date: "asc" },
        { slot_start_time: "asc" }
      ]
    });
  }

  /**
   * Find public available slots (for patient booking)
   * @param {number} hospitalId - Hospital ID
   * @param {Date} date - Specific date
   * @returns {Promise<Array>} Available slots for patients to book
   */
  async findAvailableSlots(hospitalId, date = null) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        ...(date && { appointment_date: date }),
        active_appointment_booking_slot: true,
        appointments_templates: {
          hospital_id: hospitalId
        },
        appointments_made: {
          none: {} // Not yet booked
        }
      },
      include: {
        users: {
          include: {
            users_profiles: { include: { profiles: true } }
          }
        },
        appointments_templates: true
      },
      orderBy: [
        { slot_start_time: "asc" }
      ]
    });
  }

  async searchAvailablePatientSlots(filters) {
    const {
      hospitalId,
      hospitalIds,
      doctorName,
      specialization,
      date,
      startTime,
    } = filters;

    return prisma.appointments_booking_slots.findMany({
      where: {
        active_appointment_booking_slot: true,
        appointments_made: {
          none: {}
        },
        ...(date && { appointment_date: date }),
        ...(startTime && { slot_start_time: startTime }),
        appointments_templates: {
          ...(hospitalId && { hospital_id: hospitalId }),
          ...(!hospitalId && hospitalIds?.length && { hospital_id: { in: hospitalIds } }),
          active_appointment_template: true,
          ...(specialization && {
            staff_hospitals_departments: {
              staff_specializations: {
                some: {
                  specializations: {
                    specialization_name: {
                      contains: specialization,
                      mode: "insensitive"
                    }
                  }
                }
              }
            }
          })
        },
        ...(doctorName && {
          users: {
            users_profiles: {
              some: {
                profiles: {
                  OR: [
                    {
                      first_name: {
                        contains: doctorName,
                        mode: "insensitive"
                      }
                    },
                    {
                      last_name: {
                        contains: doctorName,
                        mode: "insensitive"
                      }
                    }
                  ]
                }
              }
            }
          }
        })
      },
      include: {
        users: {
          include: {
            users_profiles: {
              include: {
                profiles: true
              }
            }
          }
        },
        appointments_templates: {
          include: {
            staff_hospitals_departments: {
              include: {
                hospitals_departments: {
                  include: {
                    hospitals: true,
                    departments: true
                  }
                },
                staff_specializations: {
                  include: {
                    specializations: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { appointment_date: "asc" },
        { slot_start_time: "asc" }
      ]
    });
  }

  async findAvailablePatientTimeSlots() {
    return prisma.appointments_booking_slots.findMany({
      where: {
        active_appointment_booking_slot: true,
        appointments_made: {
          none: {}
        }
      },
      distinct: ["slot_start_time", "slot_end_time"],
      select: {
        slot_start_time: true,
        slot_end_time: true
      },
      orderBy: [
        { slot_start_time: "asc" },
        { slot_end_time: "asc" }
      ]
    });
  }

  async findAvailablePatientTimeSlotsForHospitals(hospitalIds) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        active_appointment_booking_slot: true,
        appointments_made: {
          none: {}
        },
        appointments_templates: {
          hospital_id: {
            in: hospitalIds
          },
          active_appointment_template: true
        }
      },
      distinct: ["slot_start_time", "slot_end_time"],
      select: {
        slot_start_time: true,
        slot_end_time: true
      },
      orderBy: [
        { slot_start_time: "asc" },
        { slot_end_time: "asc" }
      ]
    });
  }

  /**
   * Check for duplicate slots (exact same doctor, date, times)
   * @param {string} doctorId - Doctor UUID
   * @param {Date} appointmentDate - Slot date
   * @param {DateTime} startTime - Slot start time
   * @param {DateTime} endTime - Slot end time
   * @returns {Promise<Object>} Found duplicate or null
   */
  async findDuplicate(doctorId, appointmentDate, startTime, endTime) {
    return prisma.appointments_booking_slots.findFirst({
      where: {
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        slot_start_time: startTime,
        slot_end_time: endTime,
        active_appointment_booking_slot: true
      }
    });
  }

  /**
   * Find slots generated from a specific template
   * @param {number} templateId - Template ID
   * @returns {Promise<Array>} All slots from this template
   */
  async findByTemplateId(templateId) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        appointment_template_id: templateId,
        active_appointment_booking_slot: true
      },
      orderBy: { appointment_date: "asc" }
    });
  }

  /**
   * Check if slots exist for a date range
   * @param {string} doctorId - Doctor UUID
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @returns {Promise<Array>} Slots in range
   */
  async findSlotsInDateRange(doctorId, fromDate, toDate) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: {
          gte: fromDate,
          lte: toDate
        }
      },
      orderBy: { appointment_date: "asc" }
    });
  }

  /**
   * Find latest generated slot date for a doctor
   * @param {string} doctorId - Doctor UUID
   * @returns {Promise<Date>} Latest slot date or null
   */
  async findLatestSlotDate(doctorId) {
    const result = await prisma.appointments_booking_slots.findFirst({
      where: { doctor_id: doctorId },
      orderBy: { appointment_date: "desc" },
      select: { appointment_date: true }
    });
    return result?.appointment_date || null;
  }

  /**
   * Count total slots for a doctor
   * @param {string} doctorId - Doctor UUID
   * @returns {Promise<number>} Count of slots
   */
  async countDoctorSlots(doctorId) {
    return prisma.appointments_booking_slots.count({
      where: {
        doctor_id: doctorId,
        active_appointment_booking_slot: true
      }
    });
  }

  /**
   * Count available slots for a doctor
   * @param {string} doctorId - Doctor UUID
   * @returns {Promise<number>} Count of unbooked slots
   */
  async countAvailableDoctorSlots(doctorId) {
    return prisma.appointments_booking_slots.count({
      where: {
        doctor_id: doctorId,
        active_appointment_booking_slot: true,
        appointments_made: {
          none: {}
        }
      }
    });
  }

  /**
   * Update a single slot
   * @param {number} id - Slot ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated slot
   */
  async update(id, data) {
    return prisma.appointments_booking_slots.update({
      where: { id },
      data,
      include: { appointments_templates: true }
    });
  }

  /**
   * Deactivate a slot (soft delete)
   * @param {number} id - Slot ID
   * @returns {Promise<Object>} Deactivated slot
   */
  async deactivate(id) {
    return prisma.appointments_booking_slots.update({
      where: { id },
      data: { active_appointment_booking_slot: false }
    });
  }

  /**
   * Hard delete a slot
   * @param {number} id - Slot ID
   * @returns {Promise<Object>} Deleted slot
   */
  async delete(id) {
    return prisma.appointments_booking_slots.delete({
      where: { id }
    });
  }

  /**
   * Check if a slot is booked
   * @param {number} id - Slot ID
   * @returns {Promise<boolean>} True if booked
   */
  async isBooked(id) {
    const count = await prisma.appointments_made.count({
      where: { appointment_booking_slot_id: id }
    });
    return count > 0;
  }

  /**
   * Bulk deactivate slots (for when template is deleted/updated)
   * @param {Array<number>} slotIds - Array of slot IDs
   * @returns {Promise<Object>} Update result
   */
  async deactivateBulk(slotIds) {
    return prisma.appointments_booking_slots.updateMany({
      where: { id: { in: slotIds } },
      data: { active_appointment_booking_slot: false }
    });
  }

  /**
   * Find slots created after a specific date (for weekly generation tracking)
   * @param {string} doctorId - Doctor UUID
   * @param {Date} afterDate - Find slots after this date
   * @returns {Promise<Array>} Slots
   */
  async findGeneratedSlotsAfter(doctorId, afterDate) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: {
          gte: afterDate
        }
      },
      orderBy: { appointment_date: "asc" }
    });
  }
}

export default new AppointmentsBookingSlotsRepository();
