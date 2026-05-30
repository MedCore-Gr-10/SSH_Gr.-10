import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import SuperuserHospitals from "../superuser/Hospitals.jsx";

export default function Hospitals() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;
  if (role === "superuser") {
        return <SuperuserHospitals />;
      }
  return (
    <div>
      <h1>Hospitals</h1>
      <p>This page allows you to manage hospitals.</p>
    </div>
  );
}