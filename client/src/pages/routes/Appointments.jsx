import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import PatientAppointments from "../patient/Appointments.jsx";

export default function Appointments() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "patient") {
    return <PatientAppointments />;
  }

  return (
    <div>
      <h1>Appointments</h1>
      <p>This page is available for patients.</p>
    </div>
  );
}
