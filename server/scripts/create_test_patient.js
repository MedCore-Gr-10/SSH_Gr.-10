#!/usr/bin/env node
import prisma from "../src/prisma.js";
import { JwtService } from "../src/utils/jwt.js";

async function main() {
  const seedId = "00000000-0000-0000-0000-000000000002";
  const username = "dev_patient";
  const email = "dev_patient@example.test";
  const roleName = "patient";

  // ensure role exists
  let role = await prisma.roles.findFirst({ where: { role_name: roleName } });
  if (!role) {
    role = await prisma.roles.create({ data: { role_name: roleName } });
    console.log("Created role:", roleName);
  }

  // create or find user
  let user = await prisma.users.findUnique({ where: { username } });
  if (!user) {
    user = await prisma.users.create({
      data: {
        id: seedId,
        username,
        hash_password: "dev",
        role_id: role.id,
        is_active: true,
      }
    });
    console.log("Created user:", username);
  } else {
    console.log("User exists:", username);
  }

  // attach a profile and email if missing
  const existingProfile = await prisma.users_profiles.findFirst({ where: { user_id: user.id } });
  if (!existingProfile) {
    const profile = await prisma.profiles.create({ data: { first_name: "Dev", last_name: "Patient" } });
    await prisma.users_profiles.create({ data: { user_id: user.id, profile_id: profile.id, email } });
    console.log("Attached profile and email to user");
  }

  // ensure a hospital exists and link patient
  let hospital = await prisma.hospitals.findFirst();
  if (!hospital) {
    hospital = await prisma.hospitals.create({ data: { hospital_name: "Dev Hospital", hospital_address: "123 Dev Lane", email: "dev@hospital.test" } });
    console.log("Created hospital", hospital.id);
  }

  const patientHospital = await prisma.patients_hospitals.findFirst({ where: { patient_id: user.id } });
  if (!patientHospital) {
    await prisma.patients_hospitals.create({ data: { patient_id: user.id, hospital_id: hospital.id } });
    console.log("Linked patient to hospital");
  }

  // generate token
  const jwtService = new JwtService(process.env.JWT_SECRET || "devsecret");
  const token = jwtService.generateToken({ user_id: user.id, hospital_id: hospital.id, role: "patient" });

  console.log("\nCOPY THIS TOKEN into your browser localStorage under key 'token':\n\n" + token + "\n");

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
