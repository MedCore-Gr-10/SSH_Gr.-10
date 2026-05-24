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
import specializationsRepository from "../repositories/specializations.repository.js";

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

router.get("/specializations", async (req, res, next) => {
  try {
    const specializations = await specializationsRepository.findAll();
    res.status(200).json({
      success: true,
      data: specializations.map((specialization) => ({
        id: specialization.id,
        specialization_name: specialization.specialization_name,
        total_doctors: specialization._count?.staff_specializations ?? 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/director/patients:
 *   get:
 *     summary: Get all patients
 *     description: Returns all patients from the director hospital
 *     tags:
 *       - Director Patients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/patients", (req, res, next) => patientController.getPatients(req, res, next));
/**
 * @swagger
 * /api/director/patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags:
 *       - Director Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
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
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "+38344111222"
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         description: Patient not found
 */
router.put("/patients/:id", (req, res, next) => patientController.updatePatient(req, res, next));
/**
 * @swagger
 * /api/director/patients/{id}:
 *   delete:
 *     summary: Delete patient
 *     tags:
 *       - Director Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 */
router.delete("/patients/:id", (req, res, next) => patientController.deletePatient(req, res, next));

/**
 * @swagger
 * /api/director/staff:
 *   get:
 *     summary: Get all staff members
 *     description: Returns all staff members from the director hospital
 *     tags:
 *       - Director Staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/staff", (req, res, next) => staffController.getStaff(req, res, next));
/**
 * @swagger
 * /api/director/staff:
 *   post:
 *     summary: Create a new staff member
 *     description: Creates a new staff member in the hospital
 *     tags:
 *       - Director Staff
 *     security:
 *       - bearerAuth: []
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
 *               email:
 *                 type: string
 *                 example: john.doe@medcore.com
 *               phone:
 *                 type: string
 *                 example: "+38344111222"
 *               role:
 *                 type: string
 *                 example: DOCTOR
 *               departmentId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/staff", (req, res, next) => staffController.createStaff(req, res, next));
/**
 * @swagger
 * /api/director/staff/{id}:
 *   put:
 *     summary: Update staff member
 *     description: Updates an existing staff member
 *     tags:
 *       - Director Staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
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
 *               email:
 *                 type: string
 *                 example: jane.smith@medcore.com
 *               phone:
 *                 type: string
 *                 example: "+38349123456"
 *               role:
 *                 type: string
 *                 example: NURSE
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 *       404:
 *         description: Staff member not found
 */
router.put("/staff/:id", (req, res, next) => staffController.updateStaff(req, res, next));
/**
 * @swagger
 * /api/director/staff/{id}:
 *   delete:
 *     summary: Delete staff member
 *     description: Deletes a staff member from the hospital
 *     tags:
 *       - Director Staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff member deleted successfully
 *       404:
 *         description: Staff member not found
 */
router.delete("/staff/:id", (req, res, next) => staffController.deleteStaff(req, res, next));

/**
 * @swagger
 * /api/director/staff-schedules:
 *   get:
 *     summary: Get all staff schedules
 *     description: Returns all working schedules for hospital staff
 *     tags:
 *       - Director Staff Schedules
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff schedules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/staff-schedules", (req, res, next) => staffScheduleController.getStaffSchedules(req, res, next));
/**
 * @swagger
 * /api/director/staff-schedules:
 *   post:
 *     summary: Create a staff schedule
 *     description: Creates a new working schedule for a staff member
 *     tags:
 *       - Director Staff Schedules
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffId:
 *                 type: integer
 *                 example: 5
 *               dayOfWeek:
 *                 type: string
 *                 example: Monday
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "16:00"
 *               departmentId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Staff schedule created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/staff-schedules", (req, res, next) => staffScheduleController.createStaffSchedule(req, res, next));
/**
 * @swagger
 * /api/director/staff-schedules/{id}:
 *   put:
 *     summary: Update staff schedule
 *     description: Updates an existing staff working schedule
 *     tags:
 *       - Director Staff Schedules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek:
 *                 type: string
 *                 example: Tuesday
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "17:00"
 *     responses:
 *       200:
 *         description: Staff schedule updated successfully
 *       404:
 *         description: Staff schedule not found
 */
router.put("/staff-schedules/:id", (req, res, next) => staffScheduleController.updateStaffSchedule(req, res, next));
/**
 * @swagger
 * /api/director/staff-schedules/{id}:
 *   delete:
 *     summary: Delete staff schedule
 *     description: Deletes a staff working schedule
 *     tags:
 *       - Director Staff Schedules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff schedule ID
 *     responses:
 *       200:
 *         description: Staff schedule deleted successfully
 *       404:
 *         description: Staff schedule not found
 */
router.delete("/staff-schedules/:id", (req, res, next) => staffScheduleController.deleteStaffSchedule(req, res, next));

/**
 * @swagger
 * /api/director/appointments:
 *   get:
 *     summary: Get all appointments
 *     description: Returns all appointments for the director hospital
 *     tags:
 *       - Director Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/appointments", (req, res, next) => appointmentsController.getAppointments(req, res, next));
/**
 * @swagger
 * /api/director/appointments/slots:
 *   get:
 *     summary: Get available appointment slots
 *     description: Returns available booking slots for appointments
 *     tags:
 *       - Director Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment slots retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/appointments/slots", (req, res, next) => appointmentsController.getAppointmentSlots(req, res, next));
/**
 * @swagger
 * /api/director/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     description: Updates an existing appointment
 *     tags:
 *       - Director Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: integer
 *                 example: 12
 *               doctorId:
 *                 type: integer
 *                 example: 5
 *               appointmentDate:
 *                 type: string
 *                 example: "2026-05-25"
 *               appointmentTime:
 *                 type: string
 *                 example: "14:30"
 *               status:
 *                 type: string
 *                 example: CONFIRMED
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 */
router.put("/appointments/:id", (req, res, next) => appointmentsController.updateAppointment(req, res, next));
/**
 * @swagger
 * /api/director/appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     description: Deletes an appointment from the system
 *     tags:
 *       - Director Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */
router.delete("/appointments/:id", (req, res, next) => appointmentsController.deleteAppointment(req, res, next));

/**
 * @swagger
 * /api/director/appointments/templates:
 *   get:
 *     summary: Get all appointment templates
 *     description: Returns all appointment templates for the hospital
 *     tags:
 *       - Director Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment templates retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/appointments/templates", (req, res, next) => appointmentsTemplatesController.listTemplates(req, res, next));
/**
 * @swagger
 * /api/director/appointments/templates:
 *   post:
 *     summary: Create appointment template
 *     description: Creates a new appointment template
 *     tags:
 *       - Director Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: General Checkup
 *               duration:
 *                 type: integer
 *                 example: 30
 *               description:
 *                 type: string
 *                 example: Standard medical consultation appointment
 *               departmentId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Appointment template created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/appointments/templates", (req, res, next) => appointmentsTemplatesController.createTemplate(req, res, next));
/**
 * @swagger
 * /api/director/appointments/templates/{id}:
 *   put:
 *     summary: Update appointment template
 *     description: Updates an existing appointment template
 *     tags:
 *       - Director Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Specialist Consultation
 *               duration:
 *                 type: integer
 *                 example: 45
 *               description:
 *                 type: string
 *                 example: Extended specialist appointment
 *     responses:
 *       200:
 *         description: Appointment template updated successfully
 *       404:
 *         description: Appointment template not found
 */
router.put("/appointments/templates/:id", (req, res, next) => appointmentsTemplatesController.updateTemplate(req, res, next));
/**
 * @swagger
 * /api/director/appointments/templates/{id}:
 *   delete:
 *     summary: Delete appointment template
 *     description: Deletes an appointment template from the system
 *     tags:
 *       - Director Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment template ID
 *     responses:
 *       200:
 *         description: Appointment template deleted successfully
 *       404:
 *         description: Appointment template not found
 */
router.delete("/appointments/templates/:id", (req, res, next) => appointmentsTemplatesController.deleteTemplate(req, res, next));

/**
 * @swagger
 * /api/director/departments:
 *   get:
 *     summary: Get all departments
 *     description: Returns all departments from the director hospital
 *     tags:
 *       - Director Departments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/departments", (req, res, next) => departmentsController.getDepartments(req, res, next));
router.get("/departments/catalog", (req, res, next) => departmentsController.getDepartmentCatalog(req, res, next));
/**
 * @swagger
 * /api/director/departments:
 *   post:
 *     summary: Activate an existing department
 *     description: Links an existing superuser-created department to the director hospital
 *     tags:
 *       - Director Departments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Department activated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/departments", (req, res, next) => departmentsController.createDepartment(req, res, next));
/**
 * @swagger
 * /api/director/departments/{id}:
 *   put:
 *     summary: Update department
 *     description: Updates an existing department
 *     tags:
 *       - Director Departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Neurology
 *               description:
 *                 type: string
 *                 example: Department focused on nervous system disorders
 *               floor:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 */
router.put("/departments/:id", (req, res, next) => departmentsController.updateDepartment(req, res, next));
/**
 * @swagger
 * /api/director/departments/{id}:
 *   delete:
 *     summary: Delete department
 *     description: Deletes a department from the hospital
 *     tags:
 *       - Director Departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 */
router.delete("/departments/:id", (req, res, next) => departmentsController.deleteDepartment(req, res, next));

/**
 * @swagger
 * /api/director/system-overview:
 *   get:
 *     summary: Get system overview
 *     description: Returns aggregated system statistics and overview data for the director dashboard
 *     tags:
 *       - Director System Overview
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System overview retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/system-overview", (req, res, next) => systemOverviewController.getSystemOverview(req, res, next));
/**
 * @swagger
 * /api/director/requests/recipients:
 *   get:
 *     summary: Get request recipients
 *     description: Returns a list of available recipients for sending requests (staff, departments, or users depending on role)
 *     tags:
 *       - Director Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recipients retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/requests/recipients", (req, res, next) => requestsController.getRecipients(req, res, next));
/**
 * @swagger
 * /api/director/requests:
 *   get:
 *     summary: Get all requests
 *     description: Returns all requests created within the hospital for the director view
 *     tags:
 *       - Director Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/requests", (req, res, next) => requestsController.getRequests(req, res, next));
/**
 * @swagger
 * /api/director/requests:
 *   post:
 *     summary: Create a new request
 *     description: Allows director to create a request to staff, departments, or system users
 *     tags:
 *       - Director Requests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Equipment request
 *               message:
 *                 type: string
 *                 example: We need new MRI equipment for department 2
 *               recipientId:
 *                 type: integer
 *                 example: 5
 *               recipientType:
 *                 type: string
 *                 example: STAFF
 *               priority:
 *                 type: string
 *                 example: HIGH
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/requests", (req, res, next) => requestsController.createRequest(req, res, next));

export default router;
