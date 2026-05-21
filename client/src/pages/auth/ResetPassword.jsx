import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/api";
import { useAuth } from "../../context/authContext";
import {
  allPasswordRulesMet,
  passwordRulesMet,
} from "../../utils/passwordRules";
import MedCoreLogo from "./MedCoreLogo.jsx";
import {
  IconPulse,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
} from "./AuthIcons.jsx";
import "./auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rules = useMemo(() => passwordRulesMet(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    token && allPasswordRulesMet(rules) && passwordsMatch && !loading;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/main/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(
        "Reset link is invalid. Request a new one from forgot password.",
      );
      return;
    }
    if (!allPasswordRulesMet(rules)) {
      setError("Please meet all password requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword({ token, password });
      if (data.error) {
        setError(data.error);
        return;
      }
      navigate("/", {
        replace: true,
        state: { passwordReset: true },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mc-auth-page">
        <div className="mc-auth-card mc-auth-card--narrow">
          <MedCoreLogo />
          <h1 className="mc-auth-title">Invalid link</h1>
          <p className="mc-auth-subtitle">
            This password reset link is missing or expired.
          </p>
          <p className="mc-footer-link">
            <Link to="/forgot-password">Request a new reset link</Link>
          </p>
          <p className="mc-footer-link">
            <Link to="/">Back to sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mc-auth-page">
      <div className="mc-auth-decorations" aria-hidden>
        <span className="mc-auth-heart mc-auth-heart--1">♥</span>
        <span className="mc-auth-heart mc-auth-heart--2">♥</span>
      </div>

      <div className="mc-auth-card mc-auth-card--narrow">
        <MedCoreLogo />

        <h1 className="mc-auth-title">Set a new password</h1>
        <p className="mc-auth-subtitle">
          Choose a strong password for your MedCore account.
        </p>

        {error ? <div className="mc-error-banner">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="mc-field">
            <label className="mc-field-label" htmlFor="reset-password">
              New password
            </label>
            <div className="mc-input-wrap">
              <span className="mc-input-icon">
                <IconPulse />
              </span>
              <input
                id="reset-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="mc-field">
            <label className="mc-field-label" htmlFor="reset-confirm">
              Confirm password
            </label>
            <div className="mc-input-wrap">
              <span className="mc-input-icon">
                <IconLock />
              </span>
              <input
                id="reset-confirm"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="mc-icon-btn"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <div className="mc-field">
            <div className="mc-password-rules">
              <p className="mc-password-rules-title">Password requirements</p>
              <ul>
                <li className={rules.length ? "met" : "unmet"}>
                  At least 8 characters
                </li>
                <li className={rules.numbers ? "met" : "unmet"}>
                  At least one number
                </li>
                <li className={rules.symbols ? "met" : "unmet"}>
                  At least one symbol
                </li>
                <li
                  className={
                    confirmPassword
                      ? passwordsMatch
                        ? "met"
                        : "unmet"
                      : "unmet"
                  }
                >
                  Passwords match
                </li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            className="mc-btn-primary mc-btn-primary--login"
            disabled={!canSubmit}
          >
            {loading ? "Updating…" : "Update password"}
            {!loading ? <IconArrowRight /> : null}
          </button>
        </form>

        <p className="mc-footer-link">
          <Link to="/">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
