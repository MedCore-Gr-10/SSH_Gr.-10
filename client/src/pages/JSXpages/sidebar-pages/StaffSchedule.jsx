import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorStaffSchedule from "../../director/DirectorStaffSchedule.jsx";
import DoctorStaffSchedule from "../../doctor/DoctorStaffSchedule.jsx";

export default function StaffSchedule() {
  const location = useLocation();
  const { user } = useAuth();
  const role = (user?.role || location.state?.role || "").toLowerCase();

  if (role === "director") {
    return <DirectorStaffSchedule />;
  }

  if (role === "doctor") {
    return <DoctorStaffSchedule />;
  }

  return (
    <div>
      <h1>Staff Schedule</h1>
      <p>This page displays the staff schedule.</p>
    </div>
  );
}
