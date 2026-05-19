import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorPatients from "../../director/DirectorPatients.jsx";
import DoctorPatients from "../../doctor/DoctorPatients.jsx";

export default function Patients() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "director") {
    return <DirectorPatients />;
  }if (role === "doctor"){
    return <DoctorPatients />;
  }

  return (
    <div>
      <h1>Patients</h1>
      <p>This page displays patient information.</p>
    </div>
  );
}
