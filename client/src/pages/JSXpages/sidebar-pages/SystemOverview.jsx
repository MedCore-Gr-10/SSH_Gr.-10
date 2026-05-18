import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorSystemOverview from "../../director/DirectorSystemOverview.jsx";

export default function SystemOverview() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "director") {
    return <DirectorSystemOverview />;
  }

  return (
    <div>
      <h1>System Overview</h1>
      <p>This page displays the system overview.</p>
    </div>
  );
}