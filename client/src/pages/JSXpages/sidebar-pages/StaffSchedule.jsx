import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorStaffSchedule from "../../director/DirectorStaffSchedule.jsx";

export default function StaffSchedule() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "director") {
    return <DirectorStaffSchedule />;
  }

  return (
    <div>
      <h1>Staff Schedule</h1>
      <p>This page displays the staff schedule.</p>
    </div>
  );
}
