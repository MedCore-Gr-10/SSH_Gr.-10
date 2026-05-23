import React, { useEffect, useState } from "react";
import { getNurseMySchedule } from "../../services/nurseApi.js";
import {
  departmentName,
  formatTime,
  hospitalName,
} from "./nurseScheduleUtils.js";
import "./Nurse.css";

export default function NurseMySchedule() {
  const [mySchedule, setMySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getNurseMySchedule();
        setMySchedule(data || []);
      } catch (err) {
        setError(err.message || "Unable to load your schedule.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h1>My Schedule</h1>
        <p>Your active shifts at this hospital.</p>
      </div>

      {error && <div className="nurse-message error">{error}</div>}

      {loading ? (
        <p className="nurse-loading">Loading your schedule...</p>
      ) : (
        <div className="nurse-table-wrap">
          <p className="nurse-table-caption">
            My shifts ({mySchedule.length})
          </p>
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Hospital</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {mySchedule.length === 0 ? (
                <tr>
                  <td colSpan={5}>No active shifts found.</td>
                </tr>
              ) : (
                mySchedule.map((row) => (
                  <tr key={row.id}>
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
