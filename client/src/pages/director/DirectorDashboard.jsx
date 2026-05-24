import React, { useEffect, useState } from "react";
import "./DirectorDashboard.css";
import { getDirectorSystemOverview } from "../../services/directorSystemOverviewApi";

export default function DirectorDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getDirectorSystemOverview();
        setOverview(data);
      } catch (err) {
        setError(err.message || "Unable to load system overview.");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const stats = overview?.statistics ?? {};

  const formatNumber = (value) => (typeof value === "number" ? value : 0);

  return (
    <div className="director-dashboard">
      <div className="dd-header">
        <h1>Director Dashboard</h1>
        <p className="dd-sub">Overview of hospital metrics and recent activity</p>
      </div>

      {loading ? (
        <div className="dd-loading">Loading overview...</div>
      ) : error ? (
        <div className="dd-error">{error}</div>
      ) : (
        <>
          <div className="dd-cards">
            <div className="dd-card">
              <h3>Total Staff</h3>
              <p className="dd-value">{formatNumber(stats.staffCount)}</p>
            </div>
            <div className="dd-card">
              <h3>Total Patients</h3>
              <p className="dd-value">{formatNumber(stats.patientCount)}</p>
            </div>
            <div className="dd-card">
              <h3>Upcoming Appointments</h3>
              <p className="dd-value">{formatNumber(stats.activeAppointments)}</p>
            </div>
          </div>

          <div className="dd-cards dd-cards--secondary">
            <div className="dd-card">
              <h3>Booked Appointments</h3>
              <p className="dd-value">{formatNumber(stats.appointmentCount)}</p>
            </div>
            <div className="dd-card">
              <h3>Total Patients</h3>
              <p className="dd-value">{formatNumber(stats.patientCount)}</p>
            </div>
            <div className="dd-card">
              <h3>Total Staff</h3>
              <p className="dd-value">{formatNumber(stats.staffCount)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
