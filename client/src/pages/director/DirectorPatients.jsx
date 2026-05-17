import React from "react";

//fields only as placeholders...

export default function DirectorPatients() {
  return (
    <div className="director-page-wrapper">
      <h1>Director Patients</h1>
      <p>Manage patient records and hospital registrations.</p>
      <div className="director-card-list">
        <div className="director-card">
          <h2>Patient registry</h2>
          <p>View patient profiles and assigned hospital links.</p>
        </div>
        <div className="director-card">
          <h2>Patient CRUD</h2>
          <p>Create, read, update, and delete patient records safely.</p>
        </div>
      </div>
    </div>
  );
}
