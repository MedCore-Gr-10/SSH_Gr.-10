// src/components/layout/Sidebar.jsx
import React from "react";
import "./Sidebar.css";
import SidebarButton from "../JSXcomponents/SidebarButton.jsx";
import { NavLink } from "react-router-dom";

const Sidebar = () => {

  const role = "doctor"; // change for testing

  const sidebarConfig = {
    superuser: [
      { label: "Dashboard", path: "/main/dashboard" },
      { label: "Hospitals", path: "/main/hospitals" },
      { label: "Users", path: "/main/users" },
      { label: "Appointments", path: "/main/booked-appointments" },
      { label: "Manage Departments", path: "/main/manage-departments" },
      { label: "Manage Specialization", path: "/main/manage-specializations" },
      { label: "System Overview", path: "/main/system-overview" },
      { label: "System Logs", path: "/main/system-logs" }
    ],
    director: [
      { label: "Dashboard", path: "/main/dashboard" },
      { label: "Staff Schedule", path: "/main/staff-schedule" },
      { label: "Staff", path: "/main/staff" },
      { label: "Patients", path: "/main/patients" },
      { label: "Appointments", path: "/main/booked-appointments" },
      { label: "Manage Departments", path: "/main/manage-departments" },
      { label: "System Overview", path: "/main/system-overview" },
      { label: "Make a Request", path: "/main/make-request" }
    ],
    patient: [
      { label: "Dashboard", path: "/main/dashboard" },
      { label: "Staff Schedule", path: "/main/staff-schedule" },
      { label: "My Records", path: "/main/records" },
      { label: "Appointments", path: "/main/appointments" },
      { label: "My Insurance", path: "/main/insurance" },
      { label: "My Allergies", path: "/main/allergies" },
      { label: "Leave a Review", path: "/main/leave-review" },
      { label: "Make a Request", path: "/main/make-request" }
    ],
    doctor: [
      { label: "Dashboard", path: "/main/dashboard" },
      { label: "Staff Schedule", path: "/main/staff-schedule" },
      { label: "Patients", path: "/main/patients" },
      { label: "Appointments Schedule", path: "/main/appointments-schedule" },
      { label: "Booked Appointments", path: "/main/booked-appointments" },
      { label: "Make a Request", path: "/main/make-request" }
    ],
    nurse: [
      { label: "Dashboard", path: "/main/dashboard" },
      { label: "Staff Schedule", path: "/main/staff-schedule" },
      { label: "Patients", path: "/main/patients" },
      { label: "Make a Request", path: "/main/make-request" }
    ],
  };
  
  const buttons = sidebarConfig[role] || [];

  return (
    <div className="fixed-sidebar">
      <img src="/LOGO_final.png" alt="Logo" className="sidebar-logo" />

      <div className="sidebar-userrole-username-bubble">
        <h3 className="sidebar-user-role">{role}</h3>
        <h3 className="sidebar-username">Username here</h3>
      </div>

      <nav className="buttons-list">
        <ul>
          {buttons.map((btn, index) => (
            <li key={index}>
              <NavLink to={btn.path} state={{ role }} className="sidebar-link">
                <SidebarButton label={btn.label} />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;