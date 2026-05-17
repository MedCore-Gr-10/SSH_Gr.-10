import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorStaff from "../../director/DirectorStaff.jsx";

export default function Staff() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "director") {
    return <DirectorStaff />;
  }

  return (
    <div>
      <h1>Staff</h1>
      <p>This page displays staff information.</p>
    </div>
  );
}
