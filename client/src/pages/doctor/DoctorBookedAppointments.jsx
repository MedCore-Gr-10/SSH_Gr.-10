import React, { useEffect, useMemo, useState } from "react";
import {
  getDoctorSlots,
  saveDoctorAppointmentRecord,
} from "../../services/doctorAppointmentsApi.js";
import "../routes/BookedAppointments.css";

const formatDate = (value) => {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "";

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const [h, m] = value.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
};


const getPatientProfileLink = (appointment) =>
  appointment?.users?.users_profiles?.[0] || null;

const getPatientProfile = (appointment) =>
  getPatientProfileLink(appointment)?.profiles || null;

const getPatientName = (appointment) => {
  const profile = getPatientProfile(appointment);
  const patient = appointment?.users;

  const fullName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();

  return fullName || patient?.username || "Unknown patient";
};

const getPatientEmail = (appointment) =>
  getPatientProfileLink(appointment)?.email || "No email recorded";

const emptyRecordForm = () => ({
  description: "",
  medicationName: "",
  dosage: "",
  prescription: "",
});

export default function DoctorBookedAppointments() {
  const [slots, setSlots] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [recordAppointment, setRecordAppointment] = useState(null);
  const [recordForm, setRecordForm] = useState(emptyRecordForm());
  const [loading, setLoading] = useState(true);
  const [savingRecordId, setSavingRecordId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage("");

      try {
        const data = await getDoctorSlots();
        setSlots(data || []);
      } catch (err) {
        setError(err.message || "Unable to load booked appointments.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openRecordModal = (appointment, event) => {
    event.stopPropagation();
    setRecordAppointment(appointment);
    setRecordForm(emptyRecordForm());
    setError(null);
    setSuccessMessage("");
  };

  const closeRecordModal = () => {
    setRecordAppointment(null);
    setRecordForm(emptyRecordForm());
  };

  const updateRecordForm = (field, value) => {
    setRecordForm((current) => ({ ...current, [field]: value }));
  };

  const markAppointmentCompleteLocally = (appointmentId) => {
    setSlots((currentSlots) =>
      currentSlots.map((slot) => ({
        ...slot,
        appointments_made: (slot.appointments_made || []).map((booking) =>
          booking.id === appointmentId
            ? { ...booking, appointment_is_complete: true }
            : booking
        ),
      }))
    );
    setSelectedAppointment((current) =>
      current?.id === appointmentId
        ? { ...current, appointment_is_complete: true }
        : current
    );
  };

  const handleSaveRecord = async (event) => {
    event.preventDefault();
    if (!recordAppointment) return;

    try {
      setSavingRecordId(recordAppointment.id);
      setError(null);
      setSuccessMessage("");
      await saveDoctorAppointmentRecord(recordAppointment.id, recordForm);
      markAppointmentCompleteLocally(recordAppointment.id);
      closeRecordModal();
      setSuccessMessage("Appointment record has been saved and marked complete.");
    } catch (err) {
      setError(err.message || "Unable to save appointment record.");
    } finally {
      setSavingRecordId(null);
    }
  };

  const bookedAppointments = useMemo(() => {
    return slots
      .flatMap((slot) =>
        (slot.appointments_made || [])
          .filter((a) => a.appointment_is_complete !== true)
          .map((a) => ({ ...a, slot }))
      )
      .sort((a, b) => {
        const dateA = new Date(a.slot?.appointment_date || 0).getTime();
        const dateB = new Date(b.slot?.appointment_date || 0).getTime();
        if (dateA !== dateB) return dateA - dateB;

        return String(a.slot?.slot_start_time || "").localeCompare(
          String(b.slot?.slot_start_time || "")
        );
      });
  }, [slots]);

  const selectedProfile = getPatientProfile(selectedAppointment);
  const selectedAllergies = selectedProfile?.allergies || [];
  const selectedInsurance = selectedProfile?.insurance || [];

  return (
    <div className="doctor-booked-page">
      <div className="doctor-booked-header">
        <div>
          <h1>Booked Appointments</h1>
          <p>Confirmed patient bookings for your slots.</p>
        </div>

        <div className="doctor-booked-count">
          <span>{bookedAppointments.length}</span>
          <small>Booked</small>
        </div>
      </div>

      <section className="doctor-booked-card">
        {successMessage && (
          <p className="doctor-booked-message success">{successMessage}</p>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="doctor-booked-message error">{error}</p>
        ) : bookedAppointments.length === 0 ? (
          <p>No booked appointments found.</p>
        ) : (
          <table className="doctor-booked-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Email</th>
                <th>Status</th>
                <th>Details</th>
                <th>Record</th>
              </tr>
            </thead>

            <tbody>
              {bookedAppointments.map((appointment) => {
                const slot = appointment.slot;

                return (
                  <tr
                    key={appointment.id}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <td data-label="Patient">{getPatientName(appointment)}</td>
                    <td data-label="Date">{formatDate(slot?.appointment_date)}</td>
                    <td data-label="Time">
                      {formatTime(slot?.slot_start_time)} -{" "}
                      {formatTime(slot?.slot_end_time)}
                    </td>
                    <td data-label="Email">{getPatientEmail(appointment)}</td>
                    <td data-label="Status">
                      <span
                        className={`doctor-booked-status ${
                          appointment.appointment_is_complete ? "complete" : ""
                        }`}
                      >
                        {appointment.appointment_is_complete ? "Completed" : "Booked"}
                      </span>
                    </td>
                    <td data-label="Details">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedAppointment(appointment);
                        }}
                      >
                        View
                      </button>
                    </td>
                    <td data-label="Record">
                      <button
                        type="button"
                        className="doctor-booked-record-button"
                        onClick={(event) => openRecordModal(appointment, event)}
                        disabled={
                          appointment.appointment_is_complete ||
                          savingRecordId === appointment.id
                        }
                      >
                        {savingRecordId === appointment.id ? "Saving..." : "Add record"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      { }
      {selectedAppointment && (
        <div
          className="doctor-booked-modal-backdrop"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="doctor-booked-modal doctor-booked-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doctor-booked-modal-header">
              <div>
                <h2>{getPatientName(selectedAppointment)}</h2>
                <p>{getPatientEmail(selectedAppointment)}</p>
              </div>
              <button type="button" onClick={() => setSelectedAppointment(null)}>
                X
              </button>
            </div>

            <div className="doctor-booked-detail-grid">
              <div>
                <span>Date</span>
                <strong>{formatDate(selectedAppointment.slot?.appointment_date)}</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>
                  {formatTime(selectedAppointment.slot?.slot_start_time)} -{" "}
                  {formatTime(selectedAppointment.slot?.slot_end_time)}
                </strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{selectedProfile?.phone_number || "Not recorded"}</strong>
              </div>
              <div>
                <span>Gender</span>
                <strong>{selectedProfile?.gender || "Not recorded"}</strong>
              </div>
              <div>
                <span>Birth</span>
                <strong>
                  {selectedProfile?.birth
                    ? formatDate(selectedProfile.birth)
                    : "Not recorded"}
                </strong>
              </div>
              <div>
                <span>Status</span>
                <strong>
                  {selectedAppointment.appointment_is_complete
                    ? "Completed"
                    : "Booked"}
                </strong>
              </div>
            </div>

            <section className="doctor-booked-detail-section">
              <h3>Allergies</h3>
              {selectedAllergies.length === 0 ? (
                <p>No allergies recorded.</p>
              ) : (
                <ul>
                  {selectedAllergies.map((allergy) => (
                    <li key={allergy.id}>
                      <span>{allergy.allergy_type || "Allergy"}</span>
                      <strong>{allergy.allergy_name}</strong>
                      <p>
                        {allergy.reaction_symptoms || "No reaction recorded"} -{" "}
                        {allergy.severity || "Severity not recorded"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="doctor-booked-detail-section">
              <h3>Insurance</h3>
              {selectedInsurance.length === 0 ? (
                <p>No insurance recorded.</p>
              ) : (
                <ul>
                  {selectedInsurance.map((insurance) => (
                    <li key={insurance.id}>
                      <span>Provider</span>
                      <strong>{insurance.provider || "Unknown provider"}</strong>
                      <p>
                        Policy {insurance.policy_number || "not recorded"}
                        {insurance.coverage_percent
                          ? ` - ${insurance.coverage_percent}% coverage`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="doctor-booked-detail-actions">
              <button
                type="button"
                className="doctor-booked-secondary-button"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {recordAppointment && (
        <div className="doctor-booked-modal-backdrop" onClick={closeRecordModal}>
          <div
            className="doctor-booked-modal doctor-booked-record-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="doctor-booked-modal-header">
              <div>
                <h2>Add appointment record</h2>
                <p>{getPatientName(recordAppointment)}</p>
              </div>
              <button type="button" onClick={closeRecordModal}>
                X
              </button>
            </div>

            <form className="doctor-booked-record-form" onSubmit={handleSaveRecord}>
              <label>
                Description
                <textarea
                  rows={5}
                  value={recordForm.description}
                  onChange={(event) => updateRecordForm("description", event.target.value)}
                  placeholder="Describe the visit, diagnosis, or clinical notes"
                  required
                />
              </label>

              <div className="doctor-booked-record-grid">
                <label>
                  Medication name
                  <input
                    type="text"
                    value={recordForm.medicationName}
                    onChange={(event) =>
                      updateRecordForm("medicationName", event.target.value)
                    }
                    placeholder="Medication"
                  />
                </label>

                <label>
                  Dosage
                  <input
                    type="text"
                    value={recordForm.dosage}
                    onChange={(event) => updateRecordForm("dosage", event.target.value)}
                    placeholder="e.g. 500mg twice daily"
                  />
                </label>
              </div>

              <label>
                Prescription instructions
                <textarea
                  rows={4}
                  value={recordForm.prescription}
                  onChange={(event) => updateRecordForm("prescription", event.target.value)}
                  placeholder="Instructions for the patient"
                />
              </label>

              <div className="doctor-booked-record-actions">
                <button
                  type="button"
                  className="doctor-booked-secondary-button"
                  onClick={closeRecordModal}
                  disabled={savingRecordId === recordAppointment.id}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="doctor-booked-save-record-button"
                  disabled={savingRecordId === recordAppointment.id}
                >
                  {savingRecordId === recordAppointment.id
                    ? "Saving..."
                    : "Save and complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
