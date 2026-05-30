import React, { useEffect, useState } from "react";
import GenericTable from "../../components/common/GenericTable.jsx";
import "./AppointmentsMade.css";
import { superuserFetch } from "../../services/superuserApi.js";

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    superuserFetch("/appointments-made")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        setLoading(false);
      });
  }, []);

  const formatTime = (val) => val ? val.substring(11, 16) : "N/A";

  const columns = [
    { header: "ID", key: "id" },
    { header: "Patient Name", key: "patient" },
    { header: "Doctor Name", key: "doctor" },
    { header: "Hospital", key: "hospital" },
    { 
      header: "Appointment Date", 
      key: "date",
      render: (val) => val ? new Date(val).toLocaleDateString() : "N/A"
    },
    { header: "Start Time", key: "time", render: formatTime },
    { header: "End Time", key: "endTime", render: formatTime },
    { 
      header: "Completed", 
      key: "appointment_is_complete",
      render: (val) => (val ? "True" : "False")
    }
  ];

  const handleMoreClick = (item) => {
    setSelectedAppointment(item);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="appointments-container">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Appointments Made</h2>
          <p className="page-subtitle">Monitored appointments made across all hospitals</p>
        </div>
      </div>
      <GenericTable 
        columns={columns} 
        data={appointments} 
        onMoreClick={handleMoreClick} 
      />

      {/* Modal logic */}
      {isModalOpen && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Appointment Details</h3>
            <p><strong>ID:</strong> {selectedAppointment.id}</p>
            <p><strong>Patient:</strong> {selectedAppointment.patient}</p>
            <p><strong>Doctor:</strong> {selectedAppointment.doctor}</p>
            <p><strong>Hospital:</strong> {selectedAppointment.hospital}</p>
            <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
            <p><strong>Time Slot:</strong> {formatTime(selectedAppointment.time)} - {formatTime(selectedAppointment.endTime)}</p>
            <p><strong>Completed:</strong> {selectedAppointment.appointment_is_complete ? "True" : "False"}</p>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      
    </div>
  );
}
