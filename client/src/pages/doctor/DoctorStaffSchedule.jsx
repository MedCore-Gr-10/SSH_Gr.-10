import {
  getDoctorHospitalStaffSchedules,
  getStaffSchedules,
} from "../../services/staffSchedulesApi.js";
import StaffSchedulePage from "../shared/StaffSchedulePage.jsx";

export default function DoctorStaffSchedule() {
  return (
    <StaffSchedulePage
      fetchOwnSchedules={getStaffSchedules}
      fetchHospitalSchedules={getDoctorHospitalStaffSchedules}
    />
  );
}
