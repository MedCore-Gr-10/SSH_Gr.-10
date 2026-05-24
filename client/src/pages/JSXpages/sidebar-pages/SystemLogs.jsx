import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import SuperuserSystemLogs from "../superuser/SystemLogs.jsx";

export default function SystemLogs() {
    const location = useLocation();
    const { user } = useAuth();
    const role = location.state?.role || user?.role;
    if (role === "superuser") {
      return <SuperuserSystemLogs />;
    }
  
  return (
    <div>
      <h1>System Logs</h1>
      <p>This page displays system logs.</p>
    </div>
  );
}