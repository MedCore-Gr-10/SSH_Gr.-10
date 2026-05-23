import { Router } from "express";
import hospitalsController from "../controllers/superuser-controllers/hospital.controller.js";

const router = Router();

// Thirrja në këtë formë garanton që konteksti i klasës të mos prishet
router.post("/", (req, res) => hospitalsController.create(req, res));
router.get("/", (req, res) => hospitalsController.findAll(req, res));
router.get("/:id", (req, res) => hospitalsController.findById(req, res));
router.put("/:id", (req, res) => hospitalsController.update(req, res));
router.delete("/:id", (req, res) => hospitalsController.delete(req, res));

export default router;