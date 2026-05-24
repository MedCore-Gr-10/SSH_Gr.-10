import prisma from "../prisma.js";
import cacheService from "../services/cache.service.js";

class AppointmentsMadeRepository {
  doctorIdsForAppointment(appointment) {
    return [
      appointment?.appointments_booking_slots?.doctor_id,
      appointment?.appointments_booking_slots?.appointments_templates?.staff_id,
    ].filter(Boolean);
  }

  async invalidateDoctorPatientsCacheForAppointment(appointment) {
    const doctorIds = [...new Set(this.doctorIdsForAppointment(appointment))];
    await Promise.all(
      doctorIds.map((doctorId) => cacheService.invalidateDoctorPatients(doctorId)),
    );
  }

  async create(data) {
    const appointment = await prisma.appointments_made.create({
      data,
      include: {
        appointments_booking_slots: {
          include: {
            appointments_templates: true,
          },
        },
      },
    });
    await this.invalidateDoctorPatientsCacheForAppointment(appointment);
    return appointment;
  }

  async bookSlot(patientId, slotId) {
    const appointment = await prisma.appointments_made.create({
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
    await this.invalidateDoctorPatientsCacheForAppointment(appointment);
    return appointment;
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

  doctorAppointmentWhere(doctorId) {
    return {
      OR: [
        { doctor_id: doctorId },
        {
          appointments_templates: {
            staff_id: doctorId,
          },
        },
      ],
    };
  }

  async findDoctorPatients(doctorId) {
    const appointments = await prisma.appointments_made.findMany({
      where: {
        appointments_booking_slots: this.doctorAppointmentWhere(doctorId),
      },
      include: {
        users: {
          include: {
            roles: true,
            users_profiles: {
              include: {
                profiles: true,
              },
            },
            patients_hospitals: {
              include: {
                hospitals: true,
              },
            },
          },
        },
        appointments_booking_slots: {
          include: {
            appointments_templates: {
              include: {
                staff_hospitals_departments: {
                  include: {
                    hospitals_departments: {
                      include: {
                        departments: true,
                        hospitals: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const patientMap = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment.users;
      if (!patient?.id) return;

      const slot = appointment.appointments_booking_slots;
      const department =
        slot?.appointments_templates?.staff_hospitals_departments
          ?.hospitals_departments?.departments?.department_name;
      const previous = patientMap.get(patient.id);

      if (!previous) {
        patientMap.set(patient.id, {
          ...patient,
          appointment_count: 1,
          last_appointment_date: slot?.appointment_date || null,
          departments: department ? [department] : [],
        });
        return;
      }

      previous.appointment_count += 1;
      if (department && !previous.departments.includes(department)) {
        previous.departments.push(department);
      }
      if (
        slot?.appointment_date &&
        (!previous.last_appointment_date ||
          new Date(slot.appointment_date) > new Date(previous.last_appointment_date))
      ) {
        previous.last_appointment_date = slot.appointment_date;
      }
    });

    return Array.from(patientMap.values()).sort((a, b) =>
      (a.username || "").localeCompare(b.username || ""),
    );
  }

  async hasDoctorPatient(doctorId, patientId) {
    const appointment = await prisma.appointments_made.findFirst({
      where: {
        patient_id: patientId,
        appointments_booking_slots: this.doctorAppointmentWhere(doctorId),
      },
      select: {
        id: true,
      },
    });

    return Boolean(appointment);
  }

  async findPatientHistoryForDoctor(patientId, doctorId, filters = {}) {
    const slotWhere = this.doctorAppointmentWhere(doctorId);

    if (filters.dateFrom || filters.dateTo) {
      slotWhere.appointment_date = {};
      if (filters.dateFrom) {
        slotWhere.appointment_date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        slotWhere.appointment_date.lte = new Date(filters.dateTo);
      }
    }

    return prisma.appointments_made.findMany({
      where: {
        patient_id: patientId,
        appointments_booking_slots: slotWhere,
      },
      include: {
        diagnoses: {
          orderBy: { created_at: "desc" },
        },
        prescriptions: {
          orderBy: { created_at: "desc" },
        },
        appointments_booking_slots: {
          include: {
            appointments_templates: {
              include: {
                staff_hospitals_departments: {
                  include: {
                    hospitals_departments: {
                      include: {
                        departments: true,
                        hospitals: true,
                      },
                    },
                    users: {
                      include: {
                        users_profiles: {
                          include: {
                            profiles: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findPatientAppointmentsForDoctor(patientId, doctorId) {
    return prisma.appointments_made.findMany({
      where: {
        patient_id: patientId,
        appointments_booking_slots: this.doctorAppointmentWhere(doctorId),
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
                        departments: true,
                        hospitals: true,
                      },
                    },
                    users: {
                      include: {
                        users_profiles: {
                          include: {
                            profiles: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
  }

  async findActivePatientAppointments(patientId) {
    return prisma.appointments_made.findMany({
      where: {
        patient_id: patientId,
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
      },
      orderBy: {
        id: "desc"
      }
    });
  }

  async findPatientAppointmentById(id, patientId) {
    return prisma.appointments_made.findFirst({
      where: {
        id,
        patient_id: patientId
      }
    });
  }

  async findPatientHistoryAtHospital(patientId, hospitalId, filters = {}) {
    const templateWhere = { hospital_id: hospitalId };
    if (filters.departmentId) {
      templateWhere.department_id = Number(filters.departmentId);
    }

    const slotWhere = {
      appointments_templates: templateWhere,
    };

    if (filters.dateFrom || filters.dateTo) {
      slotWhere.appointment_date = {};
      if (filters.dateFrom) {
        slotWhere.appointment_date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        slotWhere.appointment_date.lte = new Date(filters.dateTo);
      }
    }

    return prisma.appointments_made.findMany({
      where: {
        patient_id: patientId,
        appointments_booking_slots: slotWhere,
      },
      include: {
        diagnoses: {
          orderBy: { created_at: "desc" },
        },
        prescriptions: {
          orderBy: { created_at: "desc" },
        },
        appointments_booking_slots: {
          include: {
            appointments_templates: {
              include: {
                staff_hospitals_departments: {
                  include: {
                    hospitals_departments: {
                      include: {
                        departments: true,
                        hospitals: true,
                      },
                    },
                    users: {
                      include: {
                        users_profiles: {
                          include: {
                            profiles: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findPatientAppointmentsAtHospital(patientId, hospitalId) {
    return prisma.appointments_made.findMany({
      where: {
        patient_id: patientId,
        appointments_booking_slots: {
          appointments_templates: {
            hospital_id: hospitalId,
          },
        },
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
                        departments: true,
                      },
                    },
                    users: {
                      include: {
                        users_profiles: {
                          include: {
                            profiles: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
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
    const previous = await this.findById(id);
    const updated = await prisma.appointments_made.update({
      where: { id },
      data,
      include: {
        appointments_booking_slots: {
          include: {
            appointments_templates: true,
          },
        },
      },
    });
    await this.invalidateDoctorPatientsCacheForAppointment(previous);
    await this.invalidateDoctorPatientsCacheForAppointment(updated);
    return updated;
  }

  async cancel(id) {
    const appointment = await prisma.appointments_made.update({
      where: { id },
      data: {
        active_appointment_made: false
      },
      include: {
        appointments_booking_slots: {
          include: {
            appointments_templates: true,
          },
        },
      },
    });
    await this.invalidateDoctorPatientsCacheForAppointment(appointment);
    return appointment;
  }

  async delete(id) {
    const appointment = await prisma.appointments_made.delete({
      where: { id },
      include: {
        appointments_booking_slots: {
          include: {
            appointments_templates: true,
          },
        },
      },
    });
    await this.invalidateDoctorPatientsCacheForAppointment(appointment);
    return appointment;
  }

 async getAllBookedAppointments() {
  return prisma.appointments_made.findMany({
    where: { active_appointment_made: true },
    include: {
      users: { // The Patient
        include: { users_profiles: { include: { profiles: true } } }
      },
      appointments_booking_slots: {
        include: {
          users: { // The Doctor
            include: { users_profiles: { include: { profiles: true } } }
          },
          appointments_templates: {
            include: {
              staff_hospitals_departments: {
                include: {
                  hospitals_departments: {
                    include: { hospitals: true, departments: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { id: "desc" }
  });
}
}

export default new AppointmentsMadeRepository();
