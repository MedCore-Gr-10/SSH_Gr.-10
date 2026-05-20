#!/usr/bin/env node
import prisma from "../src/prisma.js";
import bcrypt from "bcrypt";
import { JwtService } from "../src/utils/jwt.js";

async function main() {
  const staffId = "00000000-0000-0000-0000-000000000002";
  const username = "dev_doctor";
  const email = "dev_doctor@example.test";
  const password = "devpassword";
  const roleName = "DOCTOR";

  let role = await prisma.roles.findFirst({ where: { role_name: roleName } });
  if (!role) {
    role = await prisma.roles.create({ data: { role_name: roleName } });
    console.log("Created role:", roleName);
  }

  let hospital = await prisma.hospitals.findFirst();
  if (!hospital) {
    hospital = await prisma.hospitals.create({
      data: {
        hospital_name: "Dev Hospital",
        hospital_address: "123 Dev Lane",
        email: "dev@hospital.test",
      },
    });
    console.log("Created hospital", hospital.id);
  }

  let department = await prisma.departments.findFirst({
    where: { department_name: "Administration" }
  });

  if (!department) {
    department = await prisma.departments.create({
      data: { department_name: "Administration" }
    });
    console.log("Created department Administration");
  }

  let hospitalDepartment = await prisma.hospitals_departments.findFirst({
    where: {
      hospital_id: hospital.id,
      department_id: department.id,
    },
  });

  if (!hospitalDepartment) {
    hospitalDepartment = await prisma.hospitals_departments.create({
      data: {
        hospital_id: hospital.id,
        department_id: department.id,
      },
    });
    console.log("Created hospital-department link");
  }

  let user = await prisma.users.findUnique({ where: { username } });

  if (!user) {
    const hash_password = await bcrypt.hash(password, 10);

    user = await prisma.users.create({
      data: {
        id: staffId,
        username,
        hash_password,
        role_id: role.id,
        is_active: true,
      },
    });

    console.log("Created staff user:", username);
  } else {
    console.log("Staff user exists:", username);
  }

  const profileExists = await prisma.users_profiles.findFirst({
    where: { user_id: user.id },
  });

  if (!profileExists) {
    const profile = await prisma.profiles.create({
      data: {
        first_name: "Dev",
        last_name: "Doctor",
        phone_number: "+38300000000",
      },
    });

    await prisma.users_profiles.create({
      data: {
        user_id: user.id,
        profile_id: profile.id,
        email,
      },
    });

    console.log("Created profile for staff user");
  }

  const staffLink = await prisma.staff_hospitals_departments.findUnique({
    where: {
      staff_id_hospital_id_department_id: {
        staff_id: user.id,
        hospital_id: hospital.id,
        department_id: department.id,
      },
    },
  });

  if (!staffLink) {
    await prisma.staff_hospitals_departments.create({
      data: {
        staff_id: user.id,
        hospital_id: hospital.id,
        department_id: department.id,
      },
    });

    console.log("Linked staff to hospital and department");
  } else {
    console.log("Staff already linked to hospital and department");
  }

  // -------------------------------
  // JWT TOKEN GENERATION (NEW)
  // -------------------------------
  const jwtService = new JwtService(process.env.JWT_SECRET || "devsecret");

  const token = jwtService.generateToken({
    user_id: user.id,
    hospital_id: hospital.id,
    role: roleName.toLowerCase(),
  });

  console.log(
    "\nCOPY THIS TOKEN into localStorage under key 'token':\n\n" +
    token +
    "\n"
  );

  console.log("Staff seed completed.");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log(`Hospital ID: ${hospital.id}`);
  console.log(`Department ID: ${department.id}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});