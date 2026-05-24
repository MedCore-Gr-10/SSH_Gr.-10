import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDoctorPatients,
  getDoctorPatientAllergies,
  getDoctorPatientInsurance,
  getDoctorPatientEmergencyContacts,
  getDoctorPatientAppointments,
  getDoctorPatientHistory,
} from "../../services/doctorPatientsApi.js";
import {
  matchesPatientSearch,
  patientLabel,
  patientPersonalNo,
} from "../nurse/nursePatientUtils.js";
import "./DoctorStaffSchedule.css";
import "../nurse/Nurse.css";
import "./DoctorPatients.css";

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
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
};

const todayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const validateHistoryDateRange = (from, to) => {
  const today = todayDateString();

  if (from && from > today) {
    return "The start date cannot be after today.";
  }
  if (to && to > today) {
    return "The end date cannot be after today.";
  }
  if (from && to && from > to) {
    return 'The "From" date cannot be after the "To" date.';
  }
  return null;
};

export default function DoctorPatients() {
  const [allPatients, setAllPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingPatientId, setPendingPatientId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [recordsUnlocked, setRecordsUnlocked] = useState(false);
  const [reason, setReason] = useState("");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [detail, setDetail] = useState(emptyDetail());
  const [activeTab, setActiveTab] = useState("history");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const accessPromptRef = useRef(null);
  const detailPanelRef = useRef(null);

  const loadPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDoctorPatients();
      setAllPatients(data || []);
    } catch (err) {
      setError(err.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(
    () =>
      allPatients.filter((patient) => matchesPatientSearch(patient, searchTerm)),
    [allPatients, searchTerm],
  );

  const hasActiveSearch = Boolean(searchTerm.trim());

  const pendingPatient = allPatients.find((p) => p.id === pendingPatientId);
  const selectedPatient = allPatients.find((p) => p.id === selectedId);

  const scrollToRef = (ref) => {
    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    if (pendingPatientId && !recordsUnlocked) {
      const timer = setTimeout(() => scrollToRef(accessPromptRef), 80);
      return () => clearTimeout(timer);
    }
  }, [pendingPatientId, recordsUnlocked]);

  useEffect(() => {
    if (recordsUnlocked && selectedId) {
      const timer = setTimeout(() => scrollToRef(detailPanelRef), 80);
      return () => clearTimeout(timer);
    }
  }, [recordsUnlocked, selectedId]);

  const handleViewRecords = (id) => {
    setError("");
    setMessage("");

    if (selectedId === id && recordsUnlocked) {
      scrollToRef(detailPanelRef);
      return;
    }

    setPendingPatientId(id);
    setSelectedId(null);
    setRecordsUnlocked(false);
    setReason("");
    setDetail(emptyDetail());
    setActiveTab("history");
    setHistoryFrom("");
    setHistoryTo("");
  };

  const cancelAccessRequest = () => {
    setPendingPatientId(null);
    setReason("");
    setError("");
    setMessage("");
  };

  const confirmAccess = async (event) => {
    event.preventDefault();
    if (!pendingPatientId) return;

    const accessReason = reason.trim();
    if (accessReason.length < 3) {
      setError("Enter an access reason (min. 3 characters).");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    const patientId = pendingPatientId;

    try {
      const data = await getDoctorPatientHistory(patientId, accessReason, {});
      setSelectedId(patientId);
      setRecordsUnlocked(true);
      setPendingPatientId(null);
      setDetail((d) => ({ ...d, history: data }));
      setActiveTab("history");
      setMessage("Access granted. Patient history loaded and recorded in the audit log.");
    } catch (err) {
      setError(err.message || "Unable to load patient records.");
      setRecordsUnlocked(false);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
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
        const data = await getDoctorPatientAllergies(selectedId, reason);
        setDetail((d) => ({ ...d, allergies: data }));
      } else if (tab === "insurance") {
        const data = await getDoctorPatientInsurance(selectedId, reason);
        setDetail((d) => ({ ...d, insurance: data }));
      } else if (tab === "contacts") {
        const data = await getDoctorPatientEmergencyContacts(selectedId, reason);
        setDetail((d) => ({ ...d, contacts: data }));
      } else if (tab === "appointments") {
        const data = await getDoctorPatientAppointments(selectedId, reason);
        setDetail((d) => ({ ...d, appointments: data }));
      } else if (tab === "history") {
        const dateError = validateHistoryDateRange(historyFrom, historyTo);
        if (dateError) {
          setError(dateError);
          setLoading(false);
          return;
        }
        const data = await getDoctorPatientHistory(selectedId, reason, {
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

  const visits = detail.history?.visits || [];
  const historyMaxDate = todayDateString();

  const handleHistoryFromChange = (value) => {
    let next = value;
    if (next > historyMaxDate) next = historyMaxDate;
    setHistoryFrom(next);
    if (historyTo && next && historyTo < next) {
      setHistoryTo(next);
    }
  };

  const handleHistoryToChange = (value) => {
    let next = value;
    if (next > historyMaxDate) next = historyMaxDate;
    if (historyFrom && next && next < historyFrom) {
      next = historyFrom;
    }
    setHistoryTo(next);
  };

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h1>
          My Patients
          <span className="nurse-readonly-badge">Read only</span>
        </h1>
        <p>
          Filter by full name or personal number, then click View records. You
          will be asked for an access reason before records are shown. All access
          is logged.
        </p>
      </div>

      {error && <div className="nurse-message error">{error}</div>}
      {message && <div className="nurse-message success">{message}</div>}

      <div className="nurse-patients-toolbar">
        <div className="doctor-staff-filter-row nurse-patients-filter-row">
          <label className="doctor-staff-search">
            Search by name
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Full name or personal number"
            />
          </label>
        </div>

        <div className="doctor-staff-role-counts" aria-live="polite">
          {hasActiveSearch ? (
            <span>
              Showing {filteredPatients.length} of {allPatients.length} patient
              {allPatients.length === 1 ? "" : "s"}
            </span>
          ) : (
            <span>
              {allPatients.length} patient{allPatients.length === 1 ? "" : "s"} in
              your care
            </span>
          )}
        </div>
      </div>

      {loading && !allPatients.length ? (
        <p className="nurse-loading">Loading patients...</p>
      ) : (
        <div className="nurse-table-wrap">
          <p className="nurse-table-caption">
            {hasActiveSearch
              ? `Matching patients (${filteredPatients.length})`
              : `All patients (${filteredPatients.length})`}
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
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    {hasActiveSearch
                      ? "No patients matched your search."
                      : "No patients found in your care."}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr
                    key={p.id}
                    className={
                      selectedId === p.id || pendingPatientId === p.id
                        ? "nurse-table-row--selected"
                        : ""
                    }
                  >
                    <td>{patientLabel(p)}</td>
                    <td>{p.username}</td>
                    <td>{patientPersonalNo(p) || "-"}</td>
                    <td>
                      <button
                        type="button"
                        className="nurse-btn"
                        onClick={() => handleViewRecords(p.id)}
                      >
                        {selectedId === p.id && recordsUnlocked
                          ? "Viewing records"
                          : "View records"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pendingPatient && !recordsUnlocked && (
        <section
          ref={accessPromptRef}
          className="nurse-access-prompt"
          aria-labelledby="doctor-access-prompt-title"
        >
          <h2 id="doctor-access-prompt-title">Reason for access</h2>
          <p className="nurse-access-prompt-lead">
            You are requesting read-only records for{" "}
            <strong>{patientLabel(pendingPatient)}</strong>
            {patientPersonalNo(pendingPatient)
              ? ` (${patientPersonalNo(pendingPatient)})`
              : ""}
            . Please state why you need access.
          </p>

          <form className="nurse-access-prompt-form" onSubmit={confirmAccess}>
            <label htmlFor="access-reason">Access reason</label>
            <textarea
              id="access-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. reviewing patient history before follow-up appointment"
              disabled={loading}
            />
            <div className="nurse-access-prompt-actions">
              <button type="submit" className="nurse-btn" disabled={loading}>
                {loading ? "Loading records..." : "Continue to records"}
              </button>
              <button
                type="button"
                className="nurse-btn nurse-btn--secondary"
                onClick={cancelAccessRequest}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {recordsUnlocked && selectedPatient && (
        <div ref={detailPanelRef} className="nurse-detail-panel">
          <h2>{patientLabel(selectedPatient)}</h2>
          <p className="nurse-detail-hint">
            Access reason: <em>{reason}</em>. Open a tab below to load more
            read-only data (each view is logged).
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
              <h3>Patient history (your visits)</h3>

              <div className="nurse-history-filters">
                <p className="nurse-detail-hint nurse-history-date-hint">
                  Filter dates cannot be later than today.
                </p>
                <label>
                  From
                  <input
                    type="date"
                    value={historyFrom}
                    max={historyMaxDate}
                    onChange={(e) => handleHistoryFromChange(e.target.value)}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={historyTo}
                    min={historyFrom || undefined}
                    max={historyMaxDate}
                    onChange={(e) => handleHistoryToChange(e.target.value)}
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
                <p>No visit history found for this doctor (with current filters).</p>
              ) : (
                <>
                  <p className="nurse-detail-hint">
                    {detail.history.total} visit(s) - newest first.
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
                          {visit.hospital_name || "Hospital"} -{" "}
                          {visit.department_name || "Department -"} -{" "}
                          {visit.doctor_name
                            ? `Dr. ${visit.doctor_name}`
                            : "Doctor -"}
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
                                  {p.dosage ? ` - ${p.dosage}` : ""}
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
                      {i.provider || "-"} - {i.policy_number || "-"} (
                      {i.coverage_percent ?? "-"}%)
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
                  {detail.contacts.map((c) => {
                    const name =
                      `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
                      c.contact_name ||
                      "-";
                    return (
                      <li key={c.id}>
                        {name} ({c.relationship || "-"}) - {c.phone_number || "-"}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="nurse-detail-section">
              <h3>Appointments (your visits)</h3>
              {!detail.appointments ? (
                <p>Click the Appointments tab to load data.</p>
              ) : detail.appointments.length === 0 ? (
                <p>No appointments on record.</p>
              ) : (
                <>
                  <p className="nurse-detail-hint">
                    {detail.appointments.length} appointment
                    {detail.appointments.length === 1 ? "" : "s"} - newest
                    first.
                  </p>
                  <div className="nurse-appointments-list">
                    {detail.appointments.map((appointment) => (
                      <article
                        key={appointment.id}
                        className={`nurse-appointment-card ${
                          appointment.active
                            ? ""
                            : "nurse-appointment-card--inactive"
                        }`}
                      >
                        <div className="nurse-appointment-card-head">
                          <span className="nurse-appointment-date">
                            {formatVisitDate(appointment.appointment_date)}
                          </span>
                          {formatTimeRange(
                            appointment.start_time,
                            appointment.end_time,
                          ) && (
                            <span className="nurse-appointment-time">
                              {formatTimeRange(
                                appointment.start_time,
                                appointment.end_time,
                              )}
                            </span>
                          )}
                          <span
                            className={`nurse-timeline-badge ${
                              appointment.active
                                ? ""
                                : "nurse-timeline-badge--inactive"
                            }`}
                          >
                            {appointment.active ? "Active" : "Cancelled"}
                          </span>
                        </div>
                        <p className="nurse-appointment-meta">
                          {appointment.hospital_name || "Hospital"} -{" "}
                          {appointment.department_name || "Department -"} -{" "}
                          {appointment.doctor_name
                            ? `Dr. ${appointment.doctor_name}`
                            : "Doctor -"}
                        </p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
