import prisma from "./prisma.js";
import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
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
