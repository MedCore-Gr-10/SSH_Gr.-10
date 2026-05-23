import profileRepository from "../../repositories/profile.repository.js";
import prisma from "../../prisma.js";

class ProfileService {
  async getAllProfiles() {
    const profiles = await profileRepository.findAll();
    return profiles.map(profile => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      birth_date: profile.birth,
      gender: profile.gender,
      personal_no: profile.personal_no,
      phone_number: profile.phone_number,
    }));
  }

  async getProfileById(id) {
    return await profileRepository.findById(id);
  }

  async getProfileByPersonalNo(personalNo) {
    if (!personalNo || personalNo.trim() === "") {
      throw new Error("Personal Number is required for searching.");
    }

    const profile = await profileRepository.findByPersonalNo(personalNo.trim());
    if (!profile) return null;

    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      personal_no: profile.personal_no,
      phone_number: profile.phone_number
    };
  }

  async getDirectorByPersonalNo(personalNo) {
    if (!personalNo || personalNo.trim() === "") {
      throw new Error("Personal Number is required for searching.");
    }

    const profile = await profileRepository.findDirectorByPersonalNo(personalNo.trim());
    if (!profile) return null;

    // 🎯 ZGJIDHJA: Këtu nxirret saktë username nga objekti i ndërthurur i Prisma-s
    const linkedUser = profile.users_profiles?.[0]?.users;

    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      personal_no: profile.personal_no,
      phone_number: profile.phone_number,
      username: linkedUser?.username || "N/A" 
    };
  }

  async createProfile(profileData) {
    const { first_name, last_name, birth, gender, personal_no, phone_number } = profileData;

    if (!first_name || !last_name || !personal_no) {
      throw new Error("First name, Last name, and Personal Number are required.");
    }

    const existingProfile = await profileRepository.findByPersonalNo(personal_no);
    if (existingProfile) {
      throw new Error("A profile with this Personal Number already exists.");
    }

    let formattedBirth = birth ? new Date(birth) : null;

    const newProfile = await profileRepository.create({
      first_name,
      last_name,
      birth: formattedBirth,
      gender: gender || null,
      personal_no,
      phone_number: phone_number || null,
    });

    return {
      id: newProfile.id,
      first_name: newProfile.first_name,
      last_name: newProfile.last_name,
      birth_date: newProfile.birth,
      gender: newProfile.gender,
      personal_no: newProfile.personal_no,
      phone_number: newProfile.phone_number,
    };
  }

  async searchProfilesByName(name) {
    if (!name || name.trim() === "") {
      return this.getAllProfiles(); 
    }

    const profiles = await profileRepository.searchByName(name.trim());
    return profiles.map(profile => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      birth_date: profile.birth,
      gender: profile.gender,
      personal_no: profile.personal_no,
      phone_number: profile.phone_number,
    }));
  }

  async updateProfile(id, profileData) {
    const { first_name, last_name, birth, gender, phone_number } = profileData;

    const existingProfile = await profileRepository.findById(id);
    if (!existingProfile) {
      throw new Error("Profile not found.");
    }

    if (first_name !== undefined && !first_name.trim()) {
      throw new Error("First name cannot be empty.");
    }
    if (last_name !== undefined && !last_name.trim()) {
      throw new Error("Last name cannot be empty.");
    }

    let formattedBirth = birth !== undefined ? (birth ? new Date(birth) : null) : undefined;

    const updatedProfile = await profileRepository.update(id, {
      first_name: first_name !== undefined ? first_name : undefined,
      last_name: last_name !== undefined ? last_name : undefined,
      birth: formattedBirth,
      gender: gender !== undefined ? (gender || null) : undefined,
      phone_number: phone_number !== undefined ? (phone_number || null) : undefined,
    });

    return {
      id: updatedProfile.id,
      first_name: updatedProfile.first_name,
      last_name: updatedProfile.last_name,
      birth_date: updatedProfile.birth,
      gender: updatedProfile.gender,
      personal_no: updatedProfile.personal_no,
      phone_number: updatedProfile.phone_number,
    };
  }

  async deleteProfile(id) {
    const existingProfile = await profileRepository.findById(id);
    if (!existingProfile) {
      throw new Error("Profile not found.");
    }
    return await profileRepository.delete(id);
  }

  async getCurrentUserProfile(userId, role, hospitalId) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        users_profiles: {
          include: { profiles: true },
          take: 1,
        },
        staff_hospitals_departments: {
          include: {
            hospitals_departments: {
              include: {
                hospitals: true,
                departments: true,
              },
            },
            staff_specializations: {
              include: { specializations: true },
            },
          },
          take: 1,
        },
        patients_hospitals: {
          include: { hospitals: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const profileLink = user.users_profiles?.[0];
    const profile = profileLink?.profiles;
    const staffAssignment = user.staff_hospitals_departments?.[0];
    const hospital = staffAssignment?.hospitals_departments?.hospitals || user.patients_hospitals?.[0]?.hospitals || null;
    const department = staffAssignment?.hospitals_departments?.departments || null;
    const specialization = staffAssignment?.staff_specializations?.[0]?.specializations || null;

    const [staffCount, patientCount] = hospitalId
      ? await Promise.all([
          prisma.staff_hospitals_departments.groupBy({
            by: ["staff_id"],
            where: { hospital_id: Number(hospitalId) },
          }),
          prisma.patients_hospitals.count({
            where: { hospital_id: Number(hospitalId) },
          }),
        ])
      : [[], 0];

    return {
      user: {
        id: user.id,
        username: user.username,
        role: role || user.roles?.role_name?.toLowerCase() || "",
        is_active: user.is_active,
      },
      profile: {
        id: profile?.id || null,
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        birth: profile?.birth || null,
        gender: profile?.gender || "",
        personal_no: profile?.personal_no || "",
        phone_number: profile?.phone_number || "",
        email: profileLink?.email || "",
      },
      assignment: {
        hospital_id: hospital?.id || hospitalId || null,
        hospital_name: hospital?.hospital_name || "",
        department_name: department?.department_name || "",
        specialization_name: specialization?.specialization_name || "",
      },
      summary: {
        staff_count: staffCount.length,
        patient_count: patientCount,
      },
    };
  }

  async updateCurrentUserProfile(userId, data, role = null, hospitalId = null) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        users_profiles: {
          include: { profiles: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const profileLink = user.users_profiles?.[0];
    if (!profileLink) {
      throw new Error("Profile not found.");
    }

    const username = data.username?.trim();
    const email = data.email?.trim();
    const firstName = data.first_name?.trim();
    const lastName = data.last_name?.trim();

    if (!username) throw new Error("Username is required.");
    if (!email) throw new Error("Email is required.");
    if (!firstName) throw new Error("First name is required.");
    if (!lastName) throw new Error("Last name is required.");

    const usernameInUse = await prisma.users.findUnique({ where: { username } });
    if (usernameInUse && usernameInUse.id !== userId) {
      throw new Error("Username already exists.");
    }

    const emailInUse = await prisma.users_profiles.findFirst({
      where: {
        email,
        user_id: { not: userId },
      },
    });
    if (emailInUse) {
      throw new Error("Email already exists.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: userId },
        data: { username },
      });

      await tx.profiles.update({
        where: { id: profileLink.profile_id },
        data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: data.phone_number?.trim() || null,
          gender: data.gender || null,
        },
      });

      await tx.users_profiles.update({
        where: {
          user_id_profile_id: {
            user_id: userId,
            profile_id: profileLink.profile_id,
          },
        },
        data: { email },
      });
    });

    return this.getCurrentUserProfile(userId, role || user.roles?.role_name?.toLowerCase(), hospitalId);
  }
}

export default ProfileService;
