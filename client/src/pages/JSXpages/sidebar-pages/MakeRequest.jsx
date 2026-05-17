import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorMakeRequest from "../../director/DirectorMakeRequest.jsx";

export default function MakeRequest() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  if (role === "director") {
    return <DirectorMakeRequest />;
  }

  return (
    <div>
      <h1>Make Request</h1>
      <p>This page allows you to make a request.</p>
    </div>
  );
}