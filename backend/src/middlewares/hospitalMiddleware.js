export class HospitalMiddleware {
  handle = (req, res, next) => {
    if (req.user.hospital_id != null) {
      return next();
    }
    if (req.user.role === "patient" || req.user.role === "superuser") {
      return next();
    }
    return res.status(400).json({ error: "Hospital not selected" });
  };
}
