import React, { useState } from "react";
import "./Records.css";

const placeholderRecords = [
  {
    id: "record-1",
    hospitalName: "City Care Hospital",
    doctorName: "Dr. John Smith",
    nurseName: "Nurse Ava Martinez",
    date: "2026-02-20",
    timeSlot: "08:00-08:30",
    prescription: "Ibuprofen 200mg",
    allergies: "Peanuts",
    description: "I have a rash on my back that it itches.",
    notes: "Recommended topical ointment and follow-up in two weeks.",
  },
  {
    id: "record-2",
    hospitalName: "City Care Hospital",
    doctorName: "Dr. Emily Turner",
    nurseName: "Nurse Julian Kim",
    date: "2026-02-22",
    timeSlot: "09:00-09:30",
    prescription: "Vitamin D supplements",
    allergies: "None",
    description: "I just came for a yearly physical.",
    notes: "General wellness check completed; labs ordered for routine blood work.",
  },
  {
    id: "record-3",
    hospitalName: "Green Valley Clinic",
    doctorName: "Dr. Noah Brown",
    nurseName: "Nurse Sofia Patel",
    date: "2026-03-01",
    timeSlot: "10:00-10:30",
    prescription: "Cetirizine 10mg",
    allergies: "Pollen, dust mites",
    description: "My allergies are acting up and I have sneezing and watery eyes.",
    notes: "Adjusted allergy medication and recommended follow-up during peak season.",
  },
  {
    id: "record-4",
    hospitalName: "Green Valley Clinic",
    doctorName: "Dr. Mia Johnson",
    nurseName: "Nurse Ethan Lee",
    date: "2026-02-28",
    timeSlot: "14:00-14:30",
    prescription: "Amoxicillin 500mg",
    allergies: "Penicillin",
    description: "I have a sore throat and feel feverish.",
    notes: "Noted penicillin allergy, used alternative antibiotic and advised hydration.",
  },
  {
    id: "record-5",
    hospitalName: "Lakeside Medical Center",
    doctorName: "Dr. Sarah Patel",
    nurseName: "Nurse Noah Davis",
    date: "2026-03-05",
    timeSlot: "16:00-16:30",
    prescription: "Albuterol inhaler",
    allergies: "Tree pollen",
    description: "Wheezing at night and difficulty breathing outdoors.",
    notes: "Prescribed inhaler for asthma symptoms and scheduled breathing test.",
  },
];

const formatDateDisplay = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

export default function Records() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeRecord, setActiveRecord] = useState(null);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredRecords = placeholderRecords.filter((record) => {
    const matchesDate = selectedDate ? record.date === selectedDate : true;
    const matchesSearch = normalizedSearch
      ? [
          record.doctorName,
          record.prescription,
          record.timeSlot,
          record.allergies,
          record.nurseName,
          record.hospitalName,
          record.description,
        ].some((field) => field.toLowerCase().includes(normalizedSearch))
      : true;

    return matchesDate && matchesSearch;
  });

  return (
    <div className="records-container">
      <div className="records-card">
        <h1 className="records-title">Patient Records</h1>
        <p className="records-description">
          Filter your medical history by date or search across doctor name, prescription, allergies, nurse, hospital, time slot, and visit description.
        </p>

        <div className="records-filters">
          <div className="filter-group">
            <label htmlFor="record-search" className="form-label">
              Search records
            </label>
            <input
              id="record-search"
              type="text"
              className="form-input"
              placeholder="Search by doctor, prescription, allergies, nurse, hospital, time, description"
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length ? (
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
                    <td className="row-arrow">→</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-results">
                    No records match your search and date filter.
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
              <div className="modal-row">
                <div>
                  <h3>Date</h3>
                  <p>{formatDateDisplay(activeRecord.date)}</p>
                </div>
                <div>
                  <h3>Time slot</h3>
                  <p>{activeRecord.timeSlot}</p>
                </div>
              </div>

              <div className="modal-row">
                <div>
                  <h3>Nurse</h3>
                  <p>{activeRecord.nurseName}</p>
                </div>
                <div>
                  <h3>Prescription</h3>
                  <p>{activeRecord.prescription}</p>
                </div>
              </div>

              <div className="modal-row">
                <div>
                  <h3>Allergies</h3>
                  <p>{activeRecord.allergies}</p>
                </div>
                <div>
                  <h3>Description</h3>
                  <p>{activeRecord.description}</p>
                </div>
              </div>

              <div className="modal-note">
                <h3>Visit notes</h3>
                <p>{activeRecord.notes}</p>
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
