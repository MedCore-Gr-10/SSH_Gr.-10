import { Routes, Route, Outlet } from "react-router-dom";
import Header from "../../components/layout/Header.jsx";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Home from "./header-pages/Home.jsx";
import About from "./header-pages/About.jsx";
import Notifications from "./header-pages/Notifications.jsx";
import Profile from "./header-pages/Profile.jsx";
import LogOut from "./header-pages/LogOut.jsx";

import Login from "../auth/login.jsx";
import Register from "../auth/register.jsx";
import ForgotPassword from "../auth/ForgotPassword.jsx";
import ResetPassword from "../auth/ResetPassword.jsx";
import ProtectedRoute from "../../components/auth/ProtectedRoute.jsx";
import "../CSSpages/App.css";

import Dashboard from "./sidebar-pages/Dashboard";
import Hospitals from "./sidebar-pages/Hospitals";
import Users from "./sidebar-pages/Users";
import BookedAppointments from "./sidebar-pages/BookedAppointments";
import ManageDepartments from "./sidebar-pages/ManageDepartments";
import ManageSpecialization from "./sidebar-pages/ManageSpecialization";
import SystemOverview from "./sidebar-pages/SystemOverview";
import SystemLogs from "./sidebar-pages/SystemLogs";

import StaffSchedule from "./sidebar-pages/StaffSchedule";
import Staff from "./sidebar-pages/Staff";
import Patients from "./sidebar-pages/Patients";
import MakeRequest from "./sidebar-pages/MakeRequest";

import Records from "./sidebar-pages/Records";
import Appointments from "./sidebar-pages/Appointments";
import Insurance from "./sidebar-pages/Insurance";
import Allergies from "./sidebar-pages/Allergies";
import LeaveReview from "./sidebar-pages/LeaveReview";
import EmergencyContacts from "./sidebar-pages/EmergencyContacts";

import AppointmentsSchedule from "./sidebar-pages/AppointmentsSchedule";

function MainLayout() {
  return (
    <div className="App">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="content-header-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="content-container">
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/main" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* ===================== HEADER (ALL USERS) ===================== */}
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="logout" element={<LogOut />} />
          // SIDE
          BAR-------------------------------------------------------------------
          {/* ===================== SUPERUSER ===================== */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="hospitals" element={<Hospitals />} />
          <Route path="users" element={<Users />} />
          <Route path="booked-appointments" element={<BookedAppointments />} />
          <Route path="manage-departments" element={<ManageDepartments />} />
          <Route
            path="manage-specializations"
            element={<ManageSpecialization />}
          />
          <Route path="system-overview" element={<SystemOverview />} />
          <Route path="system-logs" element={<SystemLogs />} />
          {/* ===================== DIRECTOR ===================== */}
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
          <Route path="staff-schedule" element={<StaffSchedule />} />
          <Route path="doctor-staff-schedule" element={<StaffSchedule />} />
          <Route path="staff" element={<Staff />} />
          <Route path="patients" element={<Patients />} />
          {/* <Route path="booked-appointments" element={<BookedAppointments />} /> */}
          {/* <Route path="manage-departments" element={<ManageDepartments />} /> */}
          {/* <Route path="system-overview" element={<SystemOverview />} /> */}
          <Route path="make-request" element={<MakeRequest />} />
          {/* ===================== PATIENT ===================== */}
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
          <Route path="records" element={<Records />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="insurance" element={<Insurance />} />
          <Route path="allergies" element={<Allergies />} />
          <Route path="leave-review" element={<LeaveReview />} />
          <Route path="emergency-contacts" element={<EmergencyContacts />} />
          {/* <Route path="staff-schedule" element={<StaffSchedule />} /> */}
          {/* <Route path="make-request" element={<MakeRequest />} /> */}
          {/* ===================== DOCTOR ===================== */}
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
          {/* <Route path="staff-schedule" element={<StaffSchedule />} /> */}
          <Route path="patients" element={<Patients />} />
          <Route
            path="appointments-schedule"
            element={<AppointmentsSchedule />}
          />
          <Route path="booked-appointments" element={<BookedAppointments />} />
          <Route path="make-request" element={<MakeRequest />} />
          {/* ===================== NURSE ===================== */}
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
          {/* <Route path="staff-schedule" element={<StaffSchedule />} /> */}
          {/* <Route path="patients" element={<Patients />} /> */}
          <Route path="make-request" element={<MakeRequest />} />
        </Route>
      </Route>
    </Routes>
  );
}
