import prisma from "../prisma.js";

class AppointmentsMadeRepository {

  async create(data) {
    return prisma.appointments_made.create({
      data
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

  async findDoctorPatients(doctorId) {
    const appointments = await prisma.appointments_made.findMany({
      where: {
        active_appointment_made: {
          not: false
        },
        appointments_booking_slots: {
          doctor_id: doctorId,
          appointment_date: {
            lte: new Date()
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
            appointments_templates: {
              include: {
                staff_hospitals_departments: {
                  include: {
                    hospitals_departments: {
                      include: {
                        departments: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    appointments.sort((first, second) => {
      const firstDate = first.appointments_booking_slots?.appointment_date?.getTime?.() || 0;
      const secondDate = second.appointments_booking_slots?.appointment_date?.getTime?.() || 0;
      return secondDate - firstDate;
    });

    const patientMap = new Map();

    for (const appointment of appointments) {
      const patient = appointment.users;
      if (!patient?.id) continue;

      const slot = appointment.appointments_booking_slots;
      const profileLink = patient.users_profiles?.[0];
      const current = patientMap.get(patient.id);
      const appointmentDate = slot?.appointment_date || null;
      const department =
        slot?.appointments_templates?.staff_hospitals_departments?.hospitals_departments?.departments
          ?.department_name || null;

      if (current) {
        current.appointment_count += 1;
        if (appointmentDate && (!current.last_appointment_date || appointmentDate > current.last_appointment_date)) {
          current.last_appointment_date = appointmentDate;
          current.last_appointment = appointment;
        }
        if (department && !current.departments.includes(department)) {
          current.departments.push(department);
        }
        continue;
      }

      patientMap.set(patient.id, {
        id: patient.id,
        username: patient.username,
        email: profileLink?.email || null,
        profile: profileLink?.profiles || null,
        appointment_count: 1,
        last_appointment_date: appointmentDate,
        last_appointment: appointment,
        departments: department ? [department] : []
      });
    }

    return Array.from(patientMap.values());
  }

}

export default new AppointmentsMadeRepository();
