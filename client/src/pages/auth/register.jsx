import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MedCoreLogo from "./MedCoreLogo.jsx";
import {
  IconStethoscope,
  IconPulse,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
} from "./AuthIcons.jsx";
import "./auth.css";

const API = "http://localhost:3000/api";

function passwordRulesMet(password) {
  return {
    length: password.length >= 8,
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };
}

function allRulesMet(rules) {
  return rules.length && rules.numbers && rules.symbols;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    first_name: "",
    last_surname: "",
    birth: "",
    gender: "",
    personal_no: "",
    phone_number: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rules = useMemo(() => passwordRulesMet(form.password), [form.password]);

  const passwordsMatch =
    form.password.length > 0 && form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allRulesMet(rules)) {
      setError("Please meet all password requirements before continuing.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    const { confirmPassword: _c, ...payload } = form;

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      navigate("/login");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    form.username &&
    form.email &&
    form.first_name &&
    form.last_surname &&
    form.birth &&
    form.gender &&
    form.personal_no &&
    form.phone_number &&
    allRulesMet(rules) &&
    passwordsMatch;

  return (
    <div className="mc-auth-page">
      <div className="mc-auth-decorations" aria-hidden>
        <span className="mc-auth-heart mc-auth-heart--1">♥</span>
        <span className="mc-auth-heart mc-auth-heart--2">♥</span>
      </div>

      <div className="mc-auth-card mc-auth-card--wide">
        <MedCoreLogo />

        <h1 className="mc-auth-title">Join MedCore</h1>
        <p className="mc-auth-subtitle">
          Create an account to start your personalized journey.
        </p>

        {error ? <div className="mc-error-banner">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="mc-register-grid">
            <h2 className="mc-section-heading">Account</h2>

            <div className="mc-field">
              <label className="mc-field-label" htmlFor="reg-email">
                Email
              </label>
              <div className="mc-input-wrap">
                <span className="mc-input-icon">
                  <IconStethoscope />
                </span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value.trim() })
                  }
                />
              </div>
            </div>

            <div className="mc-field">
              <label className="mc-field-label" htmlFor="reg-username">
                Username
              </label>
              <div className="mc-input-wrap">
                <span className="mc-input-icon">
                  <IconStethoscope />
                </span>
                <input
                  id="reg-username"
                  name="username"
                  autoComplete="username"
                  placeholder="Choose a unique username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value.trim() })
                  }
                />
              </div>
            </div>

            <div className="mc-field">
              <label className="mc-field-label" htmlFor="reg-password">
                Password
              </label>
              <div className="mc-input-wrap">
                <span className="mc-input-icon">
                  <IconPulse />
                </span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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
              <label className="mc-field-label" htmlFor="reg-confirm">
                Confirm password
              </label>
              <div className="mc-input-wrap">
                <span className="mc-input-icon">
                  <IconLock />
                </span>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
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

            <div className="mc-field" style={{ gridColumn: "1 / -1" }}>
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
                      form.confirmPassword
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

            <h2 className="mc-section-heading">Your profile</h2>

            <div className="mc-field" style={{ gridColumn: "1 / -1" }}>
              <div className="mc-row-2">
                <div>
                  <label className="mc-field-label" htmlFor="reg-first">
                    First name
                  </label>
                  <div className="mc-input-wrap">
                    <input
                      id="reg-first"
                      name="first_name"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={form.first_name}
                      onChange={(e) =>
                        setForm({ ...form, first_name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="mc-field-label" htmlFor="reg-last">
                    Last name
                  </label>
                  <div className="mc-input-wrap">
                    <input
                      id="reg-last"
                      name="last_surname"
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={form.last_surname}
                      onChange={(e) =>
                        setForm({ ...form, last_surname: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mc-field">
              <label className="mc-field-label" htmlFor="reg-birth">
                Date of birth
              </label>
              <div className="mc-input-wrap">
                <input
                  id="reg-birth"
                  name="birth"
                  type="date"
                  value={form.birth}
                  onChange={(e) => setForm({ ...form, birth: e.target.value })}
                />
              </div>
            </div>

            <div className="mc-field">
              <label className="mc-field-label" htmlFor="reg-gender">
                Gender
              </label>
              <div className="mc-input-wrap">
                <select
                  id="reg-gender"
                  name="gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select…</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  {/* <option value="other">Other</option>
                  <option value="prefer_not">Prefer not to say</option> */}
                </select>
              </div>
            </div>

            <div className="mc-field">
              <label className="mc-field-label" htmlFor="reg-personal">
                Personal number
              </label>
              <div className="mc-input-wrap">
                <input
                  id="reg-personal"
                  name="personal_no"
                  autoComplete="off"
                  placeholder="National ID or personal number"
                  value={form.personal_no}
                  onChange={(e) =>
                    setForm({ ...form, personal_no: e.target.value.trim() })
                  }
                />
              </div>
            </div>

            <div className="mc-field">
              <label className="mc-field-label" htmlFor="reg-phone">
                Phone number
              </label>
              <div className="mc-input-wrap">
                <input
                  id="reg-phone"
                  name="phone_number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 234 567 8900"
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm({ ...form, phone_number: e.target.value.trim() })
                  }
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mc-btn-primary mc-btn-primary--register"
            disabled={loading || !canSubmit}
          >
            {loading ? "Creating account…" : "Create Account"}
            {!loading ? <IconArrowRight /> : null}
          </button>
        </form>

        <p className="mc-footer-link">
          Already have an account? <Link to="/">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
