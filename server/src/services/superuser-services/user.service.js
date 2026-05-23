import userRepository from "../../repositories/user.repository.js";
import hospitalsRepository from "../../repositories/hospitals.repository.js"; 
import hospitalsDepartmentsRepository from "../../repositories/hospitals-departments.repository.js"; 
// I importojmë me shkronja të mëdha që të përputhen saktësisht me thirrjet e kodit tuaj poshtë
import StaffDepartmentsRepository from "../../repositories/staff-departments.repository.js";
import StaffSpecializationsRepository from "../../repositories/staff-specializations.repository.js";
import bcrypt from "bcrypt";

class UserService {

  async getDepartmentsByHospital(hospitalId) {
    if (!hospitalId) {
      const error = new Error("Hospital ID është i detyrueshëm!");
      error.statusCode = 400;
      throw error;
    }

    // Thërrasim metodën findByHospital nga repository juaj
    const hospitalRelations = await hospitalsDepartmentsRepository.findByHospital(Number(hospitalId));

    // Mapojmë të dhënat që të nxjerrim vetëm objektin e pastër të departamentit
    return hospitalRelations
      .map(relation => relation.departments)
      .filter(department => department !== null); // Siguri nëse ka ndonjë të dhënë korruptive në DB
  }

  // Merr të gjithë përdoruesit e thjeshtuar për listim/tabela
  async getAllUsers() {
    const users = await userRepository.findAll();

    // 🚀 Përdorim Promise.all sepse do të bëjmë thirrje asinkrone brenda map-it
    return Promise.all(
      users.map(async (user) => {
        const userProfileRelation = user.users_profiles && user.users_profiles[0];
        const email = userProfileRelation ? userProfileRelation.email : "N/A";
        const profileId = userProfileRelation ? userProfileRelation.profile_id : null; 
        
        const roleName = user.roles ? user.roles.role_name : "N/A";
        
        // Vlerat default për spitalin
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

        // 🚀 KUSHTI I RI: Nëse përdoruesi është drejtor, gjejmë spitalin e tij të korreluar
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
          // Sigurohemi që kthehet vlerë e pastër Booleane (true/false) dhe jo null/undefined 🔐
          is_active: user.is_active === true || user.is_active === 1 ? true : false,
          email: email,
          profile_id: profileId,
          hospital_id: hospitalId,     // Kalon ID-në e saktë te frontend-i (për Read-Only dropdown)
          hospital_name: hospitalName,
          department_id: departmentId,
          department_name: departmentName,
          specialization_id: specializationId,
          specialization_name: specializationName
        };
      })
    );
  }

  // Merr detajet e plota të një përdoruesi specifik sipas ID-së
  async getUserById(id) {
    return await userRepository.findById(id);
  }

  /**
   * Kërkon përdoruesit sipas username duke përdorur funksionin findAll() të repos 🔍
   */
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
    // 1. Kontrollojmë nëse përdoruesi ekziston
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      const error = new Error("Përdoruesi nuk u gjet!");
      error.statusCode = 404;
      throw error;
    }

    // 2. Përditësojmë të dhënat bazë të përdoruesit
    if (updateData.hospital_id && updateData.department_id) {
      await this.ensureHospitalDepartment(updateData.hospital_id, updateData.department_id);
    }

    const updatedUser = await userRepository.update(id, updateData);

    // 3. Përditësimi i Spitalit, Departamentit dhe Specializimit (nëse janë dërguar)
    if (updateData.hospital_id && updateData.department_id) {
      
      // Së pari, lidhim stafin me departamentin (kjo bën upsert ose krijim)
      await StaffDepartmentsRepository.replaceStaffDepartment({
        staff_id: id,
        hospital_id: updateData.hospital_id,
        department_id: updateData.department_id,
      });

      // Së dyti, nëse është dërguar edhe specializimi, e shtojmë/përditësojmë atë
      await StaffSpecializationsRepository.replaceStaffSpecialization({
        staff_id: id,
        hospital_id: updateData.hospital_id,
        department_id: updateData.department_id,
        specialization_id: updateData.specialization_id,
      });
    }

    // 4. Kthimi i përgjigjes
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

    // 1. Validation Checks
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      const error = new Error("Ky username është i zënë!");
      error.statusCode = 400;
      throw error;
    }

    if (email) {
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        const error = new Error("Ky email është i regjistruar një herë!");
        error.statusCode = 400;
        throw error;
      }
    }

    // 2. Hash password
    let hashedPassword = null;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // 3. Krijimi i përdoruesit
    if (hospital_id && department_id) {
      await this.ensureHospitalDepartment(hospital_id, department_id);
    }

    const newUser = await userRepository.create({
      ...userData,
      password: hashedPassword 
    });

    // 4. Lidhja me Departamentin (Nëse janë dërguar të dhënat)
    if (hospital_id && department_id) {
      await StaffDepartmentsRepository.assignStaffToDepartment({
        staff_id: newUser.id,
        hospital_id,
        department_id,
      });

      // 5. Lidhja me Specializimin (Nëse është dërguar)
      if (specialization_id) {
        await StaffSpecializationsRepository.addSpecializationToStaff({
          staff_id: newUser.id,
          hospital_id,
          department_id,
          specialization_id,
        });
      }
    }

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

// Eksportohet si instancë e re (new) ashtu siç dëshironi ju 🚀
export default new UserService();