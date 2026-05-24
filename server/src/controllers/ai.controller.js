import aiService from "../services/ai.service.js";

class AiController {
  async chat(req, res, next) {
    try {
      const result = await aiService.chat(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new AiController();
