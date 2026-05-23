import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../../services/api";
import { useAuth } from "../../context/authContext";
import MedCoreLogo from "./MedCoreLogo.jsx";
import { IconStethoscope, IconArrowRight } from "./AuthIcons.jsx";
import "./auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetLink, setDevResetLink] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/main/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevResetLink("");
    setLoading(true);

    try {
      const data = await requestPasswordReset(email);
      if (data.error) {
        setError(data.error);
        return;
      }
      setMessage(
        data.message ||
          "If an account exists for this email, password reset instructions have been sent.",
      );
      if (data.reset_link) {
        setDevResetLink(data.reset_link);
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

        <h1 className="mc-auth-title">Forgot password?</h1>
        <p className="mc-auth-subtitle">
          Enter the email linked to your MedCore account. We will send reset
          instructions if the account exists.
        </p>

        {message ? <div className="mc-info-banner">{message}</div> : null}
        {error ? <div className="mc-error-banner">{error}</div> : null}

        {devResetLink ? (
          <div className="mc-dev-reset-box">
            <p className="mc-dev-reset-label">Development reset link</p>
            <a href={devResetLink} className="mc-dev-reset-link">
              Open reset password page
            </a>
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="mc-field">
            <label className="mc-field-label" htmlFor="forgot-email">
              Email
            </label>
            <div className="mc-input-wrap">
              <span className="mc-input-icon">
                <IconStethoscope />
              </span>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mc-btn-primary mc-btn-primary--login"
            disabled={loading || !email}
          >
            {loading ? "Sending…" : "Send reset link"}
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
