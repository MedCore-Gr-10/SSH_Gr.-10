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

  async delete(id) {
    return prisma.appointments_made.delete({
      where: { id }
    });
  }

}

export default new AppointmentsMadeRepository();
