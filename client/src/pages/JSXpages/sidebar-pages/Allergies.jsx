import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import PatientAllergies from "../patient/Allergies.jsx";

export default function Allergies() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "patient") {
    return <PatientAllergies />;
  }

  return (
    <div>
      <h1>Allergies</h1>
      <p>This page is available for patients.</p>
    </div>
  );
}
