/**
 *  {@link AuthService}.
 */
export class AuthController {
  /** @param {import("../services/auth.service.js").AuthService} authService */
  constructor(authService) {
    this.authService = authService;
  }

  login = async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await this.authService.login(username, password);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  register = async (req, res) => {
    try {
      const result = await this.authService.registerPatient(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  selectHospitals = async (req, res) => {
    try {
      const user_id = req.user.user_id;
      const { hospital_id } = req.body;

      if (!hospital_id) {
        return res.status(400).json({ error: "hospital_id is required" });
      }

      const result = await this.authService.selectHospital(
        user_id,
        hospital_id,
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}
