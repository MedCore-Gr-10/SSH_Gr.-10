import React from "react";

//fields only as placeholders...

export default function DirectorStaffSchedule() {
  return (
    <div className="director-page-wrapper">
      <h1>Director Staff Schedule</h1>
      <p>Review and manage staff working schedules for your hospital.</p>
      <div className="director-card-list">
        <div className="director-card">
          <h2>Weekly overview</h2>
          <p>Check doctor and nurse availability by department.</p>
        </div>
        <div className="director-card">
          <h2>Edit shifts</h2>
          <p>Update schedule slots with a single click.</p>
        </div>
      </div>
    </div>
  );
}
