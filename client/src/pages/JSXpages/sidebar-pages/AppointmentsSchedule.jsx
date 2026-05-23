import DoctorAppointmentSlots from "../../doctor/DoctorAppointmentSlots.jsx";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";

export default function AppointmentsSchedule() {
  const location = useLocation();
  const { user } = useAuth();

  const roleFromState = location.state?.role;
  const role = user?.role || roleFromState || "superuser";

  if(role === "doctor"){
    return <DoctorAppointmentSlots />;
  }
  return (
    <div>
      <h1>Appointments Schedule</h1>
      <p>This page displays the appointment schedule.</p>
    </div>
  );
}