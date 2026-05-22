import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { HospitalMiddleware } from "../middlewares/hospitalMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import PatientController from "../controllers/director-controllers/patient.controller.js";
import StaffController from "../controllers/director-controllers/staff.controller.js";
import StaffScheduleController from "../controllers/director-controllers/staffSchedule.controller.js";
import AppointmentsController from "../controllers/director-controllers/appointments.controller.js";
import AppointmentsTemplatesController from "../controllers/director-controllers/appointmentsTemplates.controller.js";
import DepartmentsController from "../controllers/director-controllers/departments.controller.js";
import SystemOverviewController from "../controllers/director-controllers/systemOverview.controller.js";
import RequestsController from "../controllers/director-controllers/requests.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const hospitalMiddleware = new HospitalMiddleware();
const roleMiddleware = new RoleMiddleware("director", "DIRECTOR");
const patientController = new PatientController();
const staffController = new StaffController();
const staffScheduleController = new StaffScheduleController();
const appointmentsController = new AppointmentsController();
const appointmentsTemplatesController = new AppointmentsTemplatesController();
const departmentsController = new DepartmentsController();
const systemOverviewController = new SystemOverviewController();
const requestsController = new RequestsController();

router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => hospitalMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

router.get("/patients", (req, res, next) => patientController.getPatients(req, res, next));
router.put("/patients/:id", (req, res, next) => patientController.updatePatient(req, res, next));
router.delete("/patients/:id", (req, res, next) => patientController.deletePatient(req, res, next));

router.get("/staff", (req, res, next) => staffController.getStaff(req, res, next));
router.post("/staff", (req, res, next) => staffController.createStaff(req, res, next));
router.put("/staff/:id", (req, res, next) => staffController.updateStaff(req, res, next));
router.delete("/staff/:id", (req, res, next) => staffController.deleteStaff(req, res, next));

router.get("/staff-schedules", (req, res, next) => staffScheduleController.getStaffSchedules(req, res, next));
router.post("/staff-schedules", (req, res, next) => staffScheduleController.createStaffSchedule(req, res, next));
router.put("/staff-schedules/:id", (req, res, next) => staffScheduleController.updateStaffSchedule(req, res, next));
router.delete("/staff-schedules/:id", (req, res, next) => staffScheduleController.deleteStaffSchedule(req, res, next));

router.get("/appointments", (req, res, next) => appointmentsController.getAppointments(req, res, next));
router.get("/appointments/slots", (req, res, next) => appointmentsController.getAppointmentSlots(req, res, next));
router.put("/appointments/:id", (req, res, next) => appointmentsController.updateAppointment(req, res, next));
router.delete("/appointments/:id", (req, res, next) => appointmentsController.deleteAppointment(req, res, next));

router.get("/appointments/templates", (req, res, next) => appointmentsTemplatesController.listTemplates(req, res, next));
router.post("/appointments/templates", (req, res, next) => appointmentsTemplatesController.createTemplate(req, res, next));
router.put("/appointments/templates/:id", (req, res, next) => appointmentsTemplatesController.updateTemplate(req, res, next));
router.delete("/appointments/templates/:id", (req, res, next) => appointmentsTemplatesController.deleteTemplate(req, res, next));

router.get("/departments", (req, res, next) => departmentsController.getDepartments(req, res, next));
router.post("/departments", (req, res, next) => departmentsController.createDepartment(req, res, next));
router.put("/departments/:id", (req, res, next) => departmentsController.updateDepartment(req, res, next));
router.delete("/departments/:id", (req, res, next) => departmentsController.deleteDepartment(req, res, next));

router.get("/system-overview", (req, res, next) => systemOverviewController.getSystemOverview(req, res, next));
router.get("/requests", (req, res, next) => requestsController.getRequests(req, res, next));
router.post("/requests", (req, res, next) => requestsController.createRequest(req, res, next));

export default router;
