import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorAppointments from "../../director/DirectorAppointments.jsx";
import SuperuserAppointments from "../superuser/AppoitmentsMade.jsx";
import DoctorBookedAppointments from "../../doctor/DoctorBookedAppointments.jsx";

export default function BookedAppointments() {
  const location = useLocation();
  const { user } = useAuth();
  const role = (location.state?.role || user?.role || "").toLowerCase();

  if (role === "director") {
    return <DirectorAppointments />;
  }
    if (role === "superuser") {
    return <SuperuserAppointments />;
  }

  if (role === "doctor") {
    return <DoctorBookedAppointments />;
  }

  return (
    <div>
      <h1>Booked Appointments</h1>
    </div>
  );
}