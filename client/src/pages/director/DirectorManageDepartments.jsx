import React from "react";

//fields are only placeholders...

export default function DirectorManageDepartments() {
  return (
    <div className="director-page-wrapper">
      <h1>Director Manage Departments</h1>
      <p>Register and manage departments linked to your hospital.</p>
      <div className="director-card-list">
        <div className="director-card">
          <h2>Department Registry</h2>
          <p>View all departments in your hospital.</p>
        </div>
        <div className="director-card">
          <h2>Add Department</h2>
          <p>Register a new department and assign it to your hospital.</p>
        </div>
        <div className="director-card">
          <h2>Edit Department</h2>
          <p>Update department information and staffing.</p>
        </div>
      </div>
    </div>
  );
}
