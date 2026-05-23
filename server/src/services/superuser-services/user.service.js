import userRepository from "../../repositories/user.repository.js";
import bcrypt from "bcrypt";


class UserService {

  // Merr të gjithë përdoruesit e thjeshtuar për listim/tabela
  async getAllUsers() {
    const users = await userRepository.findAll();

    return users.map((user) => {
      const userProfileRelation = user.users_profiles && user.users_profiles[0];
      const email = userProfileRelation ? userProfileRelation.email : "N/A";
      const profileId = userProfileRelation ? userProfileRelation.profile_id : null; 

      return {
        id: user.id,
        username: user.username,
        role_name: user.roles ? user.roles.role_name : "N/A",
        // Sigurohemi që kthehet vlerë e pastër Booleane (true/false) dhe jo null/undefined 🔐
        is_active: user.is_active === true || user.is_active === 1 ? true : false,
        email: email,
        profile_id: profileId 
      };
    });
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

  async updateUser(id, updateData) {
    // Kontrollojmë nëse përdoruesi ekziston paraprakisht
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      const error = new Error("Përdoruesi nuk u gjet!");
      error.statusCode = 404;
      throw error;
    }

    // Thërrasim metodën e përditësimit transaksional në repository
    const updatedUser = await userRepository.update(id, updateData);

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      role_id: updatedUser.role_id,
      is_active: updatedUser.is_active,
      email: updateData.email || (updatedUser.users_profiles[0] ? updatedUser.users_profiles[0].email : "N/A")
    };
  }

  async createUser(userData) {
    const { username, email, password } = userData;

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

    // 2. 🔑 Hash the password using the same algorithm as updatePassword
    let hashedPassword = null;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // 3. Override the plain text password with the hashed version
    const newUser = await userRepository.create({
      ...userData,
      password: hashedPassword // This now sends the securely hashed string
    });

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
    const staticSalt = "SALT_VALUE"; // Keeps parity with your current registration flow

    // 🚀 FIXED: Call your existing repository method instead of writing directly to an undefined "this.db"
    const updatedUser = await userRepository.updatePassword(userId, hashedPassword, staticSalt);
    
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      is_active: updatedUser.is_active
    };
  }
}

export default UserService;