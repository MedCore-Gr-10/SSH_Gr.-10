import express from "express";
import UserController from "../controllers/superuser-controllers/user.controller.js";

const router = express.Router();
const userController = new UserController();

router.get("/", (req, res, next) =>
  userController.getAllUsers(req, res, next)
);

router.get("/:id", (req, res, next) =>
  userController.getUserById(req, res, next)
);

export default router;