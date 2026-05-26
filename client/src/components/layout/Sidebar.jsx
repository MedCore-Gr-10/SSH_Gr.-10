import React from "react";
import "./Sidebar.css";
import SidebarButton from "../JSXcomponents/SidebarButton.jsx";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import MedCoreLogo2 from "../../assets/MedCoreLogo-2.png";

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || "patient";

  const sidebarConfig = {
    superuser: [
      { label: "System Overview", path: "/main/system-overview" },
      { label: "Hospitals", path: "/main/hospitals" },
      { label: "Users", path: "/main/users" },
      { label: "Appointments Made", path: "/main/booked-appointments" },
      { label: "Manage Departments", path: "/main/manage-departments" },
      { label: "Manage Specialization", path: "/main/manage-specializations" },
      { label: "System Logs", path: "/main/system-logs" },
      { label: "Make a Request", path: "/main/make-request" }
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
      { label: "Book an Appointment", path: "/main/appointments" },
      { label: "My Appointments", path: "/main/my-appointments" },
      { label: "My Records", path: "/main/records" },
      { label: "Emergency Contacts", path: "/main/emergency-contacts" },
      { label: "My Insurance", path: "/main/insurance" },
      { label: "My Allergies", path: "/main/allergies" },
      { label: "Make a Request", path: "/main/make-request" }
    ],
    doctor: [
      { label: "Dashboard", path: "/main/dashboard" },
      { label: "Staff Schedule", path: "/main/doctor-staff-schedule" },
      { label: "Patients", path: "/main/patients" },
      { label: "Appointments Schedule", path: "/main/appointments-schedule" },
      { label: "Booked Appointments", path: "/main/booked-appointments" },
      { label: "Make a Request", path: "/main/make-request" }
    ],
    nurse: [
      { label: "Dashboard", path: "/main/dashboard" },
      { label: "My Schedule", path: "/main/nurse/schedule" },
      { label: "Staff Schedules", path: "/main/nurse/staff-schedules" },
      { label: "My Patients", path: "/main/nurse/patients" },
      { label: "Make a Request", path: "/main/make-request" },
    ],
  };
  
  const buttons = sidebarConfig[role] || [];

  return (
    <div className="fixed-sidebar">
      <img src={MedCoreLogo2} alt="Logo" className="sidebar-logo" />

      <div className="sidebar-userrole-username-bubble">
        <h3 className="sidebar-user-role">{role}</h3>
        <h3 className="sidebar-username">{user?.username}</h3>
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
