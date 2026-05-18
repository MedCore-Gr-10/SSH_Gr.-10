import React, { useEffect, useState } from "react";
import {
  getDirectorAppointments,
  getDirectorAppointmentSlots,
  updateDirectorAppointment,
  cancelDirectorAppointment,
} from "../../services/directorAppointmentsApi";
import "./DirectorAppointments.css";

const formatTime = (value) => {
  if (!value) return "";
  return value.length === 8 ? value.slice(0, 5) : value;
};

const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getName = (user) => {
  if (!user) return "Unknown";
  const profile = user.users_profiles?.[0] || {};
  return `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || user.username || "Unknown";
};

export default function DirectorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [appointmentData, slotData] = await Promise.all([
        getDirectorAppointments(),
        getDirectorAppointmentSlots(),
      ]);
      setAppointments(appointmentData);
      setSlots(slotData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedSlotId(appointment.appointment_booking_slot_id || "");
    setMessage(null);
    setError(null);
  };

  const handleReschedule = async (event) => {
    event.preventDefault();
    if (!selectedAppointment) {
      setError("Select an appointment to reschedule.");
      return;
    }
    if (!selectedSlotId) {
      setError("Choose a new appointment slot.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await updateDirectorAppointment(selectedAppointment.id, {
        appointment_booking_slot_id: selectedSlotId,
      });
      setMessage("Appointment rescheduled successfully.");
      setSelectedAppointment(null);
      setSelectedSlotId("");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) {
      setError("Select an appointment to cancel.");
      return;
    }

    if (!window.confirm("Cancel this appointment?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await cancelDirectorAppointment(selectedAppointment.id);
      setMessage("Appointment canceled successfully.");
      setSelectedAppointment(null);
      setSelectedSlotId("");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSlotLabel = (slot) => {
    const doctor = getName(slot.users);
    const template = slot.appointments_templates;
    const time = template ? `${formatTime(template.start_time)} - ${formatTime(template.end_time)}` : "";
    return `${doctor} • ${formatDate(slot.appointment_date)} ${time}`;
  };

  return (
    <div className="director-appointments-page">
      <div className="director-appointments-header">
        <div>
          <h1>Director Appointments</h1>
          <p>Manage and review all appointments in your hospital.</p>
        </div>
      </div>

      <section className="director-appointments-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <h3>Booked Appointments</h3>
            <p>{appointments.filter((item) => item.active_appointment_made !== false).length}</p>
          </div>
          <div className="overview-card">
            <h3>Appointment Slots</h3>
            <p>{slots.length}</p>
          </div>
          <div className="overview-card">
            <h3>Pending Changes</h3>
            <p>{selectedAppointment ? 1 : 0}</p>
          </div>
        </div>
      </section>

      <div className="director-appointments-grid">
        <section className="director-appointments-section content-scroll">
          <h2>Booked Appointments</h2>
          <table className="director-appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5">No booked appointments found.</td>
                </tr>
              ) : (
                appointments.map((appointment) => {
                  const patientName = getName(appointment.users);
                  const slot = appointment.appointments_booking_slots;
                  const doctorName = getName(slot?.users);
                  const slotLabel = slot ? renderSlotLabel(slot) : "No slot assigned";

                  return (
                    <tr key={appointment.id}>
                      <td data-label="Patient">{patientName}</td>
                      <td data-label="Doctor">{doctorName}</td>
                      <td data-label="Slot">{slotLabel}</td>
                      <td data-label="Status">{appointment.active_appointment_made === false ? "Canceled" : "Confirmed"}</td>
                      <td data-label="Actions">
                        <button className="edit-button" onClick={() => handleSelectAppointment(appointment)}>
                          Edit
                        </button>
                        <button className="cancel-button" onClick={() => { setSelectedAppointment(appointment); handleCancel(); }}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </section>

        <section className="director-appointments-section content-scroll">
          <h2>{selectedAppointment ? "Reschedule appointment" : "Select an appointment"}</h2>
          {selectedAppointment ? (
            <form className="director-appointments-form" onSubmit={handleReschedule}>
              <label>
                Current patient
                <input readOnly value={getName(selectedAppointment.users)} />
              </label>

              <label>
                Current doctor
                <input readOnly value={getName(selectedAppointment.appointments_booking_slots?.users)} />
              </label>

              <label>
                Choose new slot
                <select value={selectedSlotId} onChange={(e) => setSelectedSlotId(e.target.value)}>
                  <option value="">Select an available slot</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {renderSlotLabel(slot)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="director-appointments-actions">
                <button className="primary" type="submit" disabled={isSubmitting}>
                  Save changes
                </button>
                <button className="secondary" type="button" onClick={() => setSelectedAppointment(null)}>
                  Clear selection
                </button>
              </div>
            </form>
          ) : (
            <p>Select an appointment from the left table to reschedule or cancel it.</p>
          )}

          {message && <div className="director-message success">{message}</div>}
          {error && <div className="director-message error">{error}</div>}
        </section>
      </div>
    </div>
  );
}
