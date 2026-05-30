import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import DirectorDashboard from "../director/DirectorDashboard.jsx";
import DoctorDashboard from "../doctor/DoctorDashboard.jsx";
import PatientDashboard from "../patient/PatientDashboard.jsx";
import NurseDashboard from "../nurse/NurseDashboard.jsx";

export default function Dashboard() {
  const location = useLocation();
  const { user } = useAuth();

  const roleFromState = location.state?.role;
  const role = user?.role || roleFromState || "superuser";

  if (role === "director") {
    return <DirectorDashboard />;
  }
  if (role === "doctor") {
    return <DoctorDashboard />;
  }
  if (role === "patient") {
    return <PatientDashboard />;
  }
  if (role === "nurse") {
    return <NurseDashboard />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>This page displays the system dashboard.</p>
    </div>
  );
}
