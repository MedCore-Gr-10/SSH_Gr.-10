import React from "react";

export default function DirectorMakeRequest() {
  return (
    <div className="director-page-wrapper">
      <h1>Director Make Request</h1>
      <p>Submit requests for system changes or administrative support.</p>
      <div className="director-card-list">
        <div className="director-card">
          <h2>Create New Request</h2>
          <p>Submit a request to superuser or system administrator.</p>
        </div>
        <div className="director-card">
          <h2>Request History</h2>
          <p>View the status of all previous requests.</p>
        </div>
      </div>
    </div>
  );
}
