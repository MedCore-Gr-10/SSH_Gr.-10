import express from "express";
import ProfileController from "../controllers/profile.controller.js";

const router = express.Router();
const profileController = new ProfileController();

router.get("/", (req, res, next) =>
  profileController.getAllProfiles(req, res, next)
);

router.get("/:id", (req, res, next) =>
  profileController.getProfileById(req, res, next)
);

export default router;