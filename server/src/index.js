import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profile.routes.js";
import directorRoutes from "./routes/director.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import nurseRoutes from "./routes/nurse.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import requestsRoutes from "./routes/requests.routes.js";
import superuserRoutes from "./routes/superuser.routes.js";

import {
  initializeCronJobs,
  stopCronJobs,
} from "./services/cronJobs.service.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/director", directorRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/nurse", nurseRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/superuser", superuserRoutes);
app.use("/api/requests", requestsRoutes);
<<<<<<< HEAD
app.use("/api/system-overview", systemOverviewRoutes);
app.use("/api/system-logs", systemLogsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/ai", aiRoutes);
=======
>>>>>>> f694ddebf8503d54b71b1e4c96e9d90c99387f59

// 404 handler MUST be last
app.use("/api", (req, res) => {
  res
    .status(404)
    .json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || err.statusCode || 500)
    .json({ error: err.message || "Internal server error" });
});

const server = app.listen(3000, () => {
  console.log("Server running on port 3000");

  initializeCronJobs();
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  stopCronJobs();
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  stopCronJobs();
  server.close(() => process.exit(0));
});
