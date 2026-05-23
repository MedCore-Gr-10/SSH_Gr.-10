import prisma from "../prisma.js";

class AppointmentsMadeRepository {

  async create(data) {
    return prisma.appointments_made.create({
      data
    });
  }

  async bookSlot(patientId, slotId) {
    return prisma.appointments_made.create({
      data: {
        patient_id: patientId,
        appointment_booking_slot_id: slotId,
        active_appointment_made: true
      },
      include: {
        appointments_booking_slots: {
          include: {
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
            },
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async findById(id) {
    return prisma.appointments_made.findUnique({
      where: { id },
      include: {
        diagnoses: true,
        prescriptions: true,
        users: true,
        appointments_booking_slots: {
          include: {
            appointments_templates: true
          }
        }
      }
    });
  }

  async findPatientAppointments(patientId) {
    return prisma.appointments_made.findMany({
      where: {
        patient_id: patientId
      }
    });
  }

  async findHospitalAppointments(hospitalId) {
    return prisma.appointments_made.findMany({
      where: {
        appointments_booking_slots: {
          appointments_templates: {
            hospital_id: hospitalId
          }
        }
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
        appointments_booking_slots: {
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
        }
      }
    });
  }

  async update(id, data) {
    return prisma.appointments_made.update({
      where: { id },
      data
    });
  }

  async cancel(id) {
    return prisma.appointments_made.update({
      where: { id },
      data: {
        active_appointment_made: false
      }
    });
  }

}

export default new AppointmentsMadeRepository();
