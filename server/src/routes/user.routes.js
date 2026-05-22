import express from "express";
import UserController from "../controllers/superuser-controllers/user.controller.js";

const router = express.Router();
const userController = new UserController();

router.get("/", (req, res, next) => userController.getAllUsers(req, res, next));
router.get("/:id", (req, res, next) => userController.getUserById(req, res, next));
router.put("/:id", (req, res, next) => userController.updateUser(req, res, next));
router.post("/", (req, res, next) => userController.createUser(req, res, next));
router.put('/:id/password', (req, res, next) => userController.updatePassword(req, res, next));

export default router;