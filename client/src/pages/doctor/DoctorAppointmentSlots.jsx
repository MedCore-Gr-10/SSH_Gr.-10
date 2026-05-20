import React, { useState } from 'react';

export default function DoctorCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const hours = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00"
  ];

  const [activeSlot, setActiveSlot] = useState(null);

  const timeToIndex = (time) => {
    const hour = parseInt(time.split(":")[0]);
    return hour - 8;
  };

  const slots = [
    {
      day: "Tue",
      start: "09:00",
      end: "11:00",
      label: "Consultation",
      type: "available",
      notes: "General checkups and follow-up medical reviews."
    },
    {
      day: "Wed",
      start: "10:00",
      end: "13:00",
      label: "Surgery",
      type: "booked",
      notes: "Operating Room 3. Patient preparation starts at 09:30."
    },
    {
      day: "Fri",
      start: "13:00",
      end: "16:00",
      label: "Long Session",
      type: "available",
      notes: "Extended behavioral counseling or diagnostic therapy block."
    }
  ];

  const totalHours = hours.length - 1; 
  const getTopPct = (start) => (timeToIndex(start) / totalHours) * 100;
  const getHeightPct = (start, end) => ((timeToIndex(end) - timeToIndex(start)) / totalHours) * 100;
  const getLeftPct = (day) => (days.indexOf(day) / days.length) * 100;
  const getWidthPct = () => 100 / days.length;

  const handleSlotClick = (slot) => {
    setActiveSlot(slot);
  };

  const closePopup = () => {
    setActiveSlot(null);
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Doctor Weekly Calendar</h2>

      <div style={styles.calendarContainer}>
        
        {/* HEADER ROW */}
        <div style={styles.headerRow}>
          <div style={styles.timeSpacer} />
          {days.map((d) => (
            <div key={d} style={styles.dayHeader}>
              {d}
            </div>
          ))}
        </div>

        {/* MAIN BODY AREA */}
        <div style={styles.bodyContainer}>
          
          {/* TIME LABELS COLUMN */}
          <div style={styles.timeColumn}>
            {hours.map((h, i) => (
              <div key={h} style={{ ...styles.timeLabel, top: `${(i / totalHours) * 100}%` }}>
                {h}
              </div>
            ))}
          </div>

          {/* WORKSPACE AREA */}
          <div style={styles.workspace}>
            
            {/* GRID BACKGROUND LINES */}
            <div style={styles.grid}>
              {hours.map((h, i) => (
                <div key={h} style={{ ...styles.rowLine, top: `${(i / totalHours) * 100}%` }} />
              ))}
              {days.map((d, i) => (
                <div key={d} style={{ ...styles.colLine, left: `${(i / days.length) * 100}%` }} />
              ))}
            </div>

            {/* INTERACTIVE SLOTS LAYER */}
            <div style={styles.slotLayer}>
              {slots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  style={{
                    ...styles.slot,
                    top: `calc(${getTopPct(slot.start)}% + 4px)`,
                    left: `calc(${getLeftPct(slot.day)}% + 4px)`,
                    height: `calc(${getHeightPct(slot.start, slot.end)}% - 8px)`,
                    width: `calc(${getWidthPct()}% - 8px)`,
                    backgroundColor: slot.type === "booked" ? "#fee2e2" : "#dcfce7",
                    borderLeft: `4px solid ${slot.type === "booked" ? "#ef4444" : "#22c55e"}`,
                    color: slot.type === "booked" ? "#991b1b" : "#166534"
                  }}
                >
                  <b style={styles.slotLabel}>{slot.label}</b>
                  <div style={styles.slotTime}>{slot.start} - {slot.end}</div>
                </button>
              ))}
            </div>

          </div> {/* End Workspace */}
        </div> {/* End Body Container */}
      </div> {/* End Calendar Container */}

      {/* UNIQUELY NAMED POPUP MODAL */}
      {activeSlot && (
        <div style={styles.calendarModalOverlay} onClick={closePopup}>
          <div style={styles.calendarModalCardWindow} onClick={(e) => e.stopPropagation()}>
            <div style={styles.calendarModalTopHeaderBar}>
              <h3 style={styles.calendarModalMainHeadingTitle}>{activeSlot.label}</h3>
              <button style={styles.calendarModalXCloseBtn} onClick={closePopup}>&times;</button>
            </div>
            
            <div style={styles.calendarModalDataBodyContainer}>
              <div style={styles.calendarModalItemGridRow}>
                <span style={styles.calendarModalFieldTextLabel}>Day:</span>
                <span style={styles.calendarModalFieldTextValue}>{activeSlot.day}</span>
              </div>
              <div style={styles.calendarModalItemGridRow}>
                <span style={styles.calendarModalFieldTextLabel}>Time:</span>
                <span style={styles.calendarModalFieldTextValue}>{activeSlot.start} - {activeSlot.end}</span>
              </div>
              <div style={styles.calendarModalItemGridRow}>
                <span style={styles.calendarModalFieldTextLabel}>Status:</span>
                <span style={{
                  ...styles.calendarModalStatusCapsuleBadge,
                  backgroundColor: activeSlot.type === "booked" ? "#fee2e2" : "#dcfce7",
                  color: activeSlot.type === "booked" ? "#ef4444" : "#22c55e"
                }}>
                  {activeSlot.type.toUpperCase()}
                </span>
              </div>
              {activeSlot.notes && (
                <div style={styles.calendarModalParagraphNotesSegmentBlock}>
                  <p style={styles.calendarModalFieldTextLabel}>Additional Notes:</p>
                  <p style={styles.calendarModalParagraphNotesTextValue}>{activeSlot.notes}</p>
                </div>
              )}
            </div>

            <div style={styles.calendarModalBottomFooterActionTray}>
              <button style={styles.calendarModalSubmitDoneActionButton} onClick={closePopup}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "20px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
    height: "100%",      
    width: "100%",       
    minHeight: "85vh",   
    display: "flex",
    flexDirection: "column"
  },

  heading: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 15px 0",
    flexShrink: 0
  },

  calendarContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    flexGrow: 1,         
    width: "100%"        
  },

  headerRow: {
    display: "flex",
    backgroundColor: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
    height: 45,
    alignItems: "center",
    flexShrink: 0,
    width: "100%"
  },

  timeSpacer: {
    width: 65,
    flexShrink: 0
  },

  dayHeader: {
    flex: 1,             
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    color: "#475569"
  },

  bodyContainer: {
    display: "flex",
    flexGrow: 1,
    position: "relative",
    width: "100%"
  },

  timeColumn: {
    position: "relative",
    width: 65,
    backgroundColor: "#f8fafc",
    flexShrink: 0,
    borderRight: "1px solid #e2e8f0"
  },

  timeLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    transform: "translateY(-50%)"
  },

  workspace: {
    position: "relative",
    flexGrow: 1,         
    height: "100%"
  },

  grid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  rowLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 0,
    borderTop: "1px solid #f1f5f9"
  },

  colLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 0,
    borderLeft: "1px solid #f1f5f9"
  },

  slotLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  slot: {
    position: "absolute",
    borderRadius: 6,
    padding: "6px 8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    boxSizing: "border-box",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    outline: "none"
  },

  slotLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
    display: "block"
  },

  slotTime: {
    fontSize: 11,
    opacity: 0.85
  },

  /* NEW EXPLICITLY UNIQUE POPUP STYLE NAMES */
  calendarModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999, // Super high index to guarantee isolation over other app views
    backdropFilter: "blur(4px)" 
  },

  calendarModalCardWindow: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },

  calendarModalTopHeaderBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc"
  },

  calendarModalMainHeadingTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#0f172a"
  },

  calendarModalXCloseBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#94a3b8",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1
  },

  calendarModalDataBodyContainer: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  calendarModalItemGridRow: {
    display: "flex",
    alignItems: "center"
  },

  calendarModalFieldTextLabel: {
    width: "100px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    margin: 0
  },

  calendarModalFieldTextValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155"
  },

  calendarModalStatusCapsuleBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px"
  },

  calendarModalParagraphNotesSegmentBlock: {
    marginTop: "6px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "12px"
  },

  calendarModalParagraphNotesTextValue: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#475569",
    lineHeight: "1.5",
    fontStyle: "italic"
  },

  calendarModalBottomFooterActionTray: {
    padding: "12px 20px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    display: "flex",
    justifyContent: "flex-end"
  },

  calendarModalSubmitDoneActionButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
  }
};