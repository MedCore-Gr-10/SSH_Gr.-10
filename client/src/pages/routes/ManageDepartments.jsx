import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import DirectorManageDepartments from "../director/DirectorManageDepartments.jsx";
import SuperuserManageDepartments from "../superuser/ManageDepartments.jsx";

export default function ManageDepartments() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "director") {
    return <DirectorManageDepartments />;
  }
  if (role === "superuser") {
    return <SuperuserManageDepartments />;
  }

  return (
    <div>
      <h1>Manage Departments</h1>
      <p>This page allows you to manage departments.</p>
    </div>
  );
}