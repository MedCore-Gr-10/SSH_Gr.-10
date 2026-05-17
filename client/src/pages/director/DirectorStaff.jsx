import React from "react";

//fields only as placeholders...

export default function DirectorStaff() {
  return (
    <div className="director-page-wrapper">
      <h1>Director Staff</h1>
      <p>Manage doctors, nurses, and staff assignments in your hospital.</p>
      <div className="director-card-list">
        <div className="director-card">
          <h2>Staff roster</h2>
          <p>View and assign staff members to departments.</p>
        </div>
        <div className="director-card">
          <h2>Role management</h2>
          <p>Register new doctors or nurses and manage their hospital access.</p>
        </div>
      </div>
    </div>
  );
}
