import React from "react";

export default function DirectorAppointments() {
  return (
    <div className="director-page-wrapper">
      <h1>Director Appointments</h1>
      <p>Manage and review all appointments in your hospital.</p>
      <div className="director-card-list">
        <div className="director-card">
          <h2>Booked Appointments</h2>
          <p>View all confirmed appointments with doctors and patients.</p>
        </div>
        <div className="director-card">
          <h2>Appointment Slots</h2>
          <p>Check available appointment time slots per doctor.</p>
        </div>
        <div className="director-card">
          <h2>Reschedule / Cancel</h2>
          <p>Modify or cancel appointments as needed.</p>
        </div>
      </div>
    </div>
  );
}
