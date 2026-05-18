import bcrypt from "bcrypt";
import prisma from "../../prisma.js";
import userRepository from "../../repositories/user.repository.js";
import rolesRepository from "../../repositories/roles.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

class DirectorPatientService {
  async getHospitalPatients(hospitalId, currentUserId) {
    if (!hospitalId) {
      throw new Error("Hospital ID is required to list patients");
    }

    const patients = await userRepository.findHospitalPatients(hospitalId);

    await logsRepository.create({
      user_id: currentUserId,
      action: "view hospital patients",
      reason: "Director viewed hospital patients",
    });

    return patients;
  }

  async createPatient(data, hospitalId, currentUserId) {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      birth,
      gender,
      personal_no,
      phone_number,
    } = data;

    if (!username || !email || !password) {
      throw new Error("Username, email, and password are required");
    }

    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const patientRole = await rolesRepository.findByName(["patient", "PATIENT"]);
    if (!patientRole) {
      throw new Error("Patient role not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profiles.create({
        data: {
          first_name,
          last_name,
          birth: birth ? new Date(birth) : null,
          gender,
          personal_no,
          phone_number,
        },
      });

      const user = await tx.users.create({
        data: {
          username,
          hash_password: hashedPassword,
          role_id: patientRole.id,
        },
      });

      await tx.users_profiles.create({
        data: {
          user_id: user.id,
          profile_id: profile.id,
          email,
        },
      });

      await tx.patients_hospitals.create({
        data: {
          patient_id: user.id,
          hospital_id: hospitalId,
        },
      });

      return user;
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "create patient",
      reason: "Director created a new patient",
    });

    return userRepository.findById(result.id);
  }

  async updatePatient(id, data, hospitalId, currentUserId) {
    const patient = await userRepository.findById(id);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const belongsToHospital = patient.patients_hospitals?.some(
      (entry) => entry.hospital_id === hospitalId
    );
    if (!belongsToHospital) {
      throw new Error("Patient does not belong to this hospital");
    }

    const usernameInUse = await userRepository.findByUsername(data.username);
    if (usernameInUse && usernameInUse.id !== id) {
      throw new Error("Username already exists");
    }

    const profileRecord = patient.users_profiles?.[0];
    if (!profileRecord) {
      throw new Error("Patient profile record not found");
    }

    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail && existingEmail.id !== id) {
      throw new Error("Email already exists");
    }

    const updatedUser = await userRepository.update(id, {
      username: data.username,
    });

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      await prisma.users.update({
        where: { id },
        data: { hash_password: hashedPassword },
      });
    }

    await prisma.profiles.update({
      where: { id: profileRecord.profile_id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        birth: data.birth ? new Date(data.birth) : profileRecord.profiles?.birth,
        gender: data.gender,
        personal_no: data.personal_no,
        phone_number: data.phone_number,
      },
    });

    await prisma.users_profiles.update({
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

    await logsRepository.create({
      user_id: currentUserId,
      action: "update patient",
      reason: "Director updated patient information",
    });

    return userRepository.findById(id);
  }

  async deletePatient(id, hospitalId, currentUserId) {
    const patient = await userRepository.findById(id);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const belongsToHospital = patient.patients_hospitals?.some(
      (entry) => entry.hospital_id === hospitalId
    );
    if (!belongsToHospital) {
      throw new Error("Patient does not belong to this hospital");
    }

    await userRepository.delete(id);

    await logsRepository.create({
      user_id: currentUserId,
      action: "delete patient",
      reason: "Director deleted a patient",
    });

    return { id };
  }
}

export default new DirectorPatientService();
