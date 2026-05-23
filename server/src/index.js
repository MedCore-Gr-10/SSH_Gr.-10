import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import directorRoutes from "./routes/director.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import nurseRoutes from "./routes/nurse.routes.js";
import manageSpecializationRoutes from "./routes/manageSpecialization.routes.js";
import manageDepartmentsRouter from "./routes/manageDepartments.routes.js"; 
import hospitalsRoutes from "./routes/hospital.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/specializations", manageSpecializationRoutes);
app.use("/api/director", directorRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/nurse", nurseRoutes);
app.use("/api/departments", manageDepartmentsRouter); 
app.use("/api/hospitals", hospitalsRoutes);

app.use("/api", (req, res) => {
  res
    .status(404)
    .json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});