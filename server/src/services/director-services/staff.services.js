import bcrypt from "bcrypt";
import prisma from "../../prisma.js";
import userRepository from "../../repositories/user.repository.js";
import rolesRepository from "../../repositories/roles.repository.js";
import logsRepository from "../../repositories/logs.repository.js";
import profileRepository from "../../repositories/profile.repository.js";
import hospitalsDepartmentsRepository from "../../repositories/hospitals-departments.repository.js";

class DirectorStaffService {
  normalizePersonalNo(personalNo) {
    return personalNo?.trim();
  }

  validatePassword(password) {
    if (!password || password.length < 8 || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      throw new Error("Password must be at least 8 characters and include a number and a symbol");
    }
  }

  async ensureHospitalDepartment(hospitalId, departmentId) {
    const departments = await hospitalsDepartmentsRepository.findByHospital(hospitalId);
    const belongsToHospital = departments.some(
      (entry) => entry.department_id === Number(departmentId)
    );

    if (!belongsToHospital) {
      throw new Error("Department does not belong to this hospital");
    }
  }

  async ensureSpecialization(specializationId) {
    const specialization = await prisma.specializations.findUnique({
      where: { id: Number(specializationId) },
    });

    if (!specialization) {
      throw new Error("Specialization not found");
    }
  }

  async getHospitalStaff(hospitalId, currentUserId) {
    if (!hospitalId) {
      throw new Error("Hospital ID is required to list staff");
    }

    const staff = await userRepository.findHospitalStaff(hospitalId);

    await logsRepository.create({
      user_id: currentUserId,
      action: "view hospital staff",
      reason: "Director viewed hospital staff",
    });

    return staff;
  }

  async createStaff(data, hospitalId, currentUserId) {
    const {
      username,
      email,
      password,
      role,
      department_id,
      specialization_id,
      first_name,
      last_name,
      birth,
      gender,
      personal_no,
      phone_number,
    } = data;
    const normalizedPersonalNo = this.normalizePersonalNo(personal_no);
    const birthDate = new Date(birth);

    if (
      !username ||
      !email ||
      !password ||
      !role ||
      !department_id ||
      !specialization_id ||
      !first_name ||
      !last_name ||
      !birth ||
      !gender ||
      !normalizedPersonalNo ||
      !phone_number
    ) {
      throw new Error("Missing required staff registration fields");
    }
    if (Number.isNaN(birthDate.getTime())) {
      throw new Error("Invalid birth date");
    }
    this.validatePassword(password);

    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const normalizedRole = role.toLowerCase();
    if (!["doctor", "nurse"].includes(normalizedRole)) {
      throw new Error("Staff role must be doctor or nurse");
    }

    const roleLookupName = normalizedRole.toUpperCase();
    const staffRole = await rolesRepository.findByName([roleLookupName, normalizedRole]);
    if (!staffRole) {
      throw new Error("Staff role not found");
    }

    await this.ensureHospitalDepartment(hospitalId, department_id);
    await this.ensureSpecialization(specialization_id);

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      let profile = await tx.profiles.findUnique({
        where: { personal_no: normalizedPersonalNo },
        include: {
          users_profiles: {
            include: {
              users: {
                include: {
                  roles: true,
                },
              },
            },
          },
        },
      });

      if (!profile) {
        profile = await tx.profiles.findFirst({
          where: {
            personal_no: null,
            first_name,
            last_name,
            birth: birthDate,
          },
          include: {
            users_profiles: {
              include: {
                users: {
                  include: {
                    roles: true,
                  },
                },
              },
            },
          },
        });
      }

      if (profile) {
        if (!profile.personal_no) {
          profile = await tx.profiles.update({
            where: { id: profile.id },
            data: { personal_no: normalizedPersonalNo },
            include: {
              users_profiles: {
                include: {
                  users: {
                    include: {
                      roles: true,
                    },
                  },
                },
              },
            },
          });
        }

        const hasStaffUser = profile.users_profiles.some((link) => {
          const roleName = link.users?.roles?.role_name?.toLowerCase();
          return roleName === "doctor" || roleName === "nurse";
        });

        if (hasStaffUser) {
          throw new Error("A doctor or nurse already exists for this personal number");
        }
      }

      if (!profile) {
        profile = await tx.profiles.create({
          data: {
            first_name,
            last_name,
            birth: birthDate,
            gender,
            personal_no: normalizedPersonalNo,
            phone_number,
          },
        });
      } else {
        await tx.profiles.update({
          where: { id: profile.id },
          data: {
            first_name: profile.first_name ?? first_name,
            last_name: profile.last_name ?? last_name,
            birth: profile.birth ?? birthDate,
            gender: profile.gender ?? gender,
            personal_no: profile.personal_no ?? normalizedPersonalNo,
            phone_number: profile.phone_number ?? phone_number,
          },
        });
      }

      const user = await tx.users.create({
        data: {
          username,
          hash_password: hashedPassword,
          role_id: staffRole.id,
        },
      });

      await tx.users_profiles.create({
        data: {
          user_id: user.id,
          profile_id: profile.id,
          email,
        },
      });

      await tx.staff_hospitals_departments.create({
        data: {
          staff_id: user.id,
          hospital_id: hospitalId,
          department_id: Number(department_id),
        },
      });

      await tx.staff_specializations.create({
        data: {
          staff_id: user.id,
          hospital_id: hospitalId,
          department_id: Number(department_id),
          specialization_id: Number(specialization_id),
        },
      });

      return user;
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "create staff",
      reason: "Director created new staff",
    });

    return userRepository.findById(result.id);
  }

  async updateStaff(id, data, hospitalId, currentUserId) {
    const staff = await userRepository.findById(id);
    if (!staff) {
      throw new Error("Staff member not found");
    }

    const belongsToHospital = staff.staff_hospitals_departments?.some(
      (entry) => entry.hospital_id === hospitalId
    );
    if (!belongsToHospital) {
      throw new Error("Staff member does not belong to this hospital");
    }

    const usernameInUse = await userRepository.findByUsername(data.username);
    if (usernameInUse && usernameInUse.id !== id) {
      throw new Error("Username already exists");
    }

    const profileRecord = staff.users_profiles?.[0];
    if (!profileRecord) {
      throw new Error("Staff profile record not found");
    }

    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail && existingEmail.id !== id) {
      throw new Error("Email already exists");
    }

    if (data.password) {
      this.validatePassword(data.password);
    }

    if (data.department_id) {
      await this.ensureHospitalDepartment(hospitalId, data.department_id);
    }
    if (data.specialization_id) {
      await this.ensureSpecialization(data.specialization_id);
    }

    const normalizedPersonalNo = this.normalizePersonalNo(data.personal_no);

    if (normalizedPersonalNo && normalizedPersonalNo !== profileRecord.profiles?.personal_no) {
      const existingProfile = await profileRepository.findByPersonalNo(normalizedPersonalNo);
      if (existingProfile && existingProfile.id !== profileRecord.profile_id) {
        throw new Error("Personal number already belongs to another profile");
      }
    }

    await prisma.$transaction(async (tx) => {
      const updateData = { username: data.username };
      if (data.role) {
        const normalizedRole = data.role.toLowerCase();
        if (!["doctor", "nurse"].includes(normalizedRole)) {
          throw new Error("Staff role must be doctor or nurse");
        }

        const roleLookupName = normalizedRole.toUpperCase();
        const roleRecord = await rolesRepository.findByName([roleLookupName, normalizedRole]);
        if (!roleRecord) {
          throw new Error("Staff role not found");
        }
        updateData.role_id = roleRecord.id;
      }
      await tx.users.update({
        where: { id },
        data: updateData,
      });

      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await tx.users.update({
          where: { id },
          data: { hash_password: hashedPassword },
        });
      }

      await tx.profiles.update({
        where: { id: profileRecord.profile_id },
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          birth: data.birth ? new Date(data.birth) : undefined,
          gender: data.gender,
          personal_no: normalizedPersonalNo,
          phone_number: data.phone_number,
        },
      });

      await tx.users_profiles.update({
        where: {
          user_id_profile_id: {
            user_id: id,
            profile_id: profileRecord.profile_id,
          },
        },
        data: {
          email: data.email,
        },
      });

      if (data.department_id) {
        await tx.staff_hospitals_departments.deleteMany({
          where: {
            staff_id: id,
            hospital_id: hospitalId,
          },
        });

        await tx.staff_hospitals_departments.create({
          data: {
            staff_id: id,
            hospital_id: hospitalId,
            department_id: Number(data.department_id),
          },
        });
      }

      if (data.specialization_id) {
        const departmentId = Number(data.department_id || staff.staff_hospitals_departments?.[0]?.department_id);
        await tx.staff_specializations.deleteMany({
          where: {
            staff_id: id,
            hospital_id: hospitalId,
          },
        });

        await tx.staff_specializations.create({
          data: {
            staff_id: id,
            hospital_id: hospitalId,
            department_id: departmentId,
            specialization_id: Number(data.specialization_id),
          },
        });
      }
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "update staff",
      reason: "Director updated staff member",
    });

    return userRepository.findById(id);
  }

  async deleteStaff(id, hospitalId, currentUserId) {
    const staff = await userRepository.findById(id);
    if (!staff) {
      throw new Error("Staff member not found");
    }

    const belongsToHospital = staff.staff_hospitals_departments?.some(
      (entry) => entry.hospital_id === hospitalId
    );
    if (!belongsToHospital) {
      throw new Error("Staff member does not belong to this hospital");
    }

    await userRepository.delete(id);

    await logsRepository.create({
      user_id: currentUserId,
      action: "delete staff",
      reason: "Director deleted a staff member",
    });

    return { id };
  }
}

export default new DirectorStaffService();
