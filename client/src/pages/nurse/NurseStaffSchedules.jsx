import React, { useEffect, useMemo, useState } from "react";
import { getNurseStaffSchedules } from "../../services/nurseApi.js";
import {
  departmentName,
  formatTime,
  hospitalName,
  matchesDaySearch,
  matchesStaffNameSearch,
  staffName,
  staffRole,
} from "./nurseScheduleUtils.js";
import "./Nurse.css";

export default function NurseStaffSchedules() {
  const [staffSchedule, setStaffSchedule] = useState([]);
  const [nameQuery, setNameQuery] = useState("");
  const [dayQuery, setDayQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getNurseStaffSchedules();
        setStaffSchedule(data || []);
      } catch (err) {
        setError(err.message || "Unable to load staff schedules.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredRows = useMemo(
    () =>
      staffSchedule.filter(
        (row) =>
          matchesStaffNameSearch(row, nameQuery) &&
          matchesDaySearch(row, dayQuery),
      ),
    [staffSchedule, nameQuery, dayQuery],
  );

  const hasActiveFilters = Boolean(nameQuery.trim() || dayQuery.trim());

  const filterSummary = () => {
    const parts = [];
    if (nameQuery.trim()) parts.push(`name: "${nameQuery.trim()}"`);
    if (dayQuery.trim()) parts.push(`day: "${dayQuery.trim()}"`);
    return parts.join(", ");
  };

  const handleClearFilters = () => {
    setNameQuery("");
    setDayQuery("");
  };

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h1>Staff Schedules</h1>
        <p>
          View active shifts for doctors and nurses at your hospital. Search by
          full name, filter by day, and see each person&apos;s role.
        </p>
      </div>

      {error && <div className="nurse-message error">{error}</div>}

      <div className="nurse-schedule-filters">
        <div className="nurse-schedule-filter-field nurse-schedule-filter-field--wide">
          <label htmlFor="staff-name-search">Full name</label>
          <input
            id="staff-name-search"
            type="text"
            placeholder="e.g. Anna Miller..."
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            aria-label="Search staff by full name"
          />
        </div>
        <div className="nurse-schedule-filter-field">
          <label htmlFor="staff-day-search">Day</label>
          <input
            id="staff-day-search"
            type="text"
            placeholder="e.g. Monday, Wednesday..."
            value={dayQuery}
            onChange={(e) => setDayQuery(e.target.value)}
          />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="nurse-btn nurse-btn--secondary nurse-schedule-clear"
            onClick={handleClearFilters}
          >
            Clear all
          </button>
        )}
      </div>

      {loading ? (
        <p className="nurse-loading">Loading staff schedules...</p>
      ) : (
        <div className="nurse-table-wrap">
          <p className="nurse-table-caption">
            Showing {filteredRows.length} of {staffSchedule.length}
            {hasActiveFilters && filterSummary()
              ? ` (${filterSummary()})`
              : ""}
          </p>
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Hospital</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    {staffSchedule.length === 0
                      ? "No active staff schedules found."
                      : "No schedules match your filters."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{staffName(row)}</td>
                    <td>{staffRole(row)}</td>
                    <td>{row.day_of_week || "—"}</td>
                    <td>{formatTime(row.start_time)}</td>
                    <td>{formatTime(row.end_time)}</td>
                    <td>{hospitalName(row)}</td>
                    <td>{departmentName(row)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
