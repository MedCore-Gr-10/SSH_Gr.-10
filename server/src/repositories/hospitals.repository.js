import prisma from "../prisma.js";

class HospitalsRepository {

  // 1. Krijon spitalin e ri
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

  // 2. RREGULLUAR: Merr të gjithë spitalet duke ndjekur skemën e saktë të marrëdhënieve
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

  // 3. RREGULLUAR: Gjen spitalin sipas ID me të njëjtën strukturë korrekte
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

  // 4. Përditëson spitalin
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

  // 5. Fshin spitalin
  async delete(id) {
    return prisma.hospitals.delete({
      where: { id: Number(id) }
    });
  }

  // Lidh Drejtorin e ri përmes tabelave ndërmjetëse
  async linkDirectorToHospital(hospitalId, personalNo) {
  // 1. Gjejmë profilin e drejtorit sipas numrit personal
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

  // 2. AUTOMATIZIMI: Gjejmë ose krijojmë një departament të përgjithshëm "General"
  // Kjo bën që të mos na interesojë se çfarë ID-je ka, Prisma e menaxhon vetë
  const defaultDepartment = await prisma.departments.upsert({
    where: { department_name: "General" },
    update: {},
    create: { department_name: "General" }
  });

  // 3. Sigurohemi që ky spital është i lidhur me këtë departament të përgjithshëm
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

  // 4. Pastrojmë drejtorin e vjetër nga ky departament i këtë spitali (nëse ka pasur)
  await prisma.staff_hospitals_departments.deleteMany({
    where: { 
      hospital_id: hospitalId, 
      department_id: defaultDepartment.id 
    }
  });

  // 5. Regjistrojmë drejtorin e ri në këtë departament të spitalit
  return prisma.staff_hospitals_departments.create({
    data: {
      staff_id: userId,
      hospital_id: hospitalId,
      department_id: defaultDepartment.id
    }
  });
}

  // RREGULLUAR: Mapimi i të dhënave që të nxjerrë drejtorin nga struktura e re e nested array-ve
  mapHospitalDirector(hospital) {
    let directorData = null;

    // Shëtitim nëpër departamente për të gjetur stafin
    if (hospital.hospitals_departments && hospital.hospitals_departments.length > 0) {
      for (const hospDept of hospital.hospitals_departments) {
        if (hospDept.staff_hospitals_departments && hospDept.staff_hospitals_departments.length > 0) {
          
          // Gjejmë anëtarin e parë të stafit që ka rolin 'director'
          const staffRecord = hospDept.staff_hospitals_departments.find(shd => 
            shd.users?.roles?.role_name === "director"
          ) || hospDept.staff_hospitals_departments[0]; // Nëse s'gjen dot me rol, merr të parin

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
            break; // Kemi gjetur drejtorin, ndalojmë ciklin
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
}

export default new HospitalsRepository();