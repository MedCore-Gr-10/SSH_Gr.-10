import React, { useEffect, useMemo, useState } from "react";
import {
  cancelPatientAppointment,
  getPatientBookedAppointments,
  getPatientStaffSchedules,
} from "../../services/patientAppointmentsApi";
import "./Appointments.css";

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

const formatDateDisplay = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

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
  "Department not listed";

const getHospital = (schedule) =>
  schedule.staff_hospitals_departments?.hospitals_departments?.hospitals?.hospital_name ||
  "Hospital";

const shiftText = (schedule) => `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`;

const normalize = (value) => String(value || "").toLowerCase();

const pluralizeRole = (role, count) => {
  if (count === 1) return role;
  if (role.endsWith("se")) return `${role}s`;
  if (role.endsWith("y")) return `${role.slice(0, -1)}ies`;
  return `${role}s`;
};

const getAppointmentDetails = (booking) => booking.appointment || {};

export default function MyAppointments() {
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [staffSchedules, setStaffSchedules] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(getTodayDay());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedHospital, setSelectedHospital] = useState("all");
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadBookedAppointments = async () => {
    try {
      setLoading(true);
      const data = await getPatientBookedAppointments();
      setBookedAppointments(data || []);
      setError("");
    } catch (err) {
      setError("Failed to load booked appointments: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookedAppointments();
  }, []);

  useEffect(() => {
    const loadStaffSchedules = async () => {
      try {
        setLoadingSchedules(true);
        const data = await getPatientStaffSchedules();
        setStaffSchedules(data || []);
      } catch (err) {
        setError("Failed to load staff schedules: " + err.message);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadStaffSchedules();
  }, []);

  const activeSchedules = useMemo(
    () =>
      staffSchedules
        .filter((schedule) => schedule.active_schedule !== false)
        .sort((a, b) => timeValue(a.start_time) - timeValue(b.start_time)),
    [staffSchedules]
  );

  const selectedDaySchedules = useMemo(
    () => activeSchedules.filter((schedule) => schedule.day_of_week === selectedDay),
    [activeSchedules, selectedDay]
  );

  const departmentOptions = useMemo(
    () =>
      Array.from(new Set(activeSchedules.map(getDepartment)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [activeSchedules]
  );

  const hospitalOptions = useMemo(
    () =>
      Array.from(new Set(activeSchedules.map(getHospital)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [activeSchedules]
  );

  const filteredSchedules = useMemo(
    () =>
      selectedDaySchedules.filter((schedule) => {
        const role = getStaffRole(schedule).toLowerCase();
        const matchesSearch =
          !searchTerm.trim() || normalize(getStaffName(schedule)).includes(normalize(searchTerm.trim()));
        const matchesRole = selectedRole === "all" || role === selectedRole;
        const matchesDepartment =
          selectedDepartment === "all" || getDepartment(schedule) === selectedDepartment;
        const matchesHospital =
          selectedHospital === "all" || getHospital(schedule) === selectedHospital;

        return matchesSearch && matchesRole && matchesDepartment && matchesHospital;
      }),
    [searchTerm, selectedDaySchedules, selectedDepartment, selectedHospital, selectedRole]
  );

  const roleCounts = useMemo(
    () =>
      filteredSchedules.reduce((counts, schedule) => {
        const role = getStaffRole(schedule);
        counts[role] = (counts[role] || 0) + 1;
        return counts;
      }, {}),
    [filteredSchedules]
  );

  const handleCancelAppointment = async () => {
    if (!activeBooking) return;

    try {
      setCancelingId(activeBooking.id);
      setSuccessMessage("");
      await cancelPatientAppointment(activeBooking.id);
      setBookedAppointments((current) =>
        current.filter((booking) => booking.id !== activeBooking.id)
      );
      setSuccessMessage("Appointment canceled successfully.");
      setActiveBooking(null);
      setConfirmingCancel(false);
    } catch (err) {
      setError("Failed to cancel appointment: " + err.message);
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-card">
        <h1 className="appointments-title">My Appointments</h1>
        <p className="appointments-description">
          Review your booked appointments and cancel upcoming visits when needed.
        </p>

        {error && <div className="appointments-error">{error}</div>}
        {successMessage && <div className="appointments-success">{successMessage}</div>}

        <div className="appointments-table-wrapper">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Hospital</th>
                <th>Specialization</th>
                <th>Time Slot</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="no-results">
                    Loading booked appointments...
                  </td>
                </tr>
              )}

              {!loading && bookedAppointments.length ? (
                bookedAppointments.map((booking) => {
                  const appointment = getAppointmentDetails(booking);

                  return (
                    <tr
                      key={booking.id}
                      className="appointments-row"
                      onClick={() => {
                        setActiveBooking(booking);
                        setConfirmingCancel(false);
                      }}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setActiveBooking(booking);
                          setConfirmingCancel(false);
                        }
                      }}
                    >
                      <td>{appointment.doctor || "Doctor"}</td>
                      <td>{appointment.hospitalName || "Hospital"}</td>
                      <td>{appointment.specialization || "General Medicine"}</td>
                      <td>{appointment.time || ""}</td>
                      <td>{formatDateDisplay(appointment.date)}</td>
                      <td className="row-arrow">-&gt;</td>
                    </tr>
                  );
                })
              ) : null}

              {!loading && !bookedAppointments.length && (
                <tr>
                  <td colSpan={6} className="no-results">
                    You do not have any booked appointments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section className="patient-staff-section">
        <div className="patient-staff-section-heading">
          <div>
            <h2>Who Is Working</h2>
            <p>See doctor and nurse weekly schedules for your selected hospitals.</p>
          </div>
          <span>{selectedDay}</span>
        </div>

        {loadingSchedules && (
          <div className="appointments-empty-state">Loading staff schedules...</div>
        )}

        {!loadingSchedules && !activeSchedules.length && (
          <div className="appointments-empty-state">
            No active staff schedules are available for your selected hospitals.
          </div>
        )}

        {!!activeSchedules.length && (
          <>
            <div className="patient-staff-day-tabs" role="tablist" aria-label="Filter schedules by day">
              {weekDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={day === selectedDay ? "active" : ""}
                  onClick={() => setSelectedDay(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="patient-staff-filter-row">
              <label className="patient-staff-search">
                Search by name
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Staff name"
                />
              </label>

              <fieldset className="patient-staff-role-filter">
                <legend>Role</legend>
                {[
                  { label: "All", value: "all" },
                  { label: "Doctor", value: "doctor" },
                  { label: "Nurse", value: "nurse" },
                ].map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="patient-staff-role-filter"
                      value={option.value}
                      checked={selectedRole === option.value}
                      onChange={(event) => setSelectedRole(event.target.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </fieldset>

              <label className="patient-staff-select-filter">
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

              <label className="patient-staff-select-filter">
                Hospital
                <select
                  value={selectedHospital}
                  onChange={(event) => setSelectedHospital(event.target.value)}
                >
                  <option value="all">All hospitals</option>
                  {hospitalOptions.map((hospital) => (
                    <option key={hospital} value={hospital}>
                      {hospital}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="patient-staff-role-counts" aria-label="Staff counts by role">
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

            <div className="patient-staff-table-wrapper">
              <table className="patient-staff-table">
                <thead>
                  <tr>
                    <th>Staff member</th>
                    <th>Role</th>
                    <th>Hospital</th>
                    <th>Department</th>
                    <th>Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="patient-staff-empty-row">
                        No active staff shifts found for {selectedDay}.
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td data-label="Staff member">
                          <strong>{getStaffName(schedule)}</strong>
                        </td>
                        <td data-label="Role">{getStaffRole(schedule)}</td>
                        <td data-label="Hospital">{getHospital(schedule)}</td>
                        <td data-label="Department">{getDepartment(schedule)}</td>
                        <td data-label="Shift">{shiftText(schedule)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {activeBooking && (
        <div className="modal-backdrop" onClick={() => setActiveBooking(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            {(() => {
              const appointment = getAppointmentDetails(activeBooking);

              return (
                <>
                  <div className="modal-header">
                    <div>
                      <h2>{appointment.doctor || "Doctor"}</h2>
                      <p className="modal-subtitle">
                        {appointment.specialization || "General Medicine"} consultation
                      </p>
                    </div>
                    <button
                      type="button"
                      className="modal-close"
                      onClick={() => setActiveBooking(null)}
                    >
                      &times;
                    </button>
                  </div>

                  <div className="modal-details">
                    <div className="modal-row">
                      <div>
                        <h3>Time slot</h3>
                        <p>{appointment.time || ""}</p>
                      </div>
                      <div>
                        <h3>Date</h3>
                        <p>{formatDateDisplay(appointment.date)}</p>
                      </div>
                    </div>

                    <div className="modal-row">
                      <div>
                        <h3>Location</h3>
                        <p>{appointment.location || appointment.hospitalName || "Hospital"}</p>
                      </div>
                      <div>
                        <h3>Hospital</h3>
                        <p>{appointment.hospitalName || "Hospital"}</p>
                      </div>
                    </div>

                    {confirmingCancel && (
                      <div className="modal-confirmation">
                        <h3>Cancel appointment?</h3>
                        <p>Are you sure you want to cancel this appointment?</p>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="modal-secondary"
                      onClick={() => {
                        setActiveBooking(null);
                        setConfirmingCancel(false);
                      }}
                    >
                      Close
                    </button>

                    {confirmingCancel ? (
                      <>
                        <button
                          type="button"
                          className="modal-secondary"
                          onClick={() => setConfirmingCancel(false)}
                        >
                          Keep appointment
                        </button>
                        <button
                          type="button"
                          className="modal-danger"
                          onClick={handleCancelAppointment}
                          disabled={cancelingId === activeBooking.id}
                        >
                          {cancelingId === activeBooking.id ? "Canceling..." : "Yes, cancel"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="modal-danger"
                        onClick={() => setConfirmingCancel(true)}
                      >
                        Cancel appointment
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
