import systemOverviewService from "../../services/superuser-services/systemOverview.service.js";

class SystemOverviewController {
  getOverview = async (req, res) => {
    try {
      const stats = await systemOverviewService.getGlobalStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Gabim gjatë gjenerimit të statistikave të sistemit.",
        error: error.message
      });
    }
  };
}

export default new SystemOverviewController();