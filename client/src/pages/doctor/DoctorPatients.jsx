import { useEffect, useMemo, useState } from "react";
import { getDoctorPatients } from "../../services/doctorPatientsApi.js";
import "./DoctorPatients.css";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getFullName = (patient) => {
  const profile = patient.profile || {};
  return `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || patient.username || "-";
};

const matchesSearch = (patient, searchTerm) => {
  const profile = patient.profile || {};
  const haystack = [
    patient.username,
    patient.email,
    profile.first_name,
    profile.last_name,
    profile.personal_no,
    profile.phone_number,
    patient.departments?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm.toLowerCase());
};

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDoctorPatients();
      setPatients(data || []);
    } catch (err) {
      setError(err.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) return patients;
    return patients.filter((patient) => matchesSearch(patient, trimmedSearch));
  }, [patients, searchTerm]);

  return (
    <div className="doctor-patients-page">
      <div className="doctor-patients-header">
        <div>
          <h1>My Patients</h1>
          <p>Patients shown here are based on past appointments booked with you.</p>
        </div>
        <button type="button" onClick={loadPatients} disabled={loading}>
          Refresh
        </button>
      </div>

      <section className="doctor-patients-toolbar">
        <label>
          Search patients
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Name, username, email, phone, personal no."
          />
        </label>
        <div className="doctor-patients-count">
          <strong>{filteredPatients.length}</strong>
          <span>{filteredPatients.length === 1 ? "patient" : "patients"}</span>
        </div>
      </section>

      {error && <div className="doctor-patients-alert doctor-patients-alert--error">{error}</div>}

      <section className="doctor-patients-card">
        {loading && <p className="doctor-patients-empty">Loading patients...</p>}

        {!loading && filteredPatients.length === 0 && (
          <p className="doctor-patients-empty">
            {patients.length === 0
              ? "No treated patients found yet."
              : "No patients match your search."}
          </p>
        )}

        {!loading && filteredPatients.length > 0 && (
          <div className="doctor-patients-table-wrapper">
            <table className="doctor-patients-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Personal No.</th>
                  <th>Departments</th>
                  <th>Visits</th>
                  <th>Last appointment</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const profile = patient.profile || {};
                  return (
                    <tr key={patient.id}>
                      <td data-label="Patient">
                        <strong>{getFullName(patient)}</strong>
                        <span>{patient.username || "-"}</span>
                      </td>
                      <td data-label="Contact">
                        <strong>{patient.email || "-"}</strong>
                        <span>{profile.phone_number || "-"}</span>
                      </td>
                      <td data-label="Personal No.">{profile.personal_no || "-"}</td>
                      <td data-label="Departments">
                        {patient.departments?.length ? patient.departments.join(", ") : "-"}
                      </td>
                      <td data-label="Visits">{patient.appointment_count || 0}</td>
                      <td data-label="Last appointment">{formatDate(patient.last_appointment_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
