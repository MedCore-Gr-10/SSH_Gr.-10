import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/authContext.jsx";
import "../doctor/DoctorStaffSchedule.css";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getTodayDay = () =>
  new Intl.DateTimeFormat("en", { weekday: "long" }).format(new Date());

const formatTime = (value) => {
  if (!value) return "-";

  let date;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    date = new Date(`1970-01-01T${value}`);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return value.length >= 5 ? value.slice(0, 5) : value;
  }

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const timeValue = (value) => {
  if (!value) return 0;
  const text = String(value);
  if (/^\d{1,2}:\d{2}/.test(text)) {
    const [hour, minute] = text.split(":").map(Number);
    return hour * 60 + minute;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return 0;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

const getStaffUser = (schedule) => schedule.staff_hospitals_departments?.users || {};

const getStaffName = (schedule) => {
  const user = getStaffUser(schedule);
  const profile = user.users_profiles?.[0]?.profiles || {};
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  return fullName || user.username || "Unknown staff";
};

const getStaffRole = (schedule) => {
  const role = getStaffUser(schedule).roles?.role_name;
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : "Staff";
};

const getDepartment = (schedule) =>
  schedule.staff_hospitals_departments?.hospitals_departments?.departments?.department_name ||
  schedule.department?.department_name ||
  "Department not listed";

const shiftText = (schedule) =>
  `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`;

const getCurrentMinute = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const isWorkingNow = (schedule) => {
  if (schedule.day_of_week !== getTodayDay()) return false;

  const start = timeValue(schedule.start_time);
  const end = timeValue(schedule.end_time);
  const current = getCurrentMinute();

  if (end < start) {
    return current >= start || current <= end;
  }

  return current >= start && current <= end;
};

const normalize = (value) => String(value || "").toLowerCase();

const pluralizeRole = (role, count) => {
  if (count === 1) return role;
  if (role.endsWith("se")) return `${role}s`;
  if (role.endsWith("y")) return `${role.slice(0, -1)}ies`;
  return `${role}s`;
};

export default function StaffSchedulePage({
  view = "full",
  fetchOwnSchedules,
  fetchHospitalSchedules,
  pageTitle = "Staff Schedule",
  pageDescription = "Check your weekly shifts and see who is working in the hospital by day.",
}) {
  const showMine = view === "full" || view === "mine";
  const showStaff = view === "full" || view === "staff";

  const { user } = useAuth();
  const [mySchedules, setMySchedules] = useState([]);
  const [hospitalSchedules, setHospitalSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState(getTodayDay());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        setError("");
        const tasks = [];

        if (showMine && fetchOwnSchedules) {
          tasks.push(
            fetchOwnSchedules().then((data) => {
              setMySchedules(data || []);
            }),
          );
        }

        if (showStaff && fetchHospitalSchedules) {
          tasks.push(
            fetchHospitalSchedules().then((data) => {
              setHospitalSchedules(data || []);
            }),
          );
        }

        await Promise.all(tasks);
      } catch (err) {
        setError(err.message || "Unable to load staff schedules.");
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [showMine, showStaff, fetchOwnSchedules, fetchHospitalSchedules]);

  const activeHospitalSchedules = useMemo(
    () =>
      hospitalSchedules
        .filter((schedule) => schedule.active_schedule !== false)
        .sort((a, b) => timeValue(a.start_time) - timeValue(b.start_time)),
    [hospitalSchedules],
  );

  const ownStaffId = user?.id || user?.user_id;
  const ownScheduleIds = useMemo(
    () => new Set(mySchedules.map((schedule) => schedule.id)),
    [mySchedules],
  );

  const ownSchedules = useMemo(() => {
    if (view === "mine") {
      return mySchedules
        .filter((schedule) => schedule.active_schedule !== false)
        .sort((a, b) => timeValue(a.start_time) - timeValue(b.start_time));
    }

    return activeHospitalSchedules.filter(
      (schedule) =>
        String(schedule.staff_id) === String(ownStaffId) ||
        ownScheduleIds.has(schedule.id),
    );
  }, [view, mySchedules, activeHospitalSchedules, ownScheduleIds, ownStaffId]);

  const schedulesByDay = useMemo(
    () =>
      weekDays.reduce((days, day) => {
        days[day] = activeHospitalSchedules.filter((schedule) => schedule.day_of_week === day);
        return days;
      }, {}),
    [activeHospitalSchedules],
  );

  const ownSchedulesByDay = useMemo(
    () =>
      weekDays.reduce((days, day) => {
        days[day] = ownSchedules.filter((schedule) => schedule.day_of_week === day);
        return days;
      }, {}),
    [ownSchedules],
  );

  const departmentOptions = useMemo(
    () =>
      Array.from(new Set(activeHospitalSchedules.map(getDepartment)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [activeHospitalSchedules],
  );

  const selectedDaySchedules = schedulesByDay[selectedDay] || [];

  const filteredSchedules = useMemo(
    () =>
      selectedDaySchedules.filter((schedule) => {
        const role = getStaffRole(schedule).toLowerCase();
        const matchesDepartment =
          selectedDepartment === "all" || getDepartment(schedule) === selectedDepartment;
        const matchesRole = selectedRole === "all" || role === selectedRole;
        const matchesSearch =
          !searchTerm.trim() ||
          normalize(getStaffName(schedule)).includes(normalize(searchTerm.trim()));

        return matchesDepartment && matchesRole && matchesSearch;
      }),
    [selectedDaySchedules, selectedDepartment, selectedRole, searchTerm],
  );

  const roleCounts = useMemo(
    () =>
      filteredSchedules.reduce((counts, schedule) => {
        const role = getStaffRole(schedule);
        counts[role] = (counts[role] || 0) + 1;
        return counts;
      }, {}),
    [filteredSchedules],
  );

  const workingNowSchedules = useMemo(
    () => activeHospitalSchedules.filter(isWorkingNow),
    [activeHospitalSchedules],
  );

  return (
    <div className="doctor-staff-schedule-page">
      <div className="doctor-staff-schedule-header">
        <div>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
        <div className="doctor-staff-schedule-total">
          {showMine && !showStaff ? (
            <>
              <strong>{ownSchedules.length}</strong>
              <span>
                active shift{ownSchedules.length === 1 ? "" : "s"}
              </span>
            </>
          ) : (
            <>
              <strong>{selectedDaySchedules.length}</strong>
              <span>working {selectedDay}</span>
            </>
          )}
        </div>
      </div>

      {error && <div className="doctor-staff-schedule-alert">{error}</div>}
      {loading && <div className="doctor-staff-schedule-loading">Loading schedules...</div>}

      {showMine && (
      <section className="doctor-staff-calendar-section">
        <div className="doctor-staff-section-heading">
          <h2>My Weekly Schedule</h2>
          <span>
            {ownSchedules.length} active shift{ownSchedules.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="doctor-staff-calendar-grid">
          {weekDays.map((day) => {
            const shifts = ownSchedulesByDay[day] || [];
            return (
              <div key={day} className="doctor-staff-calendar-day">
                <div className="doctor-staff-calendar-day-name">{day}</div>
                {shifts.length === 0 ? (
                  <div className="doctor-staff-empty-shift">Off</div>
                ) : (
                  shifts.map((schedule) => (
                    <div key={schedule.id} className="doctor-staff-shift-block">
                      <strong>{shiftText(schedule)}</strong>
                      <span>{getDepartment(schedule)}</span>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </section>
      )}

      {showStaff && (
      <section className="doctor-staff-now-section">
        <div className="doctor-staff-section-heading">
          <h2>Working Right Now</h2>
          <button
            className="doctor-staff-today-button"
            type="button"
            onClick={() => setSelectedDay(getTodayDay())}
          >
            Today
          </button>
        </div>

        {workingNowSchedules.length === 0 ? (
          <div className="doctor-staff-now-empty">
            No active shifts are marked as working right now.
          </div>
        ) : (
          <div className="doctor-staff-now-grid">
            {workingNowSchedules.map((schedule) => (
              <div key={schedule.id} className="doctor-staff-now-card">
                <strong>{getStaffName(schedule)}</strong>
                <span>
                  {getStaffRole(schedule)} - {getDepartment(schedule)}
                </span>
                <small>{shiftText(schedule)}</small>
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {showStaff && (
      <section className="doctor-staff-day-section">
        <div className="doctor-staff-section-heading">
          <h2>Who Is Working</h2>
          <span>{selectedDay}</span>
        </div>

        <div className="doctor-staff-day-tabs" role="tablist" aria-label="Filter schedules by day">
          {weekDays.map((day) => (
            <button
              key={day}
              className={day === selectedDay ? "active" : ""}
              type="button"
              onClick={() => setSelectedDay(day)}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className="doctor-staff-filter-row">
          <label className="doctor-staff-search">
            Search by name
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Staff name"
            />
          </label>
          <fieldset className="doctor-staff-role-filter">
            <legend>Role</legend>
            {[
              { label: "All", value: "all" },
              { label: "Doctor", value: "doctor" },
              { label: "Nurse", value: "nurse" },
            ].map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="staff-schedule-role-filter"
                  value={option.value}
                  checked={selectedRole === option.value}
                  onChange={(event) => setSelectedRole(event.target.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <label className="doctor-staff-department-filter">
            Department
            <select
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
            >
              <option value="all">All departments</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="doctor-staff-role-counts" aria-label="Staff counts by role">
          {Object.keys(roleCounts).length === 0 ? (
            <span>No matching staff</span>
          ) : (
            Object.entries(roleCounts).map(([role, count]) => (
              <span key={role}>
                {count} {pluralizeRole(role, count)}
              </span>
            ))
          )}
        </div>

        <div className="doctor-staff-table-wrapper">
          <table className="doctor-staff-table">
            <thead>
              <tr>
                <th>Staff member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="4" className="doctor-staff-empty-row">
                    No active staff shifts found for {selectedDay}.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td data-label="Staff member">
                      <strong>{getStaffName(schedule)}</strong>
                      {schedule.staff_id === ownStaffId && (
                        <span className="doctor-staff-you">You</span>
                      )}
                    </td>
                    <td data-label="Role">{getStaffRole(schedule)}</td>
                    <td data-label="Department">{getDepartment(schedule)}</td>
                    <td data-label="Shift">{shiftText(schedule)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}
    </div>
  );
}
