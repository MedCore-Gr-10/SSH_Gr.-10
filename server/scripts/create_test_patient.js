#!/usr/bin/env node
import bcrypt from "bcrypt";
import prisma from "../src/prisma.js";

async function main() {
  const seedId = "00000000-0000-0000-0000-000000000002";
  const username = "dev_patient";
  const email = "dev_patient@example.test";
  const password = "dev";
  const roleName = "patient";

  // ensure role exists
  let role = await prisma.roles.findFirst({ where: { role_name: roleName } });
  if (!role) {
    role = await prisma.roles.create({ data: { role_name: roleName } });
    console.log("Created role:", roleName);
  }

  // create or find user
  let user = await prisma.users.findUnique({ where: { username } });
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!user) {
    try {
      user = await prisma.users.create({
        data: {
          id: seedId,
          username,
          hash_password: hashedPassword,
          role_id: role.id,
          is_active: true,
        },
      });
      console.log("Created user:", username);
    } catch (err) {
      if (err.code === "P2002" && err.meta?.target?.includes("id")) {
        user = await prisma.users.create({
          data: {
            username,
            hash_password: hashedPassword,
            role_id: role.id,
            is_active: true,
          },
        });
        console.log("Created user with a generated UUID because the hardcoded seed ID already existed:", username);
      } else {
        throw err;
      }
    }
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

  console.log("\nPatient test credentials:");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log("You can now sign in with username/password at /auth/login.");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
