import userRepository from "../../repositories/user.repository.js";

class UserService {

  async getAllUsers() {
    const users = await userRepository.findAll();

    return users.map(user => ({
      id: user.id,
      username: user.username,
    }));
  }

  async getUserById(id) {
    return await userRepository.findById(id);
  }
}

export default UserService;