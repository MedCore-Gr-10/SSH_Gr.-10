import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import directorRoutes from "./routes/director.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import { initializeCronJobs, stopCronJobs } from "./services/cronJobs.service.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/director", directorRoutes);
app.use("/api/doctor", doctorRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const server = app.listen(3000, () => {
  console.log("Server running on port 3000");
  
  // Initialize cron jobs
  initializeCronJobs();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  stopCronJobs();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  stopCronJobs();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// async function createone() {
//   const users = await prisma.users.create({
//     data: {
//       email: "test@exampleeee.com",
//     },
//   });

//   console.log(users);
//   console.log("Done!");
//   console.log("Done!");
// }

// async function readall() {
//   const users = await prisma.users.findMany();
//   console.log(users);
// }

// readall();
// console.log("Done!");
