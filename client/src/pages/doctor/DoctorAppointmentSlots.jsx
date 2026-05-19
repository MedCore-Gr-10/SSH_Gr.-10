import { useState } from "react";

export default function DoctorCalendar() {
  const [selectedCell, setSelectedCell] = useState(null);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

  const slots = [
    { day: "Tue", time: "09:00", label: "Checkup", type: "available" },
    { day: "Wed", time: "10:00", label: "Surgery", type: "booked" },
    { day: "Fri", time: "13:00", label: "Consultation", type: "available" }
  ];

  const getSlot = (day, time) =>
    slots.find((s) => s.day === day && s.time === time);

  return (
    <div style={styles.wrapper}>
      <h2 style={{ fontSize: "22px", color: "#1a202c", fontWeight: "700", marginBottom: "20px", width: "85%", textAlign: "left" }}>
        Doctor Weekly Calendar
      </h2>

      <div style={styles.grid}>
        <div style={styles.corner}></div>

        {days.map((d) => (
          <div key={d} style={styles.header}>{d}</div>
        ))}

        {hours.map((hour) => (
          <div key={hour} style={{ display: "contents" }}>
            <div style={styles.time}>{hour}</div>

            {days.map((day) => {
              const slot = getSlot(day, hour);

              return (
                <div
                  key={day + hour}
                  style={styles.cell}
                  onClick={() => setSelectedCell({ day, time: hour, slot })}
                >
                  {slot && (
                    <div
                      style={{
                        ...styles.slot,
                        backgroundColor: slot.type === "booked" ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
                        color: slot.type === "booked" ? "#ef4444" : "#10b981",
                        borderLeft: slot.type === "booked" ? "3px solid #ef4444" : "3px solid #10b981"
                      }}
                    >
                      {slot.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedCell && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCell(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px 0", color: "#1a202c", fontSize: "18px", fontWeight: "600" }}>
              Slot Details
            </h3>

            <p style={{ fontSize: "14px", color: "#4a5568", margin: "0 0 8px 0" }}>
              <b>Day:</b> {selectedCell.day}
            </p>
            <p style={{ fontSize: "14px", color: "#4a5568", margin: "0 0 12px 0" }}>
              <b>Time:</b> {selectedCell.time}
            </p>

            {selectedCell.slot ? (
              <div style={{ background: "#f7fafc", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #edf2f7" }}>
                <p style={{ fontSize: "13px", color: "#4a5568", margin: "0 0 6px 0", textTransform: "capitalize" }}>
                  <b>Status:</b> {selectedCell.slot.type}
                </p>
                <p style={{ fontSize: "13px", color: "#4a5568", margin: 0 }}>
                  <b>Label:</b> {selectedCell.slot.label}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: "#718096", margin: "0 0 20px 0" }}>
                No assignment scheduled here.
              </p>
            )}

            <button 
              onClick={() => setSelectedCell(null)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#5c5cd6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "40px 0",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#2d3748",
    backgroundColor: "#ffffff",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "100px repeat(7, 1fr)",
    border: "1px solid #edf2f7",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.03)",
    width: "85%",
    boxSizing: "border-box"
  },
  corner: {
    height: "40px",
    border: "1px solid #edf2f7",
    backgroundColor: "#fafafa",
  },
  header: {
    border: "1px solid #edf2f7",
    textAlign: "center",
    padding: "10px",
    background: "#fafafa",
    fontWeight: "600",
    color: "#1a202c",
    fontSize: "14px",
  },
  time: {
    border: "1px solid #edf2f7",
    padding: "10px",
    fontSize: "12px",
    background: "#fafafa",
    color: "#718096",
    fontWeight: "500",
    textAlign: "center",
  },
  cell: {
    border: "1px solid #edf2f7",
    height: "60px",
    cursor: "pointer",
    position: "relative",
    backgroundColor: "#ffffff",
  },
  slot: {
    position: "absolute",
    top: "5px",
    left: "5px",
    right: "5px",
    bottom: "5px",
    padding: "6px",
    fontSize: "12px",
    borderRadius: "6px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(26, 32, 44, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(2px)",
    zIndex: 1000,
  },
  modal: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    width: "340px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
    border: "1px solid #edf2f7",
  },
};