import express from "express";
import ProfileController from "../controllers/superuser-controllers/profile.controller.js";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const profileController = new ProfileController();
const authMiddleware = new AuthMiddleware(new JwtService());

router.use((req, res, next) => authMiddleware.handle(req, res, next));

router.get("/me", (req, res, next) =>
  profileController.getMe(req, res, next)
);

router.put("/me", (req, res, next) =>
  profileController.updateMe(req, res, next)
);

export default router;
