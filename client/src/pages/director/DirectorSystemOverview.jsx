import React from "react";

export default function DirectorSystemOverview() {
  return (
    <div className="director-page-wrapper">
      <h1>Director System Overview</h1>
      <p>Monitor key hospital metrics and performance indicators.</p>
      <div className="director-card-list">
        <div className="director-card">
          <h2>Hospital Statistics</h2>
          <p>View patient count, staff count, and appointment stats.</p>
        </div>
        <div className="director-card">
          <h2>Activity Logs</h2>
          <p>Review access logs and user activity for audit purposes.</p>
        </div>
        <div className="director-card">
          <h2>Performance Metrics</h2>
          <p>Check appointment completion rates and staff utilization.</p>
        </div>
      </div>
    </div>
  );
}
