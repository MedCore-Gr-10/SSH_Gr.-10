export class RoleMiddleware {
  constructor(...allowedRoles) {
    this.allowedRoles = allowedRoles;
  }

  handle = (req, res, next) => {
    if (!this.allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
