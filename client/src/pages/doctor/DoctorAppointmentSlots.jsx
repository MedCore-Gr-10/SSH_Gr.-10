import { useEffect, useState } from "react";
import {
  getDoctorAssignments,
  getDoctorTemplates,
  createDoctorTemplate,
  deleteDoctorTemplate,
  getDoctorSlots,
  getDoctorAvailableSlots,
  getDoctorSlotGenerationStatus,
  generateDoctorWeeklySlots,
  generateDoctorSlotsRange,
  generateDoctorTemplateSlots,
} from "../../services/doctorAppointmentsApi";
import "./DoctorAppointmentSlots.css";

const todayDate = () => new Date().toISOString().slice(0, 10);

const defaultRange = () => {
  const from = new Date();
  const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    from_date: from.toISOString().slice(0, 10),
    to_date: to.toISOString().slice(0, 10),
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "-";

  let date;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    date = new Date(`1970-01-01T${value}`);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getTemplateSummary = (template) => {
  const day = template.day_of_week || "Scheduled day";
  return `${day}, ${formatTime(template.start_time)} - ${formatTime(template.end_time)}`;
};

const getDepartmentLabel = (template) => {
  const departmentName =
    template.staff_hospitals_departments?.hospitals_departments?.departments?.department_name ||
    template.department?.department_name ||
    template.department_name;
  const departmentId = template.department_id || template.department?.id;

  return departmentName || (departmentId ? `Department #${departmentId}` : "No department listed");
};

export default function DoctorAppointmentSlots() {
  const [assignments, setAssignments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayDate());
  const [checkedAvailableDate, setCheckedAvailableDate] = useState(todayDate());
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "09:30",
    department_id: "",
  });
  const [slotRangeForm, setSlotRangeForm] = useState(defaultRange());
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateRange, setTemplateRange] = useState(defaultRange());

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");
      const [assignmentData, templateData, slotData, statusData, availableData] = await Promise.all([
        getDoctorAssignments(),
        getDoctorTemplates(),
        getDoctorSlots(),
        getDoctorSlotGenerationStatus(),
        getDoctorAvailableSlots(selectedDate),
      ]);
      const nextAssignments = assignmentData || [];
      setAssignments(nextAssignments);
      setTemplates(templateData || []);
      setSlots(slotData || []);
      setGenerationStatus(statusData || null);
      setAvailableSlots(availableData || []);
      setCheckedAvailableDate(selectedDate);
      if (nextAssignments.length === 1) {
        setTemplateForm((prev) => ({
          ...prev,
          department_id: String(nextAssignments[0].department_id),
        }));
      }
    } catch (err) {
      setError(err.message || "Unable to load doctor appointment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckAvailableSlots = async () => {
    if (!selectedDate) {
      setError("Choose a date to check available slots.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const availableData = await getDoctorAvailableSlots(selectedDate);
      setAvailableSlots(availableData || []);
      setCheckedAvailableDate(selectedDate);
      setShowAvailableOnly(true);
      setMessage(`Available slots refreshed for ${formatDate(selectedDate)}.`);
    } catch (err) {
      setError(err.message || "Unable to refresh available slots.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowAllSlots = () => {
    setShowAvailableOnly(false);
    setMessage("");
    setError("");
  };

  const handleInputChange = (field, value) => {
    setTemplateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTemplate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (assignments.length > 1 && !templateForm.department_id) {
      setError("Choose which department this template belongs to.");
      return;
    }

    try {
      setLoading(true);
      await createDoctorTemplate(
        {
          day_of_week: templateForm.day_of_week,
          start_time: templateForm.start_time,
          end_time: templateForm.end_time,
        },
        templateForm.department_id,
      );
      setMessage("Template created successfully.");
      setTemplateForm((prev) => ({ ...prev, start_time: "09:00", end_time: "09:30" }));
      const updatedTemplates = await getDoctorTemplates();
      setTemplates(updatedTemplates || []);
    } catch (err) {
      setError(err.message || "Unable to create template.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      setLoading(true);
      await deleteDoctorTemplate(templateId);
      setTemplates((prev) => prev.filter((item) => item.id !== templateId));
      setMessage("Template deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete template.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWeekly = async () => {
    try {
      setLoading(true);
      setError("");
      await generateDoctorWeeklySlots();
      setMessage("Weekly slots generated successfully.");
      await loadPageData();
    } catch (err) {
      setError(err.message || "Unable to generate weekly slots.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRange = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!slotRangeForm.from_date || !slotRangeForm.to_date) {
      setError("Both date range fields are required.");
      return;
    }

    try {
      setLoading(true);
      await generateDoctorSlotsRange(slotRangeForm.from_date, slotRangeForm.to_date);
      setMessage("Slots generated for the selected range.");
      await loadPageData();
    } catch (err) {
      setError(err.message || "Unable to generate slots for range.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForTemplate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedTemplateId) {
      setError("Select a template before generating slots for it.");
      return;
    }

    if (!templateRange.from_date || !templateRange.to_date) {
      setError("A start and end date are required for template generation.");
      return;
    }

    try {
      setLoading(true);
      await generateDoctorTemplateSlots(
        selectedTemplateId,
        templateRange.from_date,
        templateRange.to_date,
      );
      setMessage("Template-specific slots generated successfully.");
      await loadPageData();
    } catch (err) {
      setError(err.message || "Unable to generate slots for template.");
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateRow = (template) => (
    <tr key={template.id}>
      <td>
        <strong>{getTemplateSummary(template)}</strong>
        <span className="doctor-slots-row-hint">Repeats every {template.day_of_week || "selected day"}</span>
      </td>
      <td>{getDepartmentLabel(template)}</td>
      <td>
        <span className="doctor-slots-badge doctor-slots-badge--success">Active template</span>
      </td>
      <td>
        <button className="doctor-slots-btn doctor-slots-btn--danger" onClick={() => handleDeleteTemplate(template.id)}>
          Delete
        </button>
      </td>
    </tr>
  );

  const renderSlotRow = (slot) => {
    const date = slot.appointment_date || slot.appointmentDate || "-";
    const isActive = slot.active_appointment_booking_slot !== false;
    const isBooked = Boolean(slot.appointments_made?.length);

    return (
      <tr key={slot.id}>
        <td>
          <strong>{formatDate(date)}</strong>
          <span className="doctor-slots-row-hint">
            {formatTime(slot.slot_start_time || slot.start_time)} - {formatTime(slot.slot_end_time || slot.end_time)}
          </span>
        </td>
        <td>
          <span className={`doctor-slots-badge ${isActive ? "doctor-slots-badge--success" : "doctor-slots-badge--muted"}`}>
            {isActive ? "Ready to book" : "Inactive"}
          </span>
        </td>
        <td>
          <span className={`doctor-slots-badge ${isBooked ? "doctor-slots-badge--warning" : "doctor-slots-badge--open"}`}>
            {isBooked ? "Booked by patient" : "Open for patients"}
          </span>
        </td>
        <td>{slot.appointments_templates?.day_of_week || "From template"}</td>
      </tr>
    );
  };

  const displayedSlots = showAvailableOnly ? availableSlots : slots;
  const slotsTitle = showAvailableOnly
    ? `Available Slots for ${formatDate(checkedAvailableDate)}`
    : "Upcoming Slots";
  const emptySlotsMessage = showAvailableOnly
    ? `No available slots found for ${formatDate(checkedAvailableDate)}.`
    : "No upcoming slots yet. Generate slots from your templates when you are ready for patients to book.";

  return (
    <div className="doctor-slots-page">
      <div className="doctor-slots-header-row">
        <div>
          <h1 className="doctor-slots-title">Doctor Appointments</h1>
          <p className="doctor-slots-subtitle">
            Manage recurring templates, generate booking slots, and review your doctor schedule from one UI.
          </p>
        </div>
        <div className="doctor-slots-action-row">
          <button className="doctor-slots-btn doctor-slots-btn--primary" onClick={handleGenerateWeekly} disabled={loading}>
            Generate Weekly Slots
          </button>
        </div>
      </div>

      {error && <div className="doctor-slots-alert doctor-slots-alert--error">{error}</div>}
      {message && <div className="doctor-slots-alert doctor-slots-alert--success">{message}</div>}
      {loading && <div className="doctor-slots-alert doctor-slots-alert--info">Working… please wait.</div>}

      <div className="doctor-slots-stats-grid">
        <div className="doctor-slots-stat-card">
          <strong>{templates.length}</strong>
          <p>Active templates</p>
        </div>
        <div className="doctor-slots-stat-card">
          <strong>{slots.length}</strong>
          <p>Total slots loaded</p>
        </div>
        <div className="doctor-slots-stat-card">
          <strong>{availableSlots.length}</strong>
          <p>Available on {checkedAvailableDate}</p>
        </div>
        <div className="doctor-slots-stat-card">
          <strong>{generationStatus?.latest_slot_date || "-"}</strong>
          <p>Latest generated slot</p>
        </div>
      </div>

      <div className="doctor-slots-grid-layout">
        <section className="doctor-slots-card">
          <h2 className="doctor-slots-section-title">Create Appointment Template</h2>
          <form className="doctor-slots-form" onSubmit={handleCreateTemplate}>
            <label className="doctor-slots-label">
              Department
              {assignments.length > 1 ? (
                <select
                  className="doctor-slots-input"
                  value={templateForm.department_id}
                  onChange={(e) => handleInputChange("department_id", e.target.value)}
                >
                  <option value="">Choose a department</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.department_id} value={assignment.department_id}>
                      {assignment.department_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="doctor-slots-readonly-field">
                  {assignments[0]?.department_name || "Department will be selected from your doctor profile"}
                </div>
              )}
            </label>
            <label className="doctor-slots-label">
              Day of Week
              <select
                className="doctor-slots-input"
                value={templateForm.day_of_week}
                onChange={(e) => handleInputChange("day_of_week", e.target.value)}
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </label>
            <div className="doctor-slots-inline-fields">
              <label className="doctor-slots-label doctor-slots-label--half">
                Start Time
                <input
                  className="doctor-slots-input"
                  type="time"
                  value={templateForm.start_time}
                  onChange={(e) => handleInputChange("start_time", e.target.value)}
                />
              </label>
              <label className="doctor-slots-label doctor-slots-label--half">
                End Time
                <input
                  className="doctor-slots-input"
                  type="time"
                  value={templateForm.end_time}
                  onChange={(e) => handleInputChange("end_time", e.target.value)}
                />
              </label>
            </div>
            <button className="doctor-slots-btn doctor-slots-btn--secondary" type="submit" disabled={loading}>
              Save Template
            </button>
          </form>
        </section>

        <section className="doctor-slots-card">
          <h2 className="doctor-slots-section-title">Slot Generation</h2>
          <form className="doctor-slots-form" onSubmit={handleGenerateRange}>
            <label className="doctor-slots-label">
              From Date
              <input
                className="doctor-slots-input"
                type="date"
                value={slotRangeForm.from_date}
                onChange={(e) => setSlotRangeForm((prev) => ({ ...prev, from_date: e.target.value }))}
              />
            </label>
            <label className="doctor-slots-label">
              To Date
              <input
                className="doctor-slots-input"
                type="date"
                value={slotRangeForm.to_date}
                onChange={(e) => setSlotRangeForm((prev) => ({ ...prev, to_date: e.target.value }))}
              />
            </label>
            <button className="doctor-slots-btn doctor-slots-btn--secondary" type="submit" disabled={loading}>
              Generate Range Slots
            </button>
          </form>

          <div className="doctor-slots-divider" />

          <label className="doctor-slots-label">
            Choose template
            <select
              className="doctor-slots-input"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {`${template.day_of_week} ${template.start_time || ""}-${template.end_time || ""}`}
                </option>
              ))}
            </select>
          </label>
          <form className="doctor-slots-form" onSubmit={handleGenerateForTemplate}>
            <div className="doctor-slots-inline-fields">
              <label className="doctor-slots-label doctor-slots-label--half">
                Start date
                <input
                  className="doctor-slots-input"
                  type="date"
                  value={templateRange.from_date}
                  onChange={(e) => setTemplateRange((prev) => ({ ...prev, from_date: e.target.value }))}
                />
              </label>
              <label className="doctor-slots-label doctor-slots-label--half">
                End date
                <input
                  className="doctor-slots-input"
                  type="date"
                  value={templateRange.to_date}
                  onChange={(e) => setTemplateRange((prev) => ({ ...prev, to_date: e.target.value }))}
                />
              </label>
            </div>
            <button className="doctor-slots-btn doctor-slots-btn--secondary" type="submit" disabled={loading || !selectedTemplateId}>
              Generate For Template
            </button>
          </form>
        </section>
      </div>

      <section className="doctor-slots-card">
        <h2 className="doctor-slots-section-title">My Templates</h2>
        <div className="doctor-slots-table-wrapper">
          <table className="doctor-slots-table">
            <thead>
              <tr>
                <th>When it repeats</th>
                <th>Where</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="doctor-slots-empty-row">
                    No recurring appointment times yet. Create one above to start building bookable slots.
                  </td>
                </tr>
              ) : (
                templates.map(renderTemplateRow)
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="doctor-slots-card">
        <div className="doctor-slots-section-header">
          <h2 className="doctor-slots-section-title">{slotsTitle}</h2>
          <div className="doctor-slots-date-filter">
            <label className="doctor-slots-label-small">
              Check available slots for
              <input
                className="doctor-slots-input-small"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>
            <button
              className="doctor-slots-btn doctor-slots-btn--secondary"
              type="button"
              onClick={handleCheckAvailableSlots}
              disabled={loading}
            >
              Check
            </button>
            {showAvailableOnly && (
              <button
                className="doctor-slots-btn doctor-slots-btn--secondary"
                type="button"
                onClick={handleShowAllSlots}
                disabled={loading}
              >
                Show All
              </button>
            )}
          </div>
        </div>
        <div className="doctor-slots-table-wrapper">
          <table className="doctor-slots-table">
            <thead>
              <tr>
                <th>Appointment time</th>
                <th>Status</th>
                <th>Patient booking</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {displayedSlots.length === 0 ? (
                <tr>
                  <td colSpan="4" className="doctor-slots-empty-row">
                    {emptySlotsMessage}
                  </td>
                </tr>
              ) : (
                displayedSlots.map(renderSlotRow)
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
