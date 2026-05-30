import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import PatientInsurance from "../patient/Insurance.jsx";

export default function Insurance() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "patient") {
    return <PatientInsurance />;
  }

  return (
    <div>
      <h1>Insurance</h1>
      <p>This page is available for patients.</p>
    </div>
  );
}
