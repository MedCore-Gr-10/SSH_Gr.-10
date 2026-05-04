import UserRepository from "../repositories/user.repository.js";

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();

    return users.map(user => ({
      id: user.id,
      username: user.username,
    }));
  }

  async getUserById(id) {
    return await this.userRepository.findById(id);
  }
}

export default UserService;