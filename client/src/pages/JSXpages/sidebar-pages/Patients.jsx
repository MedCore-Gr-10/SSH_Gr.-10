import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorPatients from "../../director/DirectorPatients.jsx";

export default function Patients() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "director") {
    return <DirectorPatients />;
  }

  return (
    <div>
      <h1>Patients</h1>
      <p>This page displays patient information.</p>
    </div>
  );
}
