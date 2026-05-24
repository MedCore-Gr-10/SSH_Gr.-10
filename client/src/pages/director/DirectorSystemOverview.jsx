import React, { useEffect, useState } from "react";
import { getDirectorSystemOverview } from "../../services/directorSystemOverviewApi";
import "./DirectorSystemOverview.css";

export default function DirectorSystemOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDirectorSystemOverview();
        setOverview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  return (
    <div className="director-page-wrapper">
      <h1>Director System Overview</h1>
      <p>Monitor key hospital metrics and performance indicators.</p>

      {loading && <p>Loading overview...</p>}
      {error && <div className="director-message error">{error}</div>}

      {overview && (
        <>
          <div className="director-grid-overview">
            <div className="director-card">
              <h2>Hospital Statistics</h2>
              <ul>
                <li>Patients: {overview.statistics.patientCount}</li>
                <li>Staff: {overview.statistics.staffCount}</li>
                <li>Total appointments: {overview.statistics.appointmentCount}</li>
                <li>Active schedules: {overview.statistics.activeSchedules}</li>
              </ul>
            </div>
            <div className="director-card">
              <h2>Performance Metrics</h2>
              <ul>
                <li>Appointment completion rate: {overview.metrics.appointmentCompletionRate}%</li>
                <li>Staff utilization: {overview.metrics.staffUtilization}</li>
                <li>Active appointments: {overview.statistics.activeAppointments}</li>
                <li>Completed appointments: {overview.statistics.completedAppointments}</li>
              </ul>
            </div>
          </div>

          <div className="director-card director-logs-card">
            <h2>Activity Logs</h2>
            <div className="director-log-list">
              {overview.logs.length === 0 ? (
                <p>No recent activity logs.</p>
              ) : (
                overview.logs.map((log) => (
                  <div key={log.id} className="director-log-item">
                    <div className="director-log-meta">
                      <span className="director-log-action">{log.action}</span>
                      <span className="director-log-user">{log.user.name || log.user.username}</span>
                    </div>
                    <p>{log.reason}</p>
                    <time>{new Date(log.timestamp).toLocaleString()}</time>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
