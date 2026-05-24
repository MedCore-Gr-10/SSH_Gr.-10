import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import PatientMyAppointments from "../patient/MyAppointments.jsx";

export default function MyAppointments() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "patient") {
    return <PatientMyAppointments />;
  }

  return (
    <div>
      <h1>My Appointments</h1>
      <p>This page is available for patients.</p>
    </div>
  );
}
