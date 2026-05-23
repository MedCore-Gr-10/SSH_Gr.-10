import React, { useEffect, useState } from "react";
import {
  getNursePatients,
  searchNursePatients,
  getNursePatientAllergies,
  getNursePatientInsurance,
  getNursePatientEmergencyContacts,
  getNursePatientAppointments,
  getNursePatientHistory,
} from "../../services/nurseApi.js";
import "./Nurse.css";

const patientLabel = (p) => {
  const profile = p.users_profiles?.[0]?.profiles;
  const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  return name || p.username || p.id;
};

const emptyDetail = () => ({
  allergies: null,
  insurance: null,
  contacts: null,
  appointments: null,
  history: null,
});

const formatVisitDate = (value) => {
  if (!value) return "Date unknown";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTimeRange = (start, end) => {
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
};

export default function NursePatients() {
  const [allPatients, setAllPatients] = useState([]);
  const [displayPatients, setDisplayPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState("");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [detail, setDetail] = useState(emptyDetail());
  const [activeTab, setActiveTab] = useState("history");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNursePatients();
      const list = data || [];
      setAllPatients(list);
      if (!isSearchMode) {
        setDisplayPatients(list);
      }
    } catch (err) {
      setError(err.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const selectPatient = async (id) => {
    setSelectedId(id);
    setDetail(emptyDetail());
    setActiveTab("history");
    setHistoryFrom("");
    setHistoryTo("");
    setMessage("");
    setError("");

    if (reason.trim().length >= 3) {
      setLoading(true);
      try {
        const data = await getNursePatientHistory(id, reason, {});
        setDetail((d) => ({ ...d, history: data }));
        setMessage("Patient history loaded. Access was recorded in the audit log.");
      } catch (err) {
        setError(err.message || "Unable to load patient history.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setDisplayPatients(allPatients);
      setIsSearchMode(false);
      setError("");
      return;
    }
    if (!reason.trim() || reason.trim().length < 3) {
      setError("Enter an access reason before searching (min. 3 characters).");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await searchNursePatients(q, reason.trim());
      setDisplayPatients(data || []);
      setIsSearchMode(true);
      setSelectedId(null);
      setDetail(emptyDetail());
      if ((data || []).length === 0) {
        setMessage("No patients matched your search.");
      } else {
        setMessage(
          `Found ${data.length} patient(s). Select one and open a tab to view records.`,
        );
      }
    } catch (err) {
      setError(err.message || "Search failed.");
      setDisplayPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setDisplayPatients(allPatients);
    setSelectedId(null);
    setDetail(emptyDetail());
    setMessage("");
    setError("");
  };

  const loadDetail = async (tab) => {
    if (!selectedId) return;
    if (!reason.trim() || reason.trim().length < 3) {
      setError("Enter an access reason (min. 3 characters).");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (tab === "allergies") {
        const data = await getNursePatientAllergies(selectedId, reason);
        setDetail((d) => ({ ...d, allergies: data }));
      } else if (tab === "insurance") {
        const data = await getNursePatientInsurance(selectedId, reason);
        setDetail((d) => ({ ...d, insurance: data }));
      } else if (tab === "contacts") {
        const data = await getNursePatientEmergencyContacts(selectedId, reason);
        setDetail((d) => ({ ...d, contacts: data }));
      } else if (tab === "appointments") {
        const data = await getNursePatientAppointments(selectedId, reason);
        setDetail((d) => ({ ...d, appointments: data }));
      } else if (tab === "history") {
        const data = await getNursePatientHistory(selectedId, reason, {
          from: historyFrom || undefined,
          to: historyTo || undefined,
        });
        setDetail((d) => ({ ...d, history: data }));
      }
      setMessage("Data loaded. Access was recorded in the audit log.");
    } catch (err) {
      setError(err.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient =
    displayPatients.find((p) => p.id === selectedId) ||
    allPatients.find((p) => p.id === selectedId);

  const visits = detail.history?.visits || [];

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h1>
          My Patients
          <span className="nurse-readonly-badge">Read only</span>
        </h1>
        <p>
          Search by name, username, or personal number — then select a
          patient to view history (visits, diagnoses, prescriptions),
          allergies, insurance, and more. All access is logged.
        </p>
      </div>

      {error && <div className="nurse-message error">{error}</div>}
      {message && <div className="nurse-message success">{message}</div>}

      <div className="nurse-patients-toolbar">
        <div className="nurse-reason-row nurse-reason-row--toolbar">
          <label htmlFor="access-reason">
            Reason for access (required for search and viewing records):
          </label>
          <input
            id="access-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. pre-medication allergy check"
          />
        </div>

        <form className="nurse-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search name, username, or personal no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="nurse-btn" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          {(isSearchMode || searchQuery) && (
            <button
              type="button"
              className="nurse-btn nurse-btn--secondary"
              onClick={handleClearSearch}
              disabled={loading}
            >
              Show all
            </button>
          )}
        </form>
      </div>

      {loading && !displayPatients.length && !allPatients.length ? (
        <p className="nurse-loading">Loading patients...</p>
      ) : (
        <div className="nurse-table-wrap">
          <p className="nurse-table-caption">
            {isSearchMode
              ? `Search results (${displayPatients.length})`
              : `All patients (${displayPatients.length})`}
          </p>
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Personal no.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayPatients.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    {isSearchMode
                      ? "No patients matched your search."
                      : "No patients in your hospital tenant."}
                  </td>
                </tr>
              ) : (
                displayPatients.map((p) => (
                  <tr
                    key={p.id}
                    className={
                      selectedId === p.id ? "nurse-table-row--selected" : ""
                    }
                  >
                    <td>{patientLabel(p)}</td>
                    <td>{p.username}</td>
                    <td>
                      {p.users_profiles?.[0]?.profiles?.personal_no || "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="nurse-btn"
                        onClick={() => selectPatient(p.id)}
                      >
                        {selectedId === p.id ? "Selected" : "View records"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedPatient && (
        <div className="nurse-detail-panel">
          <h2>{patientLabel(selectedPatient)}</h2>
          <p className="nurse-detail-hint">
            Open a tab below to load read-only data (uses the access reason
            above).
          </p>

          <div className="nurse-tabs">
            {[
              ["history", "History"],
              ["allergies", "Allergies"],
              ["insurance", "Insurance"],
              ["contacts", "Emergency contacts"],
              ["appointments", "Appointments"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`nurse-tab ${activeTab === key ? "nurse-tab--active" : ""}`}
                onClick={() => {
                  setActiveTab(key);
                  loadDetail(key);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "history" && (
            <div className="nurse-detail-section">
              <h3>Patient history (hospital visits)</h3>

              <div className="nurse-history-filters">
                <label>
                  From
                  <input
                    type="date"
                    value={historyFrom}
                    onChange={(e) => setHistoryFrom(e.target.value)}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={historyTo}
                    onChange={(e) => setHistoryTo(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="nurse-btn"
                  disabled={loading}
                  onClick={() => loadDetail("history")}
                >
                  {loading ? "Loading..." : "Load / apply filters"}
                </button>
              </div>

              {!detail.history ? (
                <p>Click History or &quot;Load / apply filters&quot; to load visits.</p>
              ) : visits.length === 0 ? (
                <p>No visit history found for this hospital (with current filters).</p>
              ) : (
                <>
                  <p className="nurse-detail-hint">
                    {detail.history.total} visit(s) — newest first.
                  </p>
                  <div className="nurse-timeline">
                    {visits.map((visit) => (
                      <article
                        key={visit.id}
                        className={`nurse-timeline-item ${
                          visit.active ? "" : "nurse-timeline-item--inactive"
                        }`}
                      >
                        <div className="nurse-timeline-head">
                          <span className="nurse-timeline-date">
                            {formatVisitDate(visit.appointment_date)}
                          </span>
                          {formatTimeRange(visit.start_time, visit.end_time) && (
                            <span className="nurse-timeline-meta">
                              {formatTimeRange(visit.start_time, visit.end_time)}
                            </span>
                          )}
                          <span
                            className={`nurse-timeline-badge ${
                              visit.active ? "" : "nurse-timeline-badge--inactive"
                            }`}
                          >
                            {visit.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="nurse-timeline-meta">
                          {visit.hospital_name || "Hospital"} ·{" "}
                          {visit.department_name || "Department —"} ·{" "}
                          {visit.doctor_name
                            ? `Dr. ${visit.doctor_name}`
                            : "Doctor —"}
                        </p>

                        <div className="nurse-timeline-block">
                          <h4>Diagnoses</h4>
                          {visit.diagnoses?.length ? (
                            <ul className="nurse-list">
                              {visit.diagnoses.map((d) => (
                                <li key={d.id}>{d.diagnosis}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No diagnosis recorded for this visit.</p>
                          )}
                        </div>

                        <div className="nurse-timeline-block">
                          <h4>Prescriptions</h4>
                          {visit.prescriptions?.length ? (
                            <ul className="nurse-list">
                              {visit.prescriptions.map((p) => (
                                <li key={p.id}>
                                  <strong>{p.medication_name}</strong>
                                  {p.dosage ? ` — ${p.dosage}` : ""}
                                  {p.instructions
                                    ? ` (${p.instructions})`
                                    : ""}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No prescriptions recorded for this visit.</p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "allergies" && (
            <div className="nurse-detail-section">
              <h3>Allergies</h3>
              {!detail.allergies ? (
                <p>Click the Allergies tab to load data.</p>
              ) : detail.allergies.length === 0 ? (
                <p>No allergies on record.</p>
              ) : (
                <ul className="nurse-list">
                  {detail.allergies.map((a) => (
                    <li key={a.id}>{a.allergy_name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "insurance" && (
            <div className="nurse-detail-section">
              <h3>Insurance</h3>
              {!detail.insurance ? (
                <p>Click the Insurance tab to load data.</p>
              ) : detail.insurance.length === 0 ? (
                <p>No insurance on record.</p>
              ) : (
                <ul className="nurse-list">
                  {detail.insurance.map((i) => (
                    <li key={i.id}>
                      {i.provider || "—"} — {i.policy_number || "—"} (
                      {i.coverage_percent ?? "—"}%)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="nurse-detail-section">
              <h3>Emergency contacts</h3>
              {!detail.contacts ? (
                <p>Click the Emergency contacts tab to load data.</p>
              ) : detail.contacts.length === 0 ? (
                <p>No emergency contacts on record.</p>
              ) : (
                <ul className="nurse-list">
                  {detail.contacts.map((c) => (
                    <li key={c.id}>
                      {c.contact_name} ({c.relationship || "—"}) —{" "}
                      {c.phone_number || "—"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="nurse-detail-section">
              <h3>Appointments (hospital only)</h3>
              {!detail.appointments ? (
                <p>Click the Appointments tab to load data.</p>
              ) : detail.appointments.length === 0 ? (
                <p>No appointments on record.</p>
              ) : (
                <ul className="nurse-list">
                  {detail.appointments.map((a) => (
                    <li key={a.id}>
                      Appointment #{a.id} — slot #
                      {a.appointment_booking_slot_id}{" "}
                      {a.active_appointment_made ? "(active)" : "(inactive)"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
