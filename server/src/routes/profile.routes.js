import express from "express";
import ProfileController from "../controllers/superuser-controllers/profile.controller.js";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const profileController = new ProfileController();
const authMiddleware = new AuthMiddleware(new JwtService());

router.get("/me", (req, res, next) => authMiddleware.handle(req, res, next), (req, res, next) =>
  profileController.getMe(req, res, next)
);

router.put("/me", (req, res, next) => authMiddleware.handle(req, res, next), (req, res, next) =>
  profileController.updateMe(req, res, next)
);

/**
 * @swagger
 * /api/profiles/personal/{personal_no}:
 *   get:
 *     summary: Get profile by personal number
 *     description: Returns a profile using the personal identification number
 *     tags:
 *       - Profiles
 *     parameters:
 *       - in: path
 *         name: personal_no
 *         required: true
 *         schema:
 *           type: string
 *         description: Personal identification number
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get("/personal/:personal_no", (req, res, next) => 
  profileController.getByPersonalNo(req, res, next)
);

router.get("/director/:personal_no", (req, res, next) => 
  profileController.getDirectorByPersonalNo(req, res, next)
);

// Merr të gjitha profilet -> GET /api/profiles
/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Get all profiles
 *     description: Returns all profiles in the system
 *     tags:
 *       - Profiles
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", (req, res, next) =>
  profileController.getAllProfiles(req, res, next)
);

// Merr një profil sipas ID-së -> GET /api/profiles/:id
/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     description: Returns a single profile by its ID
 *     tags:
 *       - Profiles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get("/:id", (req, res, next) =>
  profileController.getProfileById(req, res, next)
);

// Krijon një profil të ri -> POST /api/profiles 🚀
/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Create profile
 *     description: Creates a new user profile
 *     tags:
 *       - Profiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               personal_no:
 *                 type: string
 *                 example: "1234567890"
 *               phone:
 *                 type: string
 *                 example: "+38344111222"
 *               address:
 *                 type: string
 *                 example: Prishtina, Kosovo
 *               birthDate:
 *                 type: string
 *                 example: "1999-05-10"
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", (req, res, next) => 
  profileController.createProfile(req, res, next)
);

// Përditëson profilin ekzistues -> PUT /api/profiles/:id 🛠️
/**
 * @swagger
 * /api/profiles/{id}:
 *   put:
 *     summary: Update profile
 *     description: Updates an existing user profile
 *     tags:
 *       - Profiles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               phone:
 *                 type: string
 *                 example: "+38349123456"
 *               address:
 *                 type: string
 *                 example: Gjakove, Kosovo
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 */
router.put("/:id", (req, res, next) =>
  profileController.updateProfile(req, res, next)
);

// Fshin një profil sipas ID-së -> DELETE /api/profiles/:id 🗑️
/**
 * @swagger
 * /api/profiles/{id}:
 *   delete:
 *     summary: Delete profile
 *     description: Deletes a user profile from the system
 *     tags:
 *       - Profiles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 */
router.delete("/:id", (req, res, next) =>
  profileController.deleteProfile(req, res, next)
);

export default router;
