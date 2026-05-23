import jwt from "jsonwebtoken";

export class JwtService {
  constructor(secret = process.env.JWT_SECRET) {
    this.secret = secret;
    if (!this.secret) {
      throw new Error(
        "JWT_SECRET is missing. Add it to server/.env (see README).",
      );
    }
  }

  generateToken(payload, expiresIn = "1d") {
    return jwt.sign(payload, this.secret, { expiresIn });
  }

  generatePasswordResetToken(userId) {
    return this.generateToken(
      { user_id: userId, purpose: "password_reset" },
      "1h",
    );
  }

  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }

  verifyPasswordResetToken(token) {
    const payload = this.verifyToken(token);
    if (payload?.purpose !== "password_reset" || !payload?.user_id) {
      throw new Error("Invalid or expired reset link");
    }
    return payload;
  }
}
