import { getNurseMySchedule } from "../../services/nurseApi.js";
import StaffSchedulePage from "../shared/StaffSchedulePage.jsx";

export default function NurseMySchedule() {
  return (
    <StaffSchedulePage
      view="mine"
      fetchOwnSchedules={getNurseMySchedule}
      pageTitle="My Schedule"
      pageDescription="Your active weekly shifts at this hospital."
    />
  );
}
