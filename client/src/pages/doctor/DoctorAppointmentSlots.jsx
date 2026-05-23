import { useEffect, useState } from "react";
import {
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

const todayDate = () => new Date().toISOString().slice(0, 10);

const defaultRange = () => {
  const from = new Date();
  const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    from_date: from.toISOString().slice(0, 10),
    to_date: to.toISOString().slice(0, 10),
  };
};

export default function DoctorAppointmentSlots() {
  const [templates, setTemplates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayDate());
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
      const [templateData, slotData, statusData, availableData] = await Promise.all([
        getDoctorTemplates(),
        getDoctorSlots(),
        getDoctorSlotGenerationStatus(),
        getDoctorAvailableSlots(selectedDate),
      ]);
      setTemplates(templateData || []);
      setSlots(slotData || []);
      setGenerationStatus(statusData || null);
      setAvailableSlots(availableData || []);
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

  useEffect(() => {
    if (!selectedDate) return;
    const refreshAvailable = async () => {
      try {
        const availableData = await getDoctorAvailableSlots(selectedDate);
        setAvailableSlots(availableData || []);
      } catch (err) {
        setError(err.message || "Unable to refresh available slots.");
      }
    };
    refreshAvailable();
  }, [selectedDate]);

  const handleInputChange = (field, value) => {
    setTemplateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTemplate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!templateForm.department_id) {
      setError("Department ID is required to create a template.");
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
      <td>{template.day_of_week || "-"}</td>
      <td>{template.start_time || "-"}</td>
      <td>{template.end_time || "-"}</td>
      <td>{template.department_id || template.department?.id || "Unknown"}</td>
      <td>
        <button style={styles.dangerButton} onClick={() => handleDeleteTemplate(template.id)}>
          Delete
        </button>
      </td>
    </tr>
  );

  const renderSlotRow = (slot) => {
    const date = slot.appointment_date || slot.appointmentDate || "-";
    return (
      <tr key={slot.id}>
        <td>{date}</td>
        <td>{slot.slot_start_time || slot.start_time || "-"}</td>
        <td>{slot.slot_end_time || slot.end_time || "-"}</td>
        <td>{slot.active_slot === false ? "Inactive" : "Active"}</td>
        <td>{slot.appointments_made ? (slot.appointments_made.length ? "Booked" : "Open") : "Open"}</td>
      </tr>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Doctor Appointments</h1>
          <p style={styles.subtitle}>
            Manage recurring templates, generate booking slots, and review your doctor schedule from one UI.
          </p>
        </div>
        <div style={styles.actionRow}>
          <button style={styles.primaryButton} onClick={handleGenerateWeekly} disabled={loading}>
            Generate Weekly Slots
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {message && <div style={styles.successBox}>{message}</div>}
      {loading && <div style={styles.infoBox}>Working… please wait.</div>}

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <strong>{templates.length}</strong>
          <p>Active templates</p>
        </div>
        <div style={styles.statCard}>
          <strong>{slots.length}</strong>
          <p>Total slots loaded</p>
        </div>
        <div style={styles.statCard}>
          <strong>{availableSlots.length}</strong>
          <p>Available on {selectedDate}</p>
        </div>
        <div style={styles.statCard}>
          <strong>{generationStatus?.latest_slot_date || "-"}</strong>
          <p>Latest generated slot</p>
        </div>
      </div>

      <div style={styles.gridLayout}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Create Appointment Template</h2>
          <form style={styles.form} onSubmit={handleCreateTemplate}>
            <label style={styles.label}>
              Department ID
              <input
                style={styles.input}
                type="text"
                value={templateForm.department_id}
                onChange={(e) => handleInputChange("department_id", e.target.value)}
                placeholder="Enter department ID"
              />
            </label>
            <label style={styles.label}>
              Day of Week
              <select
                style={styles.input}
                value={templateForm.day_of_week}
                onChange={(e) => handleInputChange("day_of_week", e.target.value)}
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </label>
            <div style={styles.inlineFields}>
              <label style={styles.labelHalf}>
                Start Time
                <input
                  style={styles.input}
                  type="time"
                  value={templateForm.start_time}
                  onChange={(e) => handleInputChange("start_time", e.target.value)}
                />
              </label>
              <label style={styles.labelHalf}>
                End Time
                <input
                  style={styles.input}
                  type="time"
                  value={templateForm.end_time}
                  onChange={(e) => handleInputChange("end_time", e.target.value)}
                />
              </label>
            </div>
            <button style={styles.secondaryButton} type="submit" disabled={loading}>
              Save Template
            </button>
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Slot Generation</h2>
          <form style={styles.form} onSubmit={handleGenerateRange}>
            <label style={styles.label}>
              From Date
              <input
                style={styles.input}
                type="date"
                value={slotRangeForm.from_date}
                onChange={(e) => setSlotRangeForm((prev) => ({ ...prev, from_date: e.target.value }))}
              />
            </label>
            <label style={styles.label}>
              To Date
              <input
                style={styles.input}
                type="date"
                value={slotRangeForm.to_date}
                onChange={(e) => setSlotRangeForm((prev) => ({ ...prev, to_date: e.target.value }))}
              />
            </label>
            <button style={styles.secondaryButton} type="submit" disabled={loading}>
              Generate Range Slots
            </button>
          </form>

          <div style={styles.divider} />

          <label style={styles.label}>
            Choose template
            <select
              style={styles.input}
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
          <form style={styles.form} onSubmit={handleGenerateForTemplate}>
            <div style={styles.inlineFields}>
              <label style={styles.labelHalf}>
                Start date
                <input
                  style={styles.input}
                  type="date"
                  value={templateRange.from_date}
                  onChange={(e) => setTemplateRange((prev) => ({ ...prev, from_date: e.target.value }))}
                />
              </label>
              <label style={styles.labelHalf}>
                End date
                <input
                  style={styles.input}
                  type="date"
                  value={templateRange.to_date}
                  onChange={(e) => setTemplateRange((prev) => ({ ...prev, to_date: e.target.value }))}
                />
              </label>
            </div>
            <button style={styles.secondaryButton} type="submit" disabled={loading || !selectedTemplateId}>
              Generate For Template
            </button>
          </form>
        </section>
      </div>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>My Templates</h2>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyRow}>
                    No appointment templates found.
                  </td>
                </tr>
              ) : (
                templates.map(renderTemplateRow)
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Upcoming Slots</h2>
          <div style={styles.dateFilter}>
            <label style={styles.labelSmall}>
              Check available slots for
              <input
                style={styles.inputSmall}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Booked</th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyRow}>
                    No slots found. Generate slots to begin.
                  </td>
                </tr>
              ) : (
                slots.map(renderSlotRow)
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    padding: "32px",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    color: "#1f2937",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    margin: 0,
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#4b5563",
    maxWidth: "720px",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
  },
  primaryButton: {
    background: "#2563eb",
    border: "none",
    color: "white",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    minWidth: "180px",
  },
  secondaryButton: {
    background: "#111827",
    border: "none",
    color: "white",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "12px",
  },
  dangerButton: {
    background: "#dc2626",
    border: "none",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    background: "#ffffff",
    minHeight: "100px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  gridLayout: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px",
    marginBottom: "24px",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "24px",
    background: "#ffffff",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "16px",
  },
  form: {
    display: "grid",
    gap: "14px",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontSize: "14px",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },
  inlineFields: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  labelHalf: {
    display: "grid",
    gap: "8px",
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "18px 0",
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "640px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  dateFilter: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  labelSmall: {
    display: "flex",
    flexDirection: "column",
    fontSize: "14px",
    color: "#374151",
  },
  inputSmall: {
    width: "180px",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    marginTop: "8px",
  },
  emptyRow: {
    textAlign: "center",
    padding: "18px 0",
    color: "#6b7280",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "16px",
    padding: "16px 18px",
    marginBottom: "18px",
    border: "1px solid #fca5a5",
  },
  successBox: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "16px",
    padding: "16px 18px",
    marginBottom: "18px",
    border: "1px solid #86efac",
  },
  infoBox: {
    background: "#e0f2fe",
    color: "#075985",
    borderRadius: "16px",
    padding: "16px 18px",
    marginBottom: "18px",
    border: "1px solid #7dd3fc",
  },
};