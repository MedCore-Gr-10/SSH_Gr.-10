import prisma from "../prisma.js";

class HospitalsRepository {

  async create(data) {
    const { director_personal_no, ...hospitalData } = data;

    const newHospital = await prisma.hospitals.create({
      data: hospitalData
    });

    if (director_personal_no) {
      await this.linkDirectorToHospital(newHospital.id, director_personal_no);
    }

    return newHospital;
  }

  async findAll() {
    const hospitals = await prisma.hospitals.findMany({
      include: {
        hospitals_departments: {
          include: {
            staff_hospitals_departments: {
              include: {
                users: {
                  include: {
                    roles: true,
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
        }
      }
    });

    return hospitals.map(hosp => this.mapHospitalDirector(hosp));
  }

  async findById(id) {
    const hospital = await prisma.hospitals.findUnique({
      where: { id: Number(id) },
      include: {
        hospitals_departments: {
          include: {
            staff_hospitals_departments: {
              include: {
                users: {
                  include: {
                    roles: true,
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
        }
      }
    });

    if (!hospital) return null;
    return this.mapHospitalDirector(hospital);
  }

  async update(id, data) {
    const { director_personal_no, ...pureHospitalData } = data;

    const updatedHospital = await prisma.hospitals.update({
      where: { id: Number(id) },
      data: pureHospitalData
    });

    if (director_personal_no) {
      await this.linkDirectorToHospital(updatedHospital.id, director_personal_no);
    }

    return this.findById(updatedHospital.id);
  }

  async delete(id) {
    return prisma.hospitals.delete({
      where: { id: Number(id) }
    });
  }

  async linkDirectorToHospital(hospitalId, personalNo) {
  hospitalId = Number(hospitalId);

  const profile = await prisma.profiles.findUnique({
    where: { personal_no: String(personalNo) },
    include: {
      users_profiles: {
        include: {
          users: { include: { roles: true } }
        }
      }
    }
  });

  if (!profile || profile.users_profiles.length === 0) {
    throw new Error("Director profile not found with the provided personal number.");
  }

  const userId = profile.users_profiles[0].user_id;

  const assignedHospital = await this.findHospitalByDirectorId(userId);
  if (assignedHospital && assignedHospital.id !== hospitalId) {
    throw new Error(`Director is already assigned to ${assignedHospital.hospital_name}. A director can only be appointed to one hospital.`);
  }

  const defaultDepartment = await prisma.departments.upsert({
    where: { department_name: "General" },
    update: {},
    create: { department_name: "General" }
  });

  await prisma.hospitals_departments.upsert({
    where: {
      hospital_id_department_id: { 
        hospital_id: hospitalId, 
        department_id: defaultDepartment.id 
      }
    },
    update: {},
    create: { 
      hospital_id: hospitalId, 
      department_id: defaultDepartment.id 
    }
  });

  await prisma.staff_hospitals_departments.deleteMany({
    where: { 
      hospital_id: hospitalId, 
      department_id: defaultDepartment.id,
      staff_id: { not: userId }
    }
  });


  return prisma.staff_hospitals_departments.upsert({
    where: {
      staff_id_hospital_id_department_id: {
        staff_id: userId,
        hospital_id: hospitalId,
        department_id: defaultDepartment.id
      }
    },
    update: {},
    create: {
      staff_id: userId,
      hospital_id: hospitalId,
      department_id: defaultDepartment.id
    }
  });
}

  mapHospitalDirector(hospital) {
    let directorData = null;

    if (hospital.hospitals_departments && hospital.hospitals_departments.length > 0) {
      for (const hospDept of hospital.hospitals_departments) {
        if (hospDept.staff_hospitals_departments && hospDept.staff_hospitals_departments.length > 0) {
          
          const staffRecord = hospDept.staff_hospitals_departments.find(shd => 
            shd.users?.roles?.role_name === "director"
          ) || hospDept.staff_hospitals_departments[0]; 

          if (staffRecord && staffRecord.users) {
            const user = staffRecord.users;
            const profile = user.users_profiles?.[0]?.profiles;

            directorData = {
              user_id: user.id,
              username: user.username,
              first_name: profile?.first_name || 'N/A',
              last_name: profile?.last_name || 'N/A',
              personal_no: profile?.personal_no || 'N/A',
              phone_number: profile?.phone_number || 'N/A'
            };
            break; 
          }
        }
      }
    }

    return {
      id: hospital.id,
      hospital_name: hospital.hospital_name,
      hospital_address: hospital.hospital_address,
      email: hospital.email,
      director: directorData
    };
  }

  async findDirectorByPersonalNo(personalNo) {
    return prisma.profiles.findUnique({
      where: { 
        personal_no: String(personalNo) 
      },
      include: {
        users_profiles: {
          where: {
            users: {
              roles: {
                role_name: "director"
              }
            }
          },
          include: {
            users: {
              include: {
                roles: true
              }
            }
          }
        }
      }
    });
  }

  async findHospitalByDirectorId(userId) {
    if (!userId) return null;

    const assignment = await prisma.staff_hospitals_departments.findFirst({
      where: {
        staff_id: String(userId), 
        hospitals_departments: {
          departments: {
            department_name: "General"
          }
        }
      },
      include: {
        hospitals_departments: {
          include: {
            hospitals: true
          }
        }
      }
    });

    if (!assignment || !assignment.hospitals_departments?.hospitals) {
      return null;
    }

    return assignment.hospitals_departments.hospitals;
  }
}

export default new HospitalsRepository();
