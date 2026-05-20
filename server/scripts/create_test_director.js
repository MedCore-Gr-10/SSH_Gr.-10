#!/usr/bin/env node
import prisma from "../src/prisma.js";
import { JwtService } from "../src/utils/jwt.js";

async function main() {
  const seedId = "00000000-0000-0000-0000-000000000001";
  const username = "dev_director";
  const email = "dev_director@example.test";
  const roleName = "director";

  // ensure roles exist
  let role = await prisma.roles.findFirst({ where: { role_name: roleName } });
  if (!role) {
    role = await prisma.roles.create({ data: { role_name: roleName } });
    console.log("Created role:", roleName);
  }

  // ensure patient role exists
  let patientRole = await prisma.roles.findFirst({ where: { role_name: "patient" } });
  if (!patientRole) {
    patientRole = await prisma.roles.create({ data: { role_name: "patient" } });
    console.log("Created role: patient");
  }

  // create or find user
  let user = await prisma.users.findUnique({ where: { username } });
  if (!user) {
    user = await prisma.users.create({
      data: {
        id: seedId,
        username,
        hash_password: "dev", // not used for tests
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
    const profile = await prisma.profiles.create({ data: { first_name: "Dev", last_name: "Director" } });
    await prisma.users_profiles.create({ data: { user_id: user.id, profile_id: profile.id, email } });
    console.log("Attached profile and email to user");
  }

  // link to a hospital (create one if missing)
  let hospital = await prisma.hospitals.findFirst();
  if (!hospital) {
    hospital = await prisma.hospitals.create({ data: { hospital_name: "Dev Hospital", hospital_address: "123 Dev Lane", email: "dev@hospital.test" } });
    console.log("Created hospital", hospital.id);
  }

  const hospitalLink = await prisma.staff_hospitals_departments.findFirst({ where: { staff_id: user.id } });
  if (!hospitalLink) {
    // ensure a department exists
    let dept = await prisma.departments.findFirst();
    if (!dept) dept = await prisma.departments.create({ data: { department_name: "Administration" } });

    // ensure hospital-department join exists first
    let hospitalDepartment = await prisma.hospitals_departments.findFirst({
      where: { hospital_id: hospital.id, department_id: dept.id }
    });
    if (!hospitalDepartment) {
      hospitalDepartment = await prisma.hospitals_departments.create({ data: { hospital_id: hospital.id, department_id: dept.id } });
      console.log("Created hospital-department link");
    }

    await prisma.staff_hospitals_departments.create({ data: { staff_id: user.id, hospital_id: hospital.id, department_id: dept.id } });
    console.log("Linked user to hospital and department");
  }

  // generate token
  const jwtService = new JwtService(process.env.JWT_SECRET || "devsecret");
  const token = jwtService.generateToken({ user_id: user.id, hospital_id: hospital.id, role: "director" });

  console.log("\nCOPY THIS TOKEN into your browser localStorage under key 'token':\n\n" + token + "\n");

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
