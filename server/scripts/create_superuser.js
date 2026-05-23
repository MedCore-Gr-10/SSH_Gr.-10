#!/usr/bin/env node
import prisma from "../src/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const seedId = "00000000-0000-0000-0000-000000000000";
  const username = "superuser";
  const email = "superuser@example.test";
  const password = "superuser123";
  const roleName = "superuser";

  let role = await prisma.roles.findFirst({ where: { role_name: roleName } });
  if (!role) {
    role = await prisma.roles.create({ data: { role_name: roleName } });
    console.log("Created role:", roleName);
  }

  let user = await prisma.users.findUnique({ where: { username } });
  if (!user) {
    const hash_password = await bcrypt.hash(password, 10);
    user = await prisma.users.create({
      data: {
        id: seedId,
        username,
        hash_password,
        role_id: role.id,
        is_active: true,
      },
    });
    console.log("Created superuser:", username);
  } else {
    console.log("Superuser already exists:", username);
  }

  const existingProfile = await prisma.users_profiles.findFirst({ where: { user_id: user.id } });
  if (!existingProfile) {
    const profile = await prisma.profiles.create({
      data: {
        first_name: "Super",
        last_name: "User",
      },
    });

    await prisma.users_profiles.create({
      data: {
        user_id: user.id,
        profile_id: profile.id,
        email,
      },
    });
    console.log("Created profile and email for superuser");
  }

  console.log("\nSuperuser credentials:");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log("You can now sign in with username/password at /auth/login.");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
