export class HospitalMiddleware {
  handle = (req, res, next) => {
    if (!req.user.hospital_id) {
      return res.status(400).json({ error: "Hospital not selected" });
    }
    next();
  };
}
