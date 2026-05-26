import userService from "../../services/superuser-services/user.service.js";

class UserController {

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();

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
      const user = await userService.getUserById(req.params.id);

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
      const { username, role_id, is_active, email, hospital_id, department_id, specialization_id } = req.body;

      const updatedUser = await userService.updateUser(id, {
        username,
        role_id,
        is_active,
        email,
        hospital_id,
        department_id,     
        specialization_id,
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
      const { username, role_id, is_active, email, password, profile_id, hospital_id, department_id, specialization_id } = req.body;

      const newUser = await userService.createUser({
        username,
        role_id: parseInt(role_id, 10),
        is_active,
        email,
        hospital_id,
        password,
        profile_id,
        department_id,      
        specialization_id   
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

      const result = await userService.updateUserPassword(id, password);

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
