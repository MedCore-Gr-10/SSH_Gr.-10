import ManageSpecializationsService from "../../services/superuser-services/manageSpecialization.service.js";

class ManageSpecializationsController {
  constructor() {
    this.manageSpecializationsService = new ManageSpecializationsService();
  }

  /**
   * GET /specializations
   * Lists all specializations
   */
  async getAll(req, res) {
    try {
      const specializations = await this.manageSpecializationsService.listSpecializations();
      return res.status(200).json({
        success: true,
        data: specializations,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve specializations.",
        error: error.message,
      });
    }
  }

  /**
   * POST /specializations
   * Creates a new specialization
   */
  async create(req, res) {
    try {
      const { specialization_name } = req.body;
      
      const newSpecialization = await this.manageSpecializationsService.createSpecialization({
        specialization_name,
      });

      return res.status(201).json({
        success: true,
        message: "Specialization created successfully.",
        data: newSpecialization,
      });
    } catch (error) {
      // Differentiate between user input errors vs server errors
      const statusCode = error.message.includes("required") || error.message.includes("exists") ? 400 : 500;
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /specializations/:id
   * Modifies an existing specialization
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { specialization_name } = req.body;

      const updatedSpecialization = await this.manageSpecializationsService.modifySpecialization(id, {
        specialization_name,
      });

      return res.status(200).json({
        success: true,
        message: "Specialization updated successfully.",
        data: updatedSpecialization,
      });
    } catch (error) {
      let statusCode = 500;
      
      if (error.message.includes("not found")) {
        statusCode = 404;
      } else if (error.message.includes("required") || error.message.includes("empty") || error.message.includes("uses this name")) {
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default ManageSpecializationsController;