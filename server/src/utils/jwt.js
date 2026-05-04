import jwt from "jsonwebtoken";

export class JwtService {
  constructor(secret = process.env.JWT_SECRET) {
    this.secret = secret;
  }

  generateToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: "1d",
    });
  }

  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
}
