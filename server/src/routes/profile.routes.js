import express from "express";
import ProfileController from "../controllers/superuser-controllers/profile.controller.js";

const router = express.Router();
const profileController = new ProfileController();

router.get("/personal/:personal_no", (req, res, next) => 
  profileController.getByPersonalNo(req, res, next)
);

// Merr të gjitha profilet -> GET /api/profiles
router.get("/", (req, res, next) =>
  profileController.getAllProfiles(req, res, next)
);

// Merr një profil sipas ID-së -> GET /api/profiles/:id
router.get("/:id", (req, res, next) =>
  profileController.getProfileById(req, res, next)
);

// Krijon një profil të ri -> POST /api/profiles 🚀
router.post("/", (req, res, next) => 
  profileController.createProfile(req, res, next)
);

// Përditëson profilin ekzistues -> PUT /api/profiles/:id 🛠️
router.put("/:id", (req, res, next) =>
  profileController.updateProfile(req, res, next)
);

// Fshin një profil sipas ID-së -> DELETE /api/profiles/:id 🗑️
router.delete("/:id", (req, res, next) =>
  profileController.deleteProfile(req, res, next)
);

export default router;