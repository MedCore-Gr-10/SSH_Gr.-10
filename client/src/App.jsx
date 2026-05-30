import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Home from "./pages/common/Home.jsx";
import About from "./pages/common/About.jsx";
import Notifications from "./pages/common/Notifications.jsx";
import Profile from "./pages/common/Profile.jsx";
import LogOut from "./pages/common/LogOut.jsx";

import Login from "./pages/auth/login.jsx";
import Register from "./pages/auth/register.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import "./App.css";

import Dashboard from "./pages/routes/Dashboard";
import Hospitals from "./pages/routes/Hospitals";
import Users from "./pages/routes/Users";
import BookedAppointments from "./pages/routes/BookedAppointments";
import ManageDepartments from "./pages/routes/ManageDepartments";
import ManageSpecialization from "./pages/routes/ManageSpecialization";
import SystemOverview from "./pages/routes/SystemOverview";
import SystemLogs from "./pages/routes/SystemLogs";

import StaffSchedule from "./pages/routes/StaffSchedule";
import Staff from "./pages/routes/Staff";
import Patients from "./pages/routes/Patients";
import MakeRequest from "./pages/routes/MakeRequest";

import Records from "./pages/routes/Records";
import Appointments from "./pages/routes/Appointments";
import MyAppointments from "./pages/routes/MyAppointments";
import Insurance from "./pages/routes/Insurance";
import Allergies from "./pages/routes/Allergies";
import EmergencyContacts from "./pages/routes/EmergencyContacts";

import AppointmentsSchedule from "./pages/routes/AppointmentsSchedule";

import NurseMySchedule from "./pages/nurse/NurseMySchedule.jsx";
import NurseStaffSchedules from "./pages/nurse/NurseStaffSchedules.jsx";
import NursePatients from "./pages/nurse/NursePatients.jsx";
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
      <Route element={<ProtectedRoute />}>
        <Route path="/main" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* ===================== HEADER (ALL USERS) ===================== */}
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="logout" element={<LogOut />} />
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
          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="insurance" element={<Insurance />} />
          <Route path="allergies" element={<Allergies />} />
          <Route path="emergency-contacts" element={<EmergencyContacts />} />
          {/* <Route path="staff-schedule" element={<StaffSchedule />} /> */}
          {/* <Route path="make-request" element={<MakeRequest />} /> */}
          {/* ===================== DOCTOR ===================== */}
          <Route path="dashboard" element={<Dashboard />} />
          {/* <Route path="staff-schedule" element={<StaffSchedule />} /> */}
          <Route path="patients" element={<Patients />} />
          <Route
            path="appointments-schedule"
            element={<AppointmentsSchedule />}
          />
          <Route path="booked-appointments" element={<BookedAppointments />} />
          <Route path="make-request" element={<MakeRequest />} />
          {/* ===================== NURSE ===================== */}
          <Route path="nurse/schedule" element={<NurseMySchedule />} />
          <Route path="nurse/staff-schedules" element={<NurseStaffSchedules />} />
          <Route path="nurse/patients" element={<NursePatients />} />
          <Route path="make-request" element={<MakeRequest />} />
        </Route>
      </Route>
    </Routes>
  );
}
