import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import PatientEmergencyContacts from "../patient/EmergencyContacts.jsx";

export default function EmergencyContacts() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "patient") {
    return <PatientEmergencyContacts />;
  }

  return (
    <div>
      <h1>Emergency Contacts</h1>
      <p>This page is available for patients.</p>
    </div>
  );
}
