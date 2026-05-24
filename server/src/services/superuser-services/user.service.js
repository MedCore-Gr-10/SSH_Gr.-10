import userRepository from "../../repositories/user.repository.js";
import hospitalsRepository from "../../repositories/hospitals.repository.js"; 
import hospitalsDepartmentsRepository from "../../repositories/hospitals-departments.repository.js"; 
import StaffDepartmentsRepository from "../../repositories/staff-departments.repository.js";
import StaffSpecializationsRepository from "../../repositories/staff-specializations.repository.js";
import bcrypt from "bcrypt";
import redisCache from "../cache.service.js";

class UserService {

  async getDepartmentsByHospital(hospitalId) {
    if (!hospitalId) {
      const error = new Error("Hospital ID is required!");
      error.statusCode = 400;
      throw error;
    }

    const hospitalRelations = await hospitalsDepartmentsRepository.findByHospital(Number(hospitalId));

    return hospitalRelations
      .map(relation => relation.departments)
      .filter(department => department !== null);
  }

  async getAllUsers() {
    const users = await userRepository.findAll();

    return Promise.all(
      users.map(async (user) => {
        const userProfileRelation = user.users_profiles && user.users_profiles[0];
        const email = userProfileRelation ? userProfileRelation.email : "N/A";
        const profileId = userProfileRelation ? userProfileRelation.profile_id : null; 
        
        const roleName = user.roles ? user.roles.role_name : "N/A";
        
        let hospitalId = user.hospital_id || null;
        let hospitalName = user.hospital_name || "N/A";
        let departmentId = null;
        let departmentName = "N/A";
        let specializationId = null;
        let specializationName = "N/A";

        const staffAssignment = user.staff_hospitals_departments?.[0];
        if (staffAssignment) {
          hospitalId = staffAssignment.hospital_id;
          hospitalName = staffAssignment.hospitals_departments?.hospitals?.hospital_name || hospitalName;
          departmentId = staffAssignment.department_id;
          departmentName = staffAssignment.hospitals_departments?.departments?.department_name || departmentName;

          const staffSpecialization = staffAssignment.staff_specializations?.[0];
          specializationId = staffSpecialization?.specialization_id || null;
          specializationName = staffSpecialization?.specializations?.specialization_name || specializationName;
        }

        if (roleName.toLowerCase() === "director") {
          try {
            const correlatedHospital = await hospitalsRepository.findHospitalByDirectorId(user.id);
            if (correlatedHospital) {
              hospitalId = correlatedHospital.id;
              hospitalName = correlatedHospital.hospital_name;
            }
          } catch (error) {
            console.error(`Error finding hospital for director ${user.id}:`, error);
          }
        }

        return {
          id: user.id,
          username: user.username,
          role_name: roleName,
          is_active: user.is_active === true || user.is_active === 1 ? true : false,
          email: email,
          profile_id: profileId,
          hospital_id: hospitalId,
          hospital_name: hospitalName,
          department_id: departmentId,
          department_name: departmentName,
          specialization_id: specializationId,
          specialization_name: specializationName
        };
      })
    );
  }

  async getUserById(id) {
    return await userRepository.findById(id);
  }

  async searchUsersByUsername(username) {
    if (!username || username.trim() === "") {
      return this.getAllUsers();
    }

    const users = await userRepository.findAll();
    const searchLower = username.trim().toLowerCase();

    const filteredUsers = users.filter(user => 
      user.username && user.username.toLowerCase().includes(searchLower)
    );

    return filteredUsers.map(user => ({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      is_active: user.is_active
    }));
  }

  async ensureHospitalDepartment(hospitalId, departmentId) {
    const relation = await hospitalsDepartmentsRepository.findByHospitalAndDepartment(
      hospitalId,
      departmentId
    );

    if (!relation) {
      const error = new Error("Selected department does not belong to the selected hospital.");
      error.status = 400;
      error.statusCode = 400;
      throw error;
    }
  }

  async updateUser(id, updateData) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.hospital_id && updateData.department_id) {
      await this.ensureHospitalDepartment(updateData.hospital_id, updateData.department_id);
    }

    const updatedUser = await userRepository.update(id, updateData);

    if (updateData.hospital_id && updateData.department_id) {
      await StaffDepartmentsRepository.replaceStaffDepartment({
        staff_id: id,
        hospital_id: updateData.hospital_id,
        department_id: updateData.department_id,
      });

      await StaffSpecializationsRepository.replaceStaffSpecialization({
        staff_id: id,
        hospital_id: updateData.hospital_id,
        department_id: updateData.department_id,
        specialization_id: updateData.specialization_id,
      });
    }
    await redisCache.delete("system_overview_stats");

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      role_id: updatedUser.role_id,
      is_active: updatedUser.is_active,
      email: updateData.email || (updatedUser.users_profiles[0] ? updatedUser.users_profiles[0].email : "N/A"),
      hospital_id: updateData.hospital_id || null,
      department_id: updateData.department_id || null,
      specialization_id: updateData.specialization_id || null
    };
  }

  async createUser(userData) {
    const { username, email, password, hospital_id, department_id, specialization_id } = userData;

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      const error = new Error("This username is already taken!");
      error.statusCode = 400;
      throw error;
    }

    if (email) {
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        const error = new Error("This email is already registered!");
        error.statusCode = 400;
        throw error;
      }
    }

    let hashedPassword = null;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    if (hospital_id && department_id) {
      await this.ensureHospitalDepartment(hospital_id, department_id);
    }

    const newUser = await userRepository.create({
      ...userData,
      password: hashedPassword 
    });

    if (hospital_id && department_id) {
      await StaffDepartmentsRepository.assignStaffToDepartment({
        staff_id: newUser.id,
        hospital_id,
        department_id,
      });

      if (specialization_id) {
        await StaffSpecializationsRepository.addSpecializationToStaff({
          staff_id: newUser.id,
          hospital_id,
          department_id,
          specialization_id,
        });
      }
    }
    await redisCache.delete("system_overview_stats");

    return {
      id: newUser.id,
      username: newUser.username,
      role_id: newUser.role_id,
      is_active: newUser.is_active,
      email: newUser.users_profiles && newUser.users_profiles[0] ? newUser.users_profiles[0].email : "N/A"
    };
  }

  async updateUserPassword(userId, plainTextPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
    const staticSalt = "SALT_VALUE"; 

    const updatedUser = await userRepository.updatePassword(userId, hashedPassword, staticSalt);
    
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      is_active: updatedUser.is_active
    };
  }
}

export default new UserService();