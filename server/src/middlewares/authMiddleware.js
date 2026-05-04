/**
 *  {@link import("../utils/jwt.js").JwtService}.
 */
export class AuthMiddleware {
  /** @param {import("../utils/jwt.js").JwtService} jwtService */
  constructor(jwtService) {
    this.jwtService = jwtService;
  }

  handle = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    try {
      const decoded = this.jwtService.verifyToken(token);
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}
