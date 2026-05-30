import React, { useEffect, useMemo, useState } from "react";
import { getDirectorStaff } from "../../services/directorStaffApi";
import {
  getDirectorStaffSchedules,
  createDirectorStaffSchedule,
  updateDirectorStaffSchedule,
  deleteDirectorStaffSchedule,
} from "../../services/directorStaffScheduleApi";
import { getDirectorDepartments } from "../../services/directorDepartmentsApi";
import "./DirectorStaffSchedule.css";

const initialFormState = {
  staff_id: "",
  department_id: "",
  day_of_week: "Monday",
  start_time: "08:00",
  end_time: "16:00",
  active_schedule: true,
};

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function DirectorStaffSchedule() {
  const [scheduleList, setScheduleList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [formValues, setFormValues] = useState(initialFormState);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [staff, schedules, departments] = await Promise.all([
        getDirectorStaff(),
        getDirectorStaffSchedules(),
        getDirectorDepartments(),
      ]);
      setStaffList(staff || []);
      setScheduleList(schedules || []);
      setDepartmentList(departments || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const daySummary = useMemo(
    () =>
      weekDays.map((day) => ({
        day,
        count: scheduleList.filter((item) => item.day_of_week === day).length,
      })),
    [scheduleList]
  );

  const formatTime = (value) => {
    if (!value) return "";
    if (typeof value !== "string") {
      return new Date(value).toISOString().slice(11, 16);
    }
    const isoTimeMatch = value.match(/T(\d{2}:\d{2})/);
    if (isoTimeMatch) return isoTimeMatch[1];
    return value.length >= 5 ? value.slice(0, 5) : value;
  };

  const getStaffFullName = (schedule) => {
    const user = schedule.staff_hospitals_departments?.users;
    const profile = user?.users_profiles?.[0]?.profiles || {};
    const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    return fullName || user?.username || "Unknown";
  };

  const getStaffRole = (schedule) => {
    return schedule.staff_hospitals_departments?.users?.roles?.role_name || "—";
  };

  const getDepartmentLabel = (schedule) => {
    return (
      schedule.staff_hospitals_departments?.hospitals_departments?.departments?.department_name ||
      departmentList.find((department) => department.id === schedule.department_id)?.department_name ||
      schedule.department_id ||
      "—"
    );
  };

  const selectedStaff = staffList.find((staff) => staff.id === formValues.staff_id);
  const availableDepartments =
    selectedStaff?.staff_hospitals_departments?.map((assignment) => {
      const department = assignment.hospitals_departments?.departments;
      return department || departmentList.find((item) => item.id === assignment.department_id);
    }).filter(Boolean) || departmentList;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "staff_id" ? { department_id: "" } : {}),
    }));
  };

  const handleEdit = (schedule) => {
    setSelectedScheduleId(schedule.id);
    setFormValues({
      staff_id: schedule.staff_id || "",
      department_id: schedule.department_id || "",
      day_of_week: schedule.day_of_week || "Monday",
      start_time: formatTime(schedule.start_time),
      end_time: formatTime(schedule.end_time),
      active_schedule: schedule.active_schedule ?? true,
    });
    setMessage(null);
    setError(null);
  };

  const handleReset = () => {
    setSelectedScheduleId(null);
    setFormValues(initialFormState);
    setMessage(null);
    setError(null);
  };

  const normalizeTime = (value) => {
    if (!value) return value;
    if (value.length === 5) return `${value}:00`;
    return value;
  };

  const hasDuplicateStaffDay = () =>
    scheduleList.some(
      (schedule) =>
        schedule.id !== selectedScheduleId &&
        schedule.staff_id === formValues.staff_id &&
        schedule.day_of_week === formValues.day_of_week
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (hasDuplicateStaffDay()) {
        throw new Error("This staff member already has a schedule for this day.");
      }

      const payload = {
        ...formValues,
        start_time: normalizeTime(formValues.start_time),
        end_time: normalizeTime(formValues.end_time),
      };

      if (selectedScheduleId) {
        await updateDirectorStaffSchedule(selectedScheduleId, payload);
        setMessage("Schedule updated successfully.");
      } else {
        await createDirectorStaffSchedule(payload);
        setMessage("Schedule shift created successfully.");
      }

      handleReset();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this schedule shift?")) {
      return;
    }

    try {
      await deleteDirectorStaffSchedule(id);
      setMessage("Schedule shift removed.");
      setError(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="director-staff-schedule-page">
      <div className="director-staff-schedule-header">
        <div>
          <h1>Director Staff Schedule</h1>
          <p>Review and manage staff working schedules for your hospital.</p>
        </div>
      </div>

      <section className="director-schedule-overview">
        <h2>Weekly overview</h2>
        <div className="overview-grid">
          {daySummary.map((item) => (
            <div key={item.day} className="overview-card">
              <span>{item.day}</span>
              <strong>{item.count} shift{item.count === 1 ? "" : "s"}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="director-staff-schedule-grid">
        <section className="director-staff-schedule-table-section content-scroll">
          <h2>Schedule shifts</h2>
          <table className="director-staff-schedule-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Department</th>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduleList.length === 0 ? (
                <tr>
                  <td colSpan="8">No schedule shifts found.</td>
                </tr>
              ) : (
                scheduleList.map((schedule) => (
                  <tr key={schedule.id}>
                    <td data-label="Staff">{getStaffFullName(schedule)}</td>
                    <td data-label="Role">{getStaffRole(schedule)}</td>
                    <td data-label="Department">{getDepartmentLabel(schedule)}</td>
                    <td data-label="Day">{schedule.day_of_week || "—"}</td>
                    <td data-label="Start">{formatTime(schedule.start_time)}</td>
                    <td data-label="End">{formatTime(schedule.end_time)}</td>
                    <td data-label="Active">{schedule.active_schedule ? "Yes" : "No"}</td>
                    <td data-label="Actions">
                      <button className="edit-button" onClick={() => handleEdit(schedule)}>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => handleDelete(schedule.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="director-staff-schedule-form-section content-scroll">
          <h2>{selectedScheduleId ? "Edit shift" : "Create new shift"}</h2>
          <form className="director-staff-schedule-form" onSubmit={handleSubmit}>
            <label>
              Staff member
              <select name="staff_id" value={formValues.staff_id} onChange={handleChange}>
                <option value="">Select staff</option>
                {staffList.map((staff) => {
                  const profile = staff.users_profiles?.[0]?.profiles || {};
                  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
                  return (
                    <option key={staff.id} value={staff.id}>
                      {fullName || staff.username}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Department
              <select
                name="department_id"
                value={formValues.department_id}
                onChange={handleChange}
              >
                <option value="">Select department</option>
                {availableDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.department_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Day of week
              <select name="day_of_week" value={formValues.day_of_week} onChange={handleChange}>
                {weekDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Start time
              <input
                name="start_time"
                type="time"
                value={formValues.start_time}
                onChange={handleChange}
              />
            </label>

            <label>
              End time
              <input
                name="end_time"
                type="time"
                value={formValues.end_time}
                onChange={handleChange}
              />
            </label>

            <label className="checkbox-label">
              <input
                name="active_schedule"
                type="checkbox"
                checked={formValues.active_schedule}
                onChange={handleChange}
              />
              Active shift
            </label>

            <div className="director-staff-schedule-actions">
              <button className="primary" type="submit" disabled={isSubmitting}>
                {selectedScheduleId ? "Save changes" : "Create shift"}
              </button>
              <button className="secondary" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>

          {message && <div className="director-message success">{message}</div>}
          {error && <div className="director-message error">{error}</div>}
        </section>
      </div>
    </div>
  );
}
