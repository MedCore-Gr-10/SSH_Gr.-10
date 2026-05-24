// routes/appointmentsMade.routes.js
import express from "express";
import AppointmentsMadeController from '../controllers/superuser-controllers/appointmentsMade.controller.js';

const router = express.Router();

// If you mount this at app.use('/api', appointmentsRoutes), 
// then this route handles GET /api/appointments-made
router.get('/appointments-made', AppointmentsMadeController.listAll);

export default router;