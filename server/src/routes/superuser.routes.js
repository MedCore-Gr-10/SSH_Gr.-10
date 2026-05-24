import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import UserController from "../controllers/superuser-controllers/user.controller.js";
import ProfileController from "../controllers/superuser-controllers/profile.controller.js";
import manageSystemOverviewController from "../controllers/superuser-controllers/systemOverview.controller.js";
import logsController from "../controllers/superuser-controllers/systemLog.controller.js";
import ManageSpecializationsController from "../controllers/superuser-controllers/manageSpecialization.controller.js";
import ManageDepartmentsController from "../controllers/superuser-controllers/manageDepartments.controller.js";
import hospitalsController from "../controllers/superuser-controllers/hospital.controller.js";
import appointmentsMadeController from "../controllers/superuser-controllers/appointmentsMade.controller.js";

const router = express.Router();
const authMiddleware = new AuthMiddleware(new JwtService());
const roleMiddleware = new RoleMiddleware("superuser", "SUPERUSER");
const userController = new UserController();
const profileController = new ProfileController();
const manageSpecializationsController = new ManageSpecializationsController();
const manageDepartmentsController = new ManageDepartmentsController();

// Global interceptors for this router file
router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

/**
 * @swaggerIgnore
 * tags:
 * - name: Superuser Users
 * description: Core user management
 * - name: Superuser Profiles
 * description: Profile and identification tracking
 * - name: Superuser Specializations
 * description: Medical staff specialization taxonomies
 * - name: Superuser Departments
 * description: Hospital structural departments
 * - name: Superuser Hospitals
 * description: Registered clinics and facility units
 * - name: Superuser System
 * description: Log streams, diagnostics, and global overviews
 */

/* =========================================================================
   1. USER MANAGEMENT ENDPOINTS
   ========================================================================= */

/**
 * @swaggerIgnore
 * /api/superuser/users:
 * get:
 * summary: Retrieve all system users
 * tags: [Superuser Users]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200:
 * description: Success
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden
 */
router.get("/users", (req, res, next) => userController.getAllUsers(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/users:
 * post:
 * summary: Register a new system user account
 * tags: [Superuser Users]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [username, password, role]
 * properties:
 * username: { type: string, example: "admin_dr" }
 * password: { type: string, example: "SecurePass123!" }
 * role: { type: string, example: "doctor" }
 * responses:
 * 201:
 * description: Created
 */
router.post("/users", (req, res, next) => userController.createUser(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/users/{id}/password:
 * put:
 * summary: Change password for a user
 * tags: [Superuser Users]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [password]
 * properties:
 * password: { type: string, example: "NewStrongPassword456!" }
 * responses:
 * 200:
 * description: Password updated successfully
 */
router.put("/users/:id/password", (req, res, next) => userController.updatePassword(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/users/{id}:
 * get:
 * summary: Get user details by ID
 * tags: [Superuser Users]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Success
 */
router.get("/users/:id", (req, res, next) => userController.getUserById(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/users/{id}:
 * put:
 * summary: Update generic user attributes
 * tags: [Superuser Users]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * username: { type: string }
 * role: { type: string }
 * responses:
 * 200:
 * description: Updated
 */
router.put("/users/:id", (req, res, next) => userController.updateUser(req, res, next));

/* =========================================================================
   2. PROFILE MANAGEMENT ENDPOINTS (Static-first Precedence)
   ========================================================================= */

/**
 * @swaggerIgnore
 * /api/superuser/profiles/me:
 * get:
 * summary: Fetch current authenticated superuser profile
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200:
 * description: Success
 */
router.get("/profiles/me", (req, res, next) => profileController.getMe(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/profiles/me:
 * put:
 * summary: Modify current superuser profile details
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * first_name: { type: string }
 * last_name: { type: string }
 * responses:
 * 200:
 * description: Profile updated
 */
router.put("/profiles/me", (req, res, next) => profileController.updateMe(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/profiles/personal/{personal_no}:
 * get:
 * summary: Locate a general profile via unique personal identification token
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: personal_no
 * required: true
 * schema: { type: string }
 * responses:
 * 200:
 * description: Profile matched
 */
router.get("/profiles/personal/:personal_no", (req, res, next) => profileController.getByPersonalNo(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/profiles/director/{personal_no}:
 * get:
 * summary: Locate a clinic director's profile by personal identification number
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: personal_no
 * required: true
 * schema: { type: string }
 * responses:
 * 200:
 * description: Director matching registration found
 */
router.get("/profiles/director/:personal_no", (req, res, next) => profileController.getDirectorByPersonalNo(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/profiles:
 * get:
 * summary: Read list of all profiles
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200:
 * description: Success
 */
router.get("/profiles", (req, res, next) => profileController.getAllProfiles(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/profiles:
 * post:
 * summary: Establish a profile record binded to an unassigned user
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [user_id, first_name, last_name, personal_no]
 * properties:
 * user_id: { type: integer }
 * first_name: { type: string }
 * last_name: { type: string }
 * personal_no: { type: string }
 * responses:
 * 201:
 * description: Profile setup completed
 */
router.post("/profiles", (req, res, next) => profileController.createProfile(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/profiles/{id}:
 * get:
 * summary: Access distinct profile file by structural key ID
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Success
 */
router.get("/profiles/:id", (req, res, next) => profileController.getProfileById(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/profiles/{id}:
 * put:
 * summary: Overwrite designated details on an existing user profile record
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * first_name: { type: string }
 * last_name: { type: string }
 * responses:
 * 200:
 * description: Changes saved
 */
router.put("/profiles/:id", (req, res, next) => profileController.updateProfile(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/profiles/{id}:
 * delete:
 * summary: Delete profile index record
 * tags: [Superuser Profiles]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Profile successfully removed
 */
router.delete("/profiles/:id", (req, res, next) => profileController.deleteProfile(req, res, next));

/* =========================================================================
   3. SPECIALIZATION MANAGEMENT ENDPOINTS
   ========================================================================= */

/**
 * @swaggerIgnore
 * /api/superuser/specializations:
 * get:
 * summary: Request system medical specialization catalogs
 * tags: [Superuser Specializations]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200:
 * description: Success
 */
router.get("/specializations", (req, res, next) => manageSpecializationsController.getAll(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/specializations:
 * post:
 * summary: Append a new specialized field option to medical categorizations
 * tags: [Superuser Specializations]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [name]
 * properties:
 * name: { type: string, example: "Neurology" }
 * responses:
 * 201:
 * description: Specialization item cataloged
 */
router.post("/specializations", (req, res, next) => manageSpecializationsController.create(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/specializations/{id}:
 * put:
 * summary: Edit specialized option denomination field
 * tags: [Superuser Specializations]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [name]
 * properties:
 * name: { type: string, example: "Neuro-Oncology" }
 * responses:
 * 200:
 * description: Modification effective
 */
router.put("/specializations/:id", (req, res, next) => manageSpecializationsController.update(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/specializations/{id}:
 * delete:
 * summary: Drop a medical classification option from application database registers
 * tags: [Superuser Specializations]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Specialization dropped from taxonomy lists
 */
router.delete("/specializations/:id", (req, res, next) => manageSpecializationsController.delete(req, res, next));

/* =========================================================================
   4. DEPARTMENT ROUTING MANAGEMENT (Static-first Precedence)
   ========================================================================= */

/**
 * @swaggerIgnore
 * /api/superuser/departments:
 * get:
 * summary: Read comprehensive listing of departments
 * tags: [Superuser Departments]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200:
 * description: List delivered
 * post:
 * summary: Instantiate a new administrative healthcare division
 * tags: [Superuser Departments]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [name]
 * properties:
 * name: { type: string, example: "Emergency Medicine" }
 * responses:
 * 201:
 * description: Department entity generated
 */
router
  .route("/departments")
  .get((req, res, next) => manageDepartmentsController.getAll(req, res, next))
  .post((req, res, next) => manageDepartmentsController.create(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/departments/{id}/hospitals:
 * get:
 * summary: Map out hospitals housing a given department type ID
 * tags: [Superuser Departments]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Connected facility listings retrieved
 */
router.get("/departments/:id/hospitals", (req, res, next) => manageDepartmentsController.getHospitals(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/departments/{id}/doctors:
 * get:
 * summary: Discover active medical practitioners within an assigned department scope ID
 * tags: [Superuser Departments]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Staff roster array fetched
 */
router.get("/departments/:id/doctors", (req, res, next) => manageDepartmentsController.getDoctors(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/departments/{id}:
 * get:
 * summary: Fetch singular department asset profile metadata by index key ID
 * tags: [Superuser Departments]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Single item data profile payload returned
 * put:
 * summary: Adjust structural characteristics context on targeted department row entity
 * tags: [Superuser Departments]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name: { type: string }
 * responses:
 * 200:
 * description: Properties saved
 * delete:
 * summary: Tear down structural tracking division record index
 * tags: [Superuser Departments]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Department wiped out from schema tracking maps
 */
router
  .route("/departments/:id")
  .get((req, res, next) => manageDepartmentsController.getById(req, res, next))
  .put((req, res, next) => manageDepartmentsController.update(req, res, next))
  .delete((req, res, next) => manageDepartmentsController.delete(req, res, next));

/* =========================================================================
   5. HOSPITAL ENTITY MANAGEMENT
   ========================================================================= */

/**
 * @swaggerIgnore
 * /api/superuser/hospitals:
 * post:
 * summary: Register a new primary facility unit complex to structural database context
 * tags: [Superuser Hospitals]
 * security: [{ bearerAuth: [] }]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [name, address]
 * properties:
 * name: { type: string, example: "City Central Clinic" }
 * address: { type: string, example: "456 Healthcare Blvd" }
 * responses:
 * 201:
 * description: Clinic registry setup approved
 * get:
 * summary: View inventory ledger tracing all valid hospitals
 * tags: [Superuser Hospitals]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200:
 * description: Inventory trace returned
 */
router.post("/hospitals", (req, res) => hospitalsController.create(req, res));
router.get("/hospitals", (req, res) => hospitalsController.findAll(req, res));

/**
 * @swaggerIgnore
 * /api/superuser/hospitals/{id}:
 * get:
 * summary: Extract profile metadata concerning a physical hospital site ID
 * tags: [Superuser Hospitals]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Clinic unit metrics derived
 * put:
 * summary: Modify operational tracking fields context mapping on a clinic facility
 * tags: [Superuser Hospitals]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name: { type: string }
 * address: { type: string }
 * responses:
 * 200:
 * description: Target data array rewritten
 * delete:
 * summary: Offboard facility node records context trace matrix completely
 * tags: [Superuser Hospitals]
 * security: [{ bearerAuth: [] }]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * responses:
 * 200:
 * description: Removed
 */
router.get("/hospitals/:id", (req, res) => hospitalsController.findById(req, res));
router.put("/hospitals/:id", (req, res) => hospitalsController.update(req, res));
router.delete("/hospitals/:id", (req, res) => hospitalsController.delete(req, res));

/* =========================================================================
   6. GLOBAL SYSTEM OPERATIONS & ANALYSIS DIAGNOSTICS
   ========================================================================= */

/**
 * @swaggerIgnore
 * /api/superuser/system-overview:
 * get:
 * summary: Aggregate real-time diagnostic indicators monitoring application state
 * tags: [Superuser System]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200:
 * description: Analytics overview context delivered
 */
router.get("/system-overview", (req, res) => manageSystemOverviewController.getOverview(req, res));

/**
 * @swaggerIgnore
 * /api/superuser/system-logs:
 * get:
 * summary: Retrieve formatted global system logs
 * description: Returns a descending chronological sequence of all system logs with resolved usernames.
 * tags:
 * - Superuser System
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Log array successfully generated
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * data:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: integer, example: 42 }
 * timestamp: { type: string, format: date-time }
 * username: { type: string, example: "doctor_smith" }
 * action: { type: string, example: "View patient history" }
 * details: { type: string, example: "Routine health check follow-up" }
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden
 * 500:
 * description: Database error
 */
router.get("/system-logs", (req, res, next) => logsController.getSystemLogs(req, res, next));

/**
 * @swaggerIgnore
 * /api/superuser/appointments-made:
 * get:
 * summary: Inspect global metrics covering all booking objects recorded system-wide
 * tags: [Superuser System]
 * security: [{ bearerAuth: [] }]
 * responses:
 * 200:
 * description: Appointment audit listings extracted
 */
router.get("/appointments-made", (req, res) => appointmentsMadeController.listAll(req, res));

export default router;
