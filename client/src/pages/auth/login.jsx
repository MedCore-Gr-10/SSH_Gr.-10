import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";
import { useAuth } from "../../context/authContext";
import MedCoreLogo from "./MedCoreLogo.jsx";
import {
  IconStethoscope,
  IconPulse,
  IconEye,
  IconEyeOff,
  IconArrowRight,
} from "./AuthIcons.jsx";
import "./auth.css";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(() => {
    if (location.state?.passwordReset) {
      return "Password updated. You can sign in with your new password.";
    }
    if (location.state?.registered) {
      return "Account created. You can sign in now.";
    }
    return "";
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/main/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      const ok = login(res);
      if (ok) {
        navigate("/main/home", { replace: true });
      } else {
        setError("Could not sign you in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mc-auth-page">
      <div className="mc-auth-decorations" aria-hidden>
        <span className="mc-auth-heart mc-auth-heart--1">♥</span>
        <span className="mc-auth-heart mc-auth-heart--2">♥</span>
      </div>

      <div className="mc-auth-card mc-auth-card--narrow">
        <MedCoreLogo />

        <h1 className="mc-auth-title">Welcome Back!</h1>
        <p className="mc-auth-subtitle">
          Sign in to access your MedCore profile.
        </p>

        {success ? <div className="mc-info-banner">{success}</div> : null}
        {error ? <div className="mc-error-banner">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="mc-field">
            <label className="mc-field-label" htmlFor="login-username">
              Username
            </label>
            <div className="mc-input-wrap">
              <span className="mc-input-icon">
                <IconStethoscope />
              </span>
              <input
                id="login-username"
                name="username"
                autoComplete="username"
                placeholder="Your username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value.trim() })
                }
              />
            </div>
          </div>

          <div className="mc-field">
            <label className="mc-field-label" htmlFor="login-password">
              Password
            </label>
            <div className="mc-input-wrap">
              <span className="mc-input-icon">
                <IconPulse />
              </span>
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="mc-icon-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mc-btn-primary mc-btn-primary--login"
            disabled={loading || !form.username || !form.password}
          >
            {loading ? "Signing in…" : "Sign In"}
            {!loading ? <IconArrowRight /> : null}
          </button>
        </form>

        <div className="mc-link-row">
          <Link to="/forgot-password" className="mc-link-muted">
            Forgot password?
          </Link>
        </div>
        <p className="mc-footer-link">
          Don&apos;t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
