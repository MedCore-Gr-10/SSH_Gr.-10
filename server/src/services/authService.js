import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import { JwtService } from "../utils/jwt.js";

export class AuthService {
  /**
   * @param {import("@prisma/client").PrismaClient} prisma
   * @param {import("../utils/jwt.js").JwtService} jwtService
   */
  constructor(prisma, jwtService) {
    this.prisma = prisma;
    this.jwt = jwtService;
  }

  async login(username, password) {
    const user = await this.prisma.users.findUnique({
      where: { username },
      include: { roles: true },
    });

    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.hash_password);
    if (!isValid) throw new Error("Invalid password");

    const role = user.roles.role_name;

    if (role === "superuser") {
      const token = this.jwt.generateToken({
        user_id: user.id,
        role,
      });
      return { token, role };
    }

    if (["doctor", "nurse", "director"].includes(role)) {
      const staff = await this.prisma.staff_hospitals_departments.findFirst({
        where: { staff_id: user.id },
        select: { hospital_id: true },
      });

      if (!staff) {
        throw new Error("User is not assigned to any hospital");
      }

      const token = this.jwt.generateToken({
        user_id: user.id,
        role,
        hospital_id: staff.hospital_id,
      });

      return { token, role };
    }

    if (role === "patient") {
      const token = this.jwt.generateToken({
        user_id: user.id,
        role,
      });

      return { token, role };
    }

    throw new Error("Invalid role");
  }

  async registerPatient(data) {
    const {
      username,
      password,
      email,
      first_name,
      last_surname,
      birth,
      gender,
      personal_no,
      phone_number,
    } = data;

    const existingUser = await this.prisma.users.findUnique({
      where: { username },
    });
    if (existingUser) throw new Error("Username already exists");

    const existingEmail = await this.prisma.users_profiles.findUnique({
      where: { email },
    });
    if (existingEmail) throw new Error("Email already exists");

    const patientRole = await this.prisma.roles.findFirst({
      where: { role_name: "patient" },
    });
    if (!patientRole) throw new Error("Patient role not found");

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      let profile = await tx.profiles.findUnique({
        where: { personal_no },
      });

      if (!profile) {
        profile = await tx.profiles.create({
          data: {
            first_name,
            last_surname,
            birth: new Date(birth),
            gender,
            personal_no,
            phone_number,
          },
        });
      }

      const user = await tx.users.create({
        data: {
          username,
          hash_password: hashedPassword,
          role_id: patientRole.id,
        },
      });

      await tx.users_profiles.create({
        data: {
          user_id: user.id,
          profile_id: profile.id,
          email,
        },
      });

      return user;
    });

    return {
      message: "Patient registered successfully",
      user_id: result.id,
    };
  }
}

const defaultAuthService = new AuthService(prisma, new JwtService());

export function loginUser(username, password) {
  return defaultAuthService.login(username, password);
}

export function registerPatient(data) {
  return defaultAuthService.registerPatient(data);
}
