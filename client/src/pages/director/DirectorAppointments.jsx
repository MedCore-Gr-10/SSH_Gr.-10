import React, { useEffect, useRef, useState } from "react";
import {
  getDirectorAppointments,
  getDirectorAppointmentSlots,
  updateDirectorAppointment,
  cancelDirectorAppointment,
} from "../../services/directorAppointmentsApi";
import "./DirectorAppointments.css";

const formatTime = (value) => {
  if (!value) return "";
  if (value.includes?.("T")) {
    return new Date(value).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
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

const getDatePart = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.split("T")[0];
  return new Date(value).toISOString().split("T")[0];
};

const getTimePart = (value) => {
  if (!value) return "00:00:00";
  if (typeof value === "string" && value.includes("T")) {
    return new Date(value).toISOString().slice(11, 19);
  }
  return String(value).slice(0, 8);
};

const getSlotDateTime = (slot, boundary = "end") => {
  if (!slot?.appointment_date) return null;

  const template = slot.appointments_templates;
  const timeValue = boundary === "start"
    ? slot.slot_start_time || template?.start_time
    : slot.slot_end_time || template?.end_time || slot.slot_start_time || template?.start_time;
  const datePart = getDatePart(slot.appointment_date);
  const timePart = getTimePart(timeValue);
  const dateTime = new Date(`${datePart}T${timePart}`);

  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
};

const isSlotPast = (slot) => {
  const slotEnd = getSlotDateTime(slot, "end");
  return slotEnd ? slotEnd <= new Date() : false;
};

export default function DirectorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);
  const loadData = async () => {
    try {
      const [appointmentData, slotData] = await Promise.all([
        getDirectorAppointments(),
        getDirectorAppointmentSlots(),
      ]);
      setAppointments(
        appointmentData.filter(
          (appointment) =>
            appointment.appointment_is_complete !== true &&
            !isSlotPast(appointment.appointments_booking_slots)
        )
      );
      setSlots(slotData.filter((slot) => !isSlotPast(slot)));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectAppointment = (appointment) => {
    if (appointment.appointment_is_complete === true) {
      setSelectedAppointment(null);
      setSelectedSlotId("");
      setMessage(null);
      setError("Completed appointments cannot be edited.");
      return;
    }
    if (isSlotPast(appointment.appointments_booking_slots)) {
      setSelectedAppointment(null);
      setSelectedSlotId("");
      setMessage(null);
      setError("Past appointments cannot be edited.");
      return;
    }

    setSelectedAppointment(appointment);
    setSelectedSlotId(appointment.appointment_booking_slot_id || "");
    setMessage(null);
    setError(null);
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
      if (selectedSlotId === String(selectedAppointment.appointment_booking_slot_id)) {
        setError("Selected slot is the same as the current slot.");
        setIsSubmitting(false);
        return;
      }

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

  const handleCancel = async (appointment = selectedAppointment) => {
    if (!appointment) {
      setError("Select an appointment to cancel.");
      return;
    }
    if (appointment.appointment_is_complete === true) {
      setError("Completed appointments cannot be canceled.");
      return;
    }
    if (isSlotPast(appointment.appointments_booking_slots)) {
      setError("Past appointments cannot be canceled.");
      return;
    }

    if (!window.confirm("Cancel this appointment?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await cancelDirectorAppointment(appointment.id);
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
    const startTime = slot.slot_start_time || template?.start_time;
    const endTime = slot.slot_end_time || template?.end_time;
    const time = startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : "";
    return `${doctor} • ${formatDate(slot.appointment_date)} ${time}`;
  };

  const getSlotStatus = (slot) => {
    if (isSlotPast(slot)) return "Expired";

    const isCompleted = slot.appointments_made?.some(
      (appointment) => appointment.appointment_is_complete === true
    );
    const isBooked = slot.appointments_made?.some(
      (appointment) => appointment.appointment_is_complete !== true
    );

    if (isCompleted) return "Completed";
    return isBooked ? "Booked" : "Available";
  };

  const getSelectableSlots = () => {
    if (!selectedAppointment) return [];

    const currentSlotId = String(selectedAppointment.appointment_booking_slot_id);

    return slots.filter((slot) => {
      const slotId = String(slot.id);
      return slotId === currentSlotId || (!isSlotPast(slot) && getSlotStatus(slot) === "Available");
    });
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
            <h3>Current Appointments</h3>
            <p>{appointments.length}</p>
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
          <h2>Current Appointments</h2>
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
                  <td colSpan="5">No current appointments found.</td>
                </tr>
              ) : (
                appointments.map((appointment) => {
                  const patientName = getName(appointment.users);
                  const slot = appointment.appointments_booking_slots;
                  const doctorName = getName(slot?.users);
                  const slotLabel = slot ? renderSlotLabel(slot) : "No slot assigned";
                  const isCompleted = appointment.appointment_is_complete === true;
                  const isPast = isSlotPast(slot);
                  const isLocked = isCompleted || isPast;

                  return (
                    <tr key={appointment.id}>
                      <td data-label="Patient">{patientName}</td>
                      <td data-label="Doctor">{doctorName}</td>
                      <td data-label="Slot">{slotLabel}</td>
                      <td data-label="Status">
                        {isCompleted ? "Completed" : isPast ? "Past" : "Confirmed"}
                      </td>
                      <td data-label="Actions">
                        {isLocked ? (
                          <span className="status-inactive">Locked</span>
                        ) : (
                          <>
                            <button className="edit-button" onClick={() => handleSelectAppointment(appointment)}>
                              Edit
                            </button>
                            <button className="cancel-button" onClick={() => handleCancel(appointment)}>
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </section>

        <section className="director-appointments-section content-scroll">
          <div className="section-heading-row">
            <h2>Appointment Slots</h2>
            <span>{slots.length}</span>
          </div>
          {slots.length === 0 ? (
            <p className="empty-state">No appointment slots found.</p>
          ) : (
            <div className="slots-list">
              {slots.map((slot) => (
                <div className="slot-row" key={slot.id}>
                  <div>
                    <strong>{getName(slot.users)}</strong>
                    <span>{formatDate(slot.appointment_date)}</span>
                    <span>
                      {formatTime(slot.slot_start_time || slot.appointments_templates?.start_time)}
                      {" - "}
                      {formatTime(slot.slot_end_time || slot.appointments_templates?.end_time)}
                    </span>
                  </div>
                  <span className={getSlotStatus(slot) === "Available" ? "slot-available" : "slot-booked"}>
                    {getSlotStatus(slot)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="director-appointments-section content-scroll" ref={editorRef}>
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
                  {getSelectableSlots().map((slot) => (
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
            <p>Select a current appointment from the left table to reschedule or cancel it.</p>
          )}

          {message && <div className="director-message success">{message}</div>}
          {error && <div className="director-message error">{error}</div>}
        </section>
      </div>
    </div>
  );
}
