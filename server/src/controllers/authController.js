/**
 *  {@link AuthService}.
 */
export class AuthController {
  /** @param {import("../services/authService.js").AuthService} authService */
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
}
