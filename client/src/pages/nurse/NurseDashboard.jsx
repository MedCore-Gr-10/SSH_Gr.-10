import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext.jsx";
import { getNurseDashboard, getNurseAccessLogs } from "../../services/nurseApi.js";
import "./Nurse.css";
import "./NurseDashboard.css";

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const STAT_CARDS = [
  {
    key: "activePatients",
    label: "Active patients",
    hint: "Patients registered at your hospital",
    icon: "👥",
    accent: "#2563eb",
  },
  {
    key: "shiftsToday",
    label: "Shifts today",
    hint: "Your active shifts for this day of the week",
    icon: "📅",
    accent: "#059669",
  },
  {
    key: "staffCount",
    label: "Staff",
    hint: "Doctors and nurses assigned to your hospital",
    icon: "🩺",
    accent: "#7c3aed",
  },
];

export default function NurseDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [dashboard, logs] = await Promise.all([
          getNurseDashboard(),
          getNurseAccessLogs().catch(() => []),
        ]);
        setStats(dashboard);
        setRecentLogs((logs || []).slice(0, 6));
      } catch (err) {
        setError(err.message || "Unable to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayName =
    user?.first_name || user?.username
      ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
        user?.username
      : "Nurse";

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="nurse-page nurse-dashboard">
      <header className="nd-hero">
        <div className="nd-hero-text">
          <p className="nd-hero-eyebrow">Nurse portal</p>
          <h1>Welcome back, {displayName}</h1>
          <p className="nd-hero-sub">{todayLabel}</p>
          <p className="nd-hero-desc">
            Hospital overview for your tenant. Use the cards below for today’s
            numbers and recent activity.
          </p>
        </div>
      </header>

      {error && <div className="nurse-message error">{error}</div>}

      {loading ? (
        <div className="nd-loading-panel">Loading your dashboard...</div>
      ) : (
        stats && (
          <>
            <section className="nd-stats-grid" aria-label="Key metrics">
              {STAT_CARDS.map(({ key, label, hint, icon, accent }) => (
                <article
                  key={key}
                  className="nd-stat-card"
                  style={{ "--nd-accent": accent }}
                >
                  <div className="nd-stat-card-top">
                    <span className="nd-stat-icon" aria-hidden="true">
                      {icon}
                    </span>
                    <h3>{label}</h3>
                  </div>
                  <p className="nd-stat-value">{stats[key] ?? 0}</p>
                  <p className="nd-stat-hint">{hint}</p>
                </article>
              ))}
            </section>

            <div className="nd-two-col">
              <section className="nd-panel">
                <div className="nd-panel-head">
                  <h2>Recent patient access</h2>
                  <p>Latest actions from the My Patients page.</p>
                </div>
                {recentLogs.length === 0 ? (
                  <p className="nd-empty-inline">
                    No patient data access logged yet. Open a record from My
                    Patients to see activity here.
                  </p>
                ) : (
                  <ul className="nd-activity-list">
                    {recentLogs.map((log) => (
                      <li key={log.id} className="nd-activity-item">
                        <div className="nd-activity-action">{log.action}</div>
                        <div className="nd-activity-meta">
                          <time dateTime={log.timestamp}>
                            {formatDateTime(log.timestamp)}
                          </time>
                          {log.reason && (
                            <span className="nd-activity-reason">
                              {log.reason}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="nd-panel nd-panel--tips">
                <div className="nd-panel-head">
                  <h2>Today at a glance</h2>
                  <p>How to read your dashboard numbers.</p>
                </div>
                <ul className="nd-tips-list">
                  <li>
                    <strong>{stats.activePatients ?? 0} patients</strong> are
                    linked to your hospital — find them under My Patients.
                  </li>
                  <li>
                    <strong>{stats.shiftsToday ?? 0} shift(s)</strong> scheduled
                    for you today — check exact times in My Schedule.
                  </li>
                  <li>
                    <strong>{stats.staffCount ?? 0} staff member(s)</strong>{" "}
                    work at your hospital — see their shifts under Staff
                    Schedules.
                  </li>
                </ul>
                <div className="nd-tip-box">
                  <p>
                    All patient data is <strong>read-only</strong>. Always
                    enter an access reason before opening allergies, history,
                    or insurance.
                  </p>
                </div>
              </section>
            </div>
          </>
        )
      )}
    </div>
  );
}
