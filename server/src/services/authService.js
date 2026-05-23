import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import userRepository from "../repositories/user.repository.js";
import profileRepository from "../repositories/profile.repository.js";
import rolesRepository from "../repositories/roles.repository.js";
import logsRepository from "../repositories/logs.repository.js";
import { JwtService } from "../utils/jwt.js";

export class AuthService {
  /**
   * @param {import("@prisma/client").PrismaClient} prismaClient
   * @param {import("../utils/jwt.js").JwtService} jwtService
   * @param {import("../repositories/user.repository.js").default} usersRepo
   * @param {import("../repositories/profile.repository.js").default} profilesRepo
   * @param {import("../repositories/roles.repository.js").default} rolesRepo
   */
  constructor(prismaClient, jwtService, usersRepo, profilesRepo, rolesRepo) {
    this.prisma = prismaClient;
    this.jwt = jwtService;
    this.users = usersRepo;
    this.profiles = profilesRepo;
    this.roles = rolesRepo;
  }

  async #buildAuthUser(user, role, hospitalId = null) {
    const profiles = await this.users.getProfile(user.id);
    const link = profiles[0];

    return {
      id: user.id,
      username: user.username,
      role,
      hospital_id: hospitalId,
      email: link?.email ?? null,
      first_name: link?.profiles?.first_name ?? null,
      last_name: link?.profiles?.last_name ?? null,
    };
  }

  #validatePassword(password) {
    if (!password || password.length < 8) {
      throw new Error(
        "Password must be at least 8 characters and include a number and a symbol",
      );
    }
    if (!/\d/.test(password)) {
      throw new Error(
        "Password must be at least 8 characters and include a number and a symbol",
      );
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new Error(
        "Password must be at least 8 characters and include a number and a symbol",
      );
    }
  }

  async #logSuccessfulLogin(userId, role) {
    try {
      await logsRepository.create({
        user_id: userId,
        action: "login",
        reason: `${role} signed in`,
      });
    } catch (error) {
      console.error("Failed to write login log:", error.message);
    }
  }

  async login(username, password) {
    const user = await this.users.findByUsername(username);

    if (!user) throw new Error("User not found");
    if (user.is_active === false) throw new Error("Account is disabled");

    const isValid = await bcrypt.compare(password, user.hash_password);
    if (!isValid) throw new Error("Invalid password");

    const role = user.roles?.role_name;
    if (!role) throw new Error("Invalid role");

    const normalizedRole = role.trim().toLowerCase();
    let hospital_id = null;

    if (normalizedRole === "superuser") {
      const token = this.jwt.generateToken({ user_id: user.id, role: normalizedRole });
      const authUser = await this.#buildAuthUser(user, normalizedRole);
      await this.#logSuccessfulLogin(user.id, normalizedRole);
      return { token, role: normalizedRole, user: authUser };
    }

    if (["doctor", "nurse", "director"].includes(normalizedRole)) {
      const fullUser = await this.users.findById(user.id);
      const staff = fullUser?.staff_hospitals_departments?.[0];

      if (!staff) {
        throw new Error("User is not assigned to any hospital");
      }

      hospital_id = staff.hospital_id;

      const token = this.jwt.generateToken({
        user_id: user.id,
        role: normalizedRole,
        hospital_id,
      });

      const authUser = await this.#buildAuthUser(user, normalizedRole, hospital_id);
      await this.#logSuccessfulLogin(user.id, normalizedRole);
      return { token, role: normalizedRole, user: authUser };
    }

    if (normalizedRole === "patient") {
      const token = this.jwt.generateToken({ user_id: user.id, role: normalizedRole });
      const authUser = await this.#buildAuthUser(user, normalizedRole);
      await this.#logSuccessfulLogin(user.id, normalizedRole);
      return { token, role: normalizedRole, user: authUser };
    }

    throw new Error("Invalid role");
  }

  async registerPatient(data) {
    const {
      username,
      password,
      email,
      first_name,
      last_name,
      last_surname,
      birth,
      gender,
      personal_no,
      phone_number,
    } = data;

    const resolvedLastName = last_name ?? last_surname;

    if (!username || !password || !email || !first_name || !resolvedLastName) {
      throw new Error("Missing required registration fields");
    }
    this.#validatePassword(password);

    const existingUser = await this.users.findByUsername(username);
    if (existingUser) throw new Error("Username already exists");

    const existingEmail = await this.users.findByEmail(email);
    if (existingEmail) throw new Error("Email already exists");

    const patientRole = await this.roles.findByName(["patient", "PATIENT"]);
    if (!patientRole) throw new Error("Patient role not found");

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      let profile = await this.profiles.findByPersonalNo(personal_no);

      if (!profile) {
        profile = await tx.profiles.create({
          data: {
            first_name,
            last_name: resolvedLastName,
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

  async requestPasswordReset(email) {
    if (!email?.trim()) {
      throw new Error("Email is required");
    }

    const user = await this.users.findByEmail(email.trim());

    const genericMessage =
      "If an account exists for this email, password reset instructions have been sent.";

    if (!user || user.is_active === false) {
      return { message: genericMessage };
    }

    const resetToken = this.jwt.generatePasswordResetToken(user.id);
    const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientOrigin}/reset-password?token=${encodeURIComponent(resetToken)}`;

    if (process.env.NODE_ENV !== "production") {
      console.log("[dev] Password reset link:", resetLink);
      return {
        message: genericMessage,
        reset_link: resetLink,
      };
    }

    // Production: integrate email provider here (e.g. nodemailer).
    return { message: genericMessage };
  }

  async resetPassword(token, password) {
    if (!token) throw new Error("Reset token is required");

    this.#validatePassword(password);

    let payload;
    try {
      payload = this.jwt.verifyPasswordResetToken(token);
    } catch {
      throw new Error("Invalid or expired reset link");
    }

    const user = await this.users.findById(payload.user_id);
    if (!user) throw new Error("User not found");
    if (user.is_active === false) throw new Error("Account is disabled");

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.users.updatePassword(user.id, hashedPassword);

    return { message: "Password updated successfully. You can sign in now." };
  }
}

const defaultAuthService = new AuthService(
  prisma,
  new JwtService(),
  userRepository,
  profileRepository,
  rolesRepository,
);

export function loginUser(username, password) {
  return defaultAuthService.login(username, password);
}

export function registerPatient(data) {
  return defaultAuthService.registerPatient(data);
}

export function requestPasswordReset(email) {
  return defaultAuthService.requestPasswordReset(email);
}

export function resetPassword(token, password) {
  return defaultAuthService.resetPassword(token, password);
}
