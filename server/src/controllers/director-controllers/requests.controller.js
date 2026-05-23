import DirectorRequestsService from "../../services/director-services/requests.services.js";

class RequestsController {
  async createRequest(req, res, next) {
    try {
      const created = await DirectorRequestsService.createRequest(
        req.body,
        req.user.user_id,
        req.user.hospital_id
      );
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async getRecipients(req, res, next) {
    try {
      const data = await DirectorRequestsService.getRequestRecipients(
        req.user.user_id,
        req.user.hospital_id
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getRequests(req, res, next) {
    try {
      const data = await DirectorRequestsService.getRequestsHistory(req.user.user_id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default RequestsController;
