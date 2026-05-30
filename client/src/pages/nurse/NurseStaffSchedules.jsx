import { getNurseStaffSchedules } from "../../services/nurseApi.js";
import StaffSchedulePage from "../shared/StaffSchedulePage.jsx";

export default function NurseStaffSchedules() {
  return (
    <StaffSchedulePage
      view="staff"
      fetchHospitalSchedules={getNurseStaffSchedules}
      pageTitle="Staff Schedules"
      pageDescription="Browse hospital staff shifts by day."
    />
  );
}
