import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import { getDoctorSlots } from "../../../services/doctorAppointmentsApi.js";
import DirectorAppointments from "../../director/DirectorAppointments.jsx";
import "../../CSSpages/sidebar-pages/BookedAppointments.css";

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
  if (value.includes?.("T")) {
    return new Date(value).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return value.length === 8 ? value.slice(0, 5) : value;
};

const getPatientProfileLink = (appointment) => appointment?.users?.users_profiles?.[0] || null;

const getPatientProfile = (appointment) => getPatientProfileLink(appointment)?.profiles || null;

const getPatientName = (appointment) => {
  const patient = appointment?.users;
  const profile = getPatientProfile(appointment);
  const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  return fullName || patient?.username || "Unknown patient";
};

const getPatientEmail = (appointment) => getPatientProfileLink(appointment)?.email || "No email recorded";

function DoctorBookedAppointments() {
  const [slots, setSlots] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

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

  const bookedAppointments = useMemo(() => {
    return slots
      .flatMap((slot) =>
        (slot.appointments_made || [])
          .filter((appointment) => appointment.active_appointment_made !== false)
          .map((appointment) => ({ ...appointment, slot })),
      )
      .sort((a, b) => {
        const dateA = new Date(a.slot?.appointment_date || 0).getTime();
        const dateB = new Date(b.slot?.appointment_date || 0).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return String(a.slot?.slot_start_time || "").localeCompare(String(b.slot?.slot_start_time || ""));
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
          <p>Review appointments patients have booked with you.</p>
        </div>
        <div className="doctor-booked-count">
          <span>{bookedAppointments.length}</span>
          <small>Booked</small>
        </div>
      </div>

      <section className="doctor-booked-card">
        {loading ? (
          <p>Loading booked appointments...</p>
        ) : error ? (
          <div className="doctor-booked-message error">{error}</div>
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
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {bookedAppointments.map((appointment) => {
                const slot = appointment.slot;
                const startTime = slot?.slot_start_time || slot?.appointments_templates?.start_time;
                const endTime = slot?.slot_end_time || slot?.appointments_templates?.end_time;

                return (
                  <tr key={appointment.id} onClick={() => setSelectedAppointment(appointment)}>
                    <td data-label="Patient">{getPatientName(appointment)}</td>
                    <td data-label="Date">{formatDate(slot?.appointment_date)}</td>
                    <td data-label="Time">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </td>
                    <td data-label="Email">{getPatientEmail(appointment)}</td>
                    <td data-label="Details">
                      <button type="button" onClick={() => setSelectedAppointment(appointment)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {selectedAppointment && (
        <div className="doctor-booked-modal-backdrop" onClick={() => setSelectedAppointment(null)}>
          <section className="doctor-booked-modal" onClick={(event) => event.stopPropagation()}>
            <div className="doctor-booked-modal-header">
              <div>
                <h2>{getPatientName(selectedAppointment)}</h2>
                <p>{getPatientEmail(selectedAppointment)}</p>
              </div>
              <button type="button" aria-label="Close patient details" onClick={() => setSelectedAppointment(null)}>
                x
              </button>
            </div>

            <div className="doctor-booked-detail-grid">
              <div>
                <span>Appointment</span>
                <strong>
                  {formatDate(selectedAppointment.slot?.appointment_date)}
                  {" · "}
                  {formatTime(selectedAppointment.slot?.slot_start_time)} - {formatTime(selectedAppointment.slot?.slot_end_time)}
                </strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{selectedProfile?.phone_number || "No phone recorded"}</strong>
              </div>
              <div>
                <span>Gender</span>
                <strong>{selectedProfile?.gender || "Not recorded"}</strong>
              </div>
              <div>
                <span>Birth Date</span>
                <strong>{selectedProfile?.birth ? formatDate(selectedProfile.birth) : "Not recorded"}</strong>
              </div>
            </div>

            <div className="doctor-booked-detail-section">
              <h3>Allergies</h3>
              {selectedAllergies.length === 0 ? (
                <p>No allergies recorded.</p>
              ) : (
                <ul>
                  {selectedAllergies.map((allergy) => (
                    <li key={allergy.id}>
                      <strong>{allergy.allergy_name}</strong>
                      <span>{allergy.allergy_type} · {allergy.severity}</span>
                      {allergy.reaction_symptoms && <p>{allergy.reaction_symptoms}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="doctor-booked-detail-section">
              <h3>Insurance</h3>
              {selectedInsurance.length === 0 ? (
                <p>No insurance recorded.</p>
              ) : (
                <ul>
                  {selectedInsurance.map((insurance) => (
                    <li key={insurance.id}>
                      <strong>{insurance.provider || "Insurance provider"}</strong>
                      <span>
                        Policy {insurance.policy_number || "not recorded"}
                        {insurance.coverage_percent != null ? ` · ${insurance.coverage_percent}% coverage` : ""}
                      </span>
                      {insurance.insurance_company_email && <p>{insurance.insurance_company_email}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function BookedAppointments() {
  const location = useLocation();
  const { user } = useAuth();
  const role = (location.state?.role || user?.role || "").toLowerCase();

  if (role === "director") {
    return <DirectorAppointments />;
  }

  if (role === "doctor") {
    return <DoctorBookedAppointments />;
  }

  return (
    <div className="doctor-booked-page">
      <div className="doctor-booked-header">
        <div>
          <h1>Booked Appointments</h1>
          <p>This page displays booked appointments.</p>
        </div>
      </div>
    </div>
  );
}
