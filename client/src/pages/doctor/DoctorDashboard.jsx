import { useEffect, useState } from "react";
import { getDoctorDashboard } from "../../services/doctorDashboardApi.js";
import "./DoctorDashboard.css";

const formatTime = (value) => {
  if (!value) return "-";

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const [hour, minute] = value.split(":");
    return `${hour.padStart(2, "0")}:${minute}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getDoctorDashboard();
    setData(res);
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Error loading dashboard</p>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Doctor Dashboard</h1>

      {/* STATS */}
      <div className="stats-grid">
        <Stat title="Today Appointments" value={data.stats.todayAppointments} />
        <Stat title="Free Slots" value={data.stats.freeSlotsToday} />
        <Stat title="Patients" value={data.stats.totalPatients} />
        <Stat title="This Week" value={data.stats.upcomingWeekAppointments} />
      </div>

      {/* ALERTS */}
      <div className="section">
        <h2>Alerts</h2>
        {data.alerts.map((a, i) => (
          <div key={i} className={`alert ${a.type}`}>
            {a.message}
          </div>
        ))}
      </div>

      {/* TODAY SCHEDULE */}
      <div className="section">
        <h2>Today Schedule</h2>
        {data.todaySchedule.map((s) => (
          <div key={s.id} className="list-item">
            <span>
              {formatTime(s.slot_start_time)} - {formatTime(s.slot_end_time)}
            </span>
          </div>
        ))}
      </div>

      {/* PATIENTS */}
      <div className="section">
        <h2>Recent Patients</h2>
        {data.recentPatients.map((p) => (
          <div key={p.id} className="list-item">
            <span>{p.username}</span>
            <span>{p.appointment_count} visits</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
