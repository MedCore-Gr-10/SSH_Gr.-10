import DirectorSystemOverviewService from "../../services/director-services/systemOverview.services.js";

class SystemOverviewController {
  async getSystemOverview(req, res, next) {
    try {
      const overview = await DirectorSystemOverviewService.getOverview(
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  }
}

export default SystemOverviewController;
