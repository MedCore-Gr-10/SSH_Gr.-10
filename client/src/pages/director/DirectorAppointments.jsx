import React, { useEffect, useState } from "react";
import {
  getDirectorAppointments,
  getDirectorAppointmentSlots,
  updateDirectorAppointment,
  cancelDirectorAppointment,
} from "../../services/directorAppointmentsApi";
import { getDirectorStaff } from "../../services/directorStaffApi";
import { getTemplates, createTemplate, deleteTemplate } from "../../services/directorTemplatesApi";
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
  const [staff, setStaff] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateForm, setTemplateForm] = useState({ staff_id: "", department_id: "", day_of_week: "Monday", start_time: "09:00", end_time: "17:00" });

  const loadData = async () => {
    try {
      const [appointmentData, slotData] = await Promise.all([
        getDirectorAppointments(),
        getDirectorAppointmentSlots(),
      ]);
      setAppointments(appointmentData);
      setSlots(slotData);
      // load staff and templates
      const [staffData, templatesData] = await Promise.all([getDirectorStaff(), getTemplates()]);
      setStaff(staffData);
      setTemplates(templatesData);
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

  const canSave = !!selectedAppointment && !!selectedSlotId && selectedSlotId !== String(selectedAppointment.appointment_booking_slot_id);

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

  const handleTemplateChange = (field, value) => {
    setTemplateForm((s) => ({ ...s, [field]: value }));
    if (field === "staff_id") {
      const selected = staff.find((x) => x.id === value);
      const link = selected?.staff_hospitals_departments?.[0];
      if (link) setTemplateForm((s) => ({ ...s, department_id: link.department_id }));
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createTemplate(templateForm);
      const newList = await getTemplates();
      setTemplates(newList);
      setMessage("Template created");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await deleteTemplate(id);
      setTemplates((t) => t.filter((x) => x.id !== id));
      setMessage("Template deleted");
    } catch (err) {
      setError(err.message);
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
          <h2>Appointment Templates</h2>
          <form className="director-appointments-form" onSubmit={handleCreateTemplate}>
            <label>
              Staff (doctor/nurse)
              <select value={templateForm.staff_id} onChange={(e) => handleTemplateChange("staff_id", e.target.value)}>
                <option value="">Select staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{`${s.users_profiles?.[0]?.profiles?.first_name || s.username} ${s.users_profiles?.[0]?.profiles?.last_name || ""}`.trim()}</option>
                ))}
              </select>
            </label>

            <label>
              Day of week
              <select value={templateForm.day_of_week} onChange={(e) => handleTemplateChange("day_of_week", e.target.value)}>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </label>

            <label>
              Start time
              <input type="time" value={templateForm.start_time} onChange={(e) => handleTemplateChange("start_time", e.target.value)} />
            </label>

            <label>
              End time
              <input type="time" value={templateForm.end_time} onChange={(e) => handleTemplateChange("end_time", e.target.value)} />
            </label>

            <div className="director-appointments-actions">
              <button className="primary" type="submit" disabled={isSubmitting}>Create template</button>
            </div>
          </form>

          <h3>Existing templates</h3>
          <table className="director-appointments-table">
            <thead>
              <tr><th>Staff</th><th>Day</th><th>Time</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr><td colSpan="4">No templates</td></tr>
              ) : templates.map((t) => {
                const staffName = t.staff_hospitals_departments?.users?.users_profiles?.[0]?.profiles ? `${t.staff_hospitals_departments.users.users_profiles[0].profiles.first_name} ${t.staff_hospitals_departments.users.users_profiles[0].profiles.last_name}` : (t.staff_id||'Unknown');
                return (
                  <tr key={t.id}>
                    <td>{staffName}</td>
                    <td>{t.day_of_week}</td>
                    <td>{`${t.start_time} - ${t.end_time}`}</td>
                    <td><button className="danger" onClick={() => handleDeleteTemplate(t.id)}>Delete</button></td>
                  </tr>
                );
              })}
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
