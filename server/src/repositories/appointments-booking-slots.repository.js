import prisma from "../prisma.js";

class AppointmentsBookingSlotsRepository {

  /*
  |--------------------------------------------------------------------------
  | CREATE SLOT
  |--------------------------------------------------------------------------
  */
  async create(data) {
    return prisma.appointments_booking_slots.create({
      data
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND BY ID (for delete / view)
  |--------------------------------------------------------------------------
  */
  async findById(id) {
    return prisma.appointments_booking_slots.findUnique({
      where: { id },
      include: {
        appointments_templates: true,
        appointments_made: true
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DOCTOR SLOTS (CORE FOR YOUR FEATURE)
  |--------------------------------------------------------------------------
  */
  async findDoctorSlots(doctorId, date = null) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        doctor_id: doctorId,
        ...(date && { appointment_date: date })
      },
      orderBy: {
        appointment_date: "asc"
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK OVERLAP SUPPORT (IMPORTANT FOR SERVICE LAYER)
  |--------------------------------------------------------------------------
  | This is not logic, just data fetch for validation
  */
  async findDoctorSlotsByDate(doctorId, date) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: date
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | TEMPLATE LOOKUP (REQUIRED FOR VALIDATION)
  |--------------------------------------------------------------------------
  */
  async findTemplateByDoctorAndDay(doctorId, dayOfWeek) {
    return prisma.appointments_templates.findFirst({
      where: {
        staff_id: doctorId,
        day_of_week: dayOfWeek,
        active_appointment_template: true
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | AVAILABLE SLOTS (FOR PATIENT SIDE LATER - KEEP IT)
  |--------------------------------------------------------------------------
  */
  async findAvailableSlots(date) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        appointment_date: date,
        active_appointment_booking_slot: true
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | HOSPITAL VIEW (KEEP FOR ADMIN / DIRECTOR)
  |--------------------------------------------------------------------------
  */
  async findHospitalSlots(hospitalId) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        appointments_templates: {
          hospital_id: hospitalId
        },
        active_appointment_booking_slot: true
      },
      include: {
        users: {
          include: {
            users_profiles: {
              include: {
                profiles: true
              }
            },
            roles: true
          }
        },
        appointments_templates: true
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE SLOT
  |--------------------------------------------------------------------------
  */
  async update(id, data) {
    return prisma.appointments_booking_slots.update({
      where: { id },
      data
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SOFT DELETE (DOCTOR SIDE SHOULD USE THIS)
  |--------------------------------------------------------------------------
  */
  async deactivate(id) {
    return prisma.appointments_booking_slots.update({
      where: { id },
      data: {
        active_appointment_booking_slot: false
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | HARD DELETE (ONLY IF YOU REALLY NEED IT)
  |--------------------------------------------------------------------------
  */
  async delete(id) {
    return prisma.appointments_booking_slots.delete({
      where: { id }
    });
  }
}

export default new AppointmentsBookingSlotsRepository();