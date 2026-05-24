import logsRepository from "../../repositories/logs.repository.js";

class LogsService {
  /**
   * Fetches all audit logs and formats them to clean DTO structures
   */
  async getAllLogs() {
    const logs = await logsRepository.findAll();
    
    return logs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      username: log.user?.username || log.user_id || "System/Unknown",
      action: log.action,
      details: log.reason || "",
    }));
  }
}

export default new LogsService();