import bcrypt from "bcrypt";
import prisma from "../../prisma.js";
import userRepository from "../../repositories/user.repository.js";
import rolesRepository from "../../repositories/roles.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

class DirectorStaffService {
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
      first_name,
      last_name,
      phone_number,
    } = data;

    if (!username || !email || !password || !role || !department_id) {
      throw new Error("Username, email, password, role, and department are required");
    }

    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const normalizedRole = role.toUpperCase();
    const staffRole = await rolesRepository.findByName([normalizedRole, normalizedRole.toLowerCase()]);
    if (!staffRole) {
      throw new Error("Staff role not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profiles.create({
        data: {
          first_name,
          last_name,
          phone_number,
        },
      });

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

    await prisma.$transaction(async (tx) => {
      const updateData = { username: data.username };
      if (data.role) {
        const normalizedRole = data.role.toUpperCase();
        const roleRecord = await rolesRepository.findByName([normalizedRole, normalizedRole.toLowerCase()]);
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
