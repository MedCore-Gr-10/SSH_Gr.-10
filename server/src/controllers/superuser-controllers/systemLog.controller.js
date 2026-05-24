import logsService from "../../services/superuser-services/systemLogs.service.js";

class LogsController {
  async getSystemLogs(req, res, next) {
    try {
      const formattedLogs = await logsService.getAllLogs();
      
      return res.status(200).json({
        success: true,
        data: formattedLogs,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LogsController();