import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getPatientRecords } from "../../../services/patientRecordsApi";
import "../../CSSpages/patient/Records.css";

const formatDateDisplay = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

const listText = (items, selector) => {
  const values = items.map(selector).filter(Boolean);
  return values.length ? values.join(", ") : "-";
};

const firstMedication = (record) =>
  record.prescriptions?.[0]?.medicationName || "No medication recorded";

const searchableText = (record) =>
  [
    record.doctorName,
    record.hospitalName,
    record.specialization,
    record.date,
    record.timeSlot,
    ...(record.prescriptions || []).flatMap((prescription) => [
      prescription.medicationName,
      prescription.dosage,
      prescription.instructions,
    ]),
    ...(record.diagnoses || []).map((diagnosis) => diagnosis.diagnosis),
    ...(record.allergies || []).flatMap((allergy) => [
      allergy.name,
      allergy.type,
      allergy.reaction,
      allergy.severity,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export default function Records() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeRecord, setActiveRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const allergySliderRef = useRef(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        const data = await getPatientRecords();
        setRecords(data || []);
        setError("");
      } catch (err) {
        setError("Failed to load records: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const matchesDate = selectedDate ? record.date === selectedDate : true;
      const matchesSearch = normalizedSearch
        ? searchableText(record).includes(normalizedSearch)
        : true;

      return matchesDate && matchesSearch;
    });
  }, [records, searchTerm, selectedDate]);

  const scrollAllergies = (direction) => {
    const slider = allergySliderRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction * 260,
      behavior: "smooth",
    });
  };

  return (
    <div className="records-container">
      <div className="records-card">
        <h1 className="records-title">Patient Records</h1>
        <p className="records-description">
          Review completed appointments, prescriptions, diagnoses, and allergy context from your care history.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="records-filters">
          <div className="filter-group">
            <label htmlFor="record-search" className="form-label">
              Search records
            </label>
            <input
              id="record-search"
              type="text"
              className="form-input"
              placeholder="Search by doctor, medication, diagnosis, allergy, hospital, or time"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="record-date" className="form-label">
              Filter by date
            </label>
            <input
              id="record-date"
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="records-table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th>Hospital name</th>
                <th>Doctor name</th>
                <th>Date</th>
                <th>Time slot</th>
                <th>Medication</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="no-results">
                    Loading records...
                  </td>
                </tr>
              )}

              {!loading && filteredRecords.length ? (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="records-row"
                    onClick={() => setActiveRecord(record)}
                    tabIndex={0}
                    onKeyDown={(event) => event.key === "Enter" && setActiveRecord(record)}
                  >
                    <td>{record.hospitalName}</td>
                    <td>{record.doctorName}</td>
                    <td>{formatDateDisplay(record.date)}</td>
                    <td>{record.timeSlot}</td>
                    <td>{firstMedication(record)}</td>
                    <td className="row-arrow">-&gt;</td>
                  </tr>
                ))
              ) : null}

              {!loading && !filteredRecords.length && (
                <tr>
                  <td colSpan={6} className="no-results">
                    No completed appointment records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeRecord && (
        <div className="modal-backdrop" onClick={() => setActiveRecord(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{activeRecord.doctorName}</h2>
                <p className="modal-subtitle">{activeRecord.hospitalName}</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setActiveRecord(null)}>
                &times;
              </button>
            </div>

            <div className="modal-details">
              <div className="records-summary-row">
                <div>
                  <h3>Date</h3>
                  <p>{formatDateDisplay(activeRecord.date)}</p>
                </div>
                <div>
                  <h3>Time slot</h3>
                  <p>{activeRecord.timeSlot}</p>
                </div>
                <div>
                  <h3>Specialization</h3>
                  <p>{activeRecord.specialization || "General Medicine"}</p>
                </div>
              </div>

              <div className="modal-row modal-row-record-context">
                <div className="records-info-panel">
                  <h3>Diagnosis</h3>
                  <p>{listText(activeRecord.diagnoses || [], (diagnosis) => diagnosis.diagnosis)}</p>
                </div>
                <div className="records-info-panel records-allergy-panel">
                  <div className="records-allergy-heading">
                    <h3>Allergies</h3>
                    {activeRecord.allergies?.length > 1 && (
                      <div className="records-allergy-controls">
                        <button
                          type="button"
                          onClick={() => scrollAllergies(-1)}
                          aria-label="Show previous allergies"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollAllergies(1)}
                          aria-label="Show next allergies"
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    )}
                  </div>
                  {activeRecord.allergies?.length ? (
                    <div
                      className="records-allergy-slider"
                      aria-label="Patient allergies"
                      ref={allergySliderRef}
                    >
                      {activeRecord.allergies.map((allergy) => (
                        <article key={allergy.id} className="records-allergy-card">
                          <div>
                            <strong>{allergy.name}</strong>
                            <span>{allergy.type || "Allergy"}</span>
                          </div>
                          <p>{allergy.reaction || "No reaction recorded"}</p>
                          <small>{allergy.severity || "Severity not recorded"}</small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p>No allergies recorded.</p>
                  )}
                </div>
              </div>

              <div className="modal-note">
                <h3>Prescriptions</h3>
                {activeRecord.prescriptions?.length ? (
                  <div className="records-detail-list">
                    {activeRecord.prescriptions.map((prescription) => (
                      <div key={prescription.id} className="records-detail-item">
                        <strong>{prescription.medicationName}</strong>
                        <div className="records-prescription-meta">
                          <span>Dosage</span>
                          <p>{prescription.dosage || "No dosage recorded"}</p>
                        </div>
                        <div className="records-prescription-meta">
                          <span>Instructions</span>
                          <p>{prescription.instructions || "No instructions recorded"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No prescriptions recorded for this visit.</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-secondary" onClick={() => setActiveRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
