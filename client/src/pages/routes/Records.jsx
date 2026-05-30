import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import PatientRecords from "../patient/Records.jsx";

export default function Records() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "patient") {
    return <PatientRecords />;
  }

  return (
    <div>
      <h1>Records</h1>
      <p>This page is available for patients.</p>
    </div>
  );
}
