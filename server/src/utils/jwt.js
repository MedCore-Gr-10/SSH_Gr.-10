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

  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
}
