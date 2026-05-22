import UserService from "../../services/superuser-services/user.service.js";

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await this.userService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await this.userService.getUserById(req.params.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { username, role_id, is_active, email } = req.body;

      const updatedUser = await this.userService.updateUser(id, {
        username,
        role_id,
        is_active,
        email,
      });

      res.status(200).json({
        success: true,
        message: "Përdoruesi u përditësua me sukses!",
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req, res, next) {
    try {
      const { username, role_id, is_active, email, password, profile_id } = req.body; 

      const newUser = await this.userService.createUser({
        username,
        role_id: parseInt(role_id, 10),
        is_active,
        email,
        password,
        profile_id
      });

      res.status(201).json({
        success: true,
        message: "Përdoruesi u krijua me sukses!",
        data: newUser
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Përditëson fjalëkalimin e një përdoruesi nga paneli i Superuser-it 🔑
   * Maps to: PUT /api/users/:id/password
   */
  async updatePassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password || !password.trim()) {
        return res.status(400).json({
          success: false,
          message: "Fjalëkalimi nuk mund të jetë i zbrazët.",
        });
      }

      const result = await this.userService.updateUserPassword(id, password);

      res.status(200).json({
        success: true,
        message: "Fjalëkalimi i përdoruesit u përditësua me sukses!",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;