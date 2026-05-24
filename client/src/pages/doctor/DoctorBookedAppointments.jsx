import React, { useEffect, useMemo, useState } from "react";
import { getDoctorSlots } from "../../services/doctorAppointmentsApi.js";
import "../CSSpages/sidebar-pages/BookedAppointments.css";

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

// 🔹 patient helpers (same as your working file)
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

export default function DoctorBookedAppointments() {
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
          .filter((a) => a.active_appointment_made !== false)
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
                <th>Details</th>
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
                    <td>{getPatientName(appointment)}</td>
                    <td>{formatDate(slot?.appointment_date)}</td>
                    <td>
                      {formatTime(slot?.slot_start_time)} -{" "}
                      {formatTime(slot?.slot_end_time)}
                    </td>
                    <td>{getPatientEmail(appointment)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
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

      {/* 🔥 MODAL */}
      {selectedAppointment && (
        <div
          className="doctor-booked-modal-backdrop"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="doctor-booked-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{getPatientName(selectedAppointment)}</h2>
            <p>{getPatientEmail(selectedAppointment)}</p>

            <hr />

            <p>
              <strong>Date:</strong>{" "}
              {formatDate(selectedAppointment.slot?.appointment_date)}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {formatTime(selectedAppointment.slot?.slot_start_time)} -{" "}
              {formatTime(selectedAppointment.slot?.slot_end_time)}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {selectedProfile?.phone_number || "Not recorded"}
            </p>

            <p>
              <strong>Gender:</strong>{" "}
              {selectedProfile?.gender || "Not recorded"}
            </p>

            <p>
              <strong>Birth:</strong>{" "}
              {selectedProfile?.birth
                ? formatDate(selectedProfile.birth)
                : "Not recorded"}
            </p>

            <hr />

            <h3>Allergies</h3>
            {selectedAllergies.length === 0 ? (
              <p>No allergies recorded.</p>
            ) : (
              selectedAllergies.map((a) => (
                <div key={a.id}>
                  <strong>{a.allergy_name}</strong>
                </div>
              ))
            )}

            <h3>Insurance</h3>
            {selectedInsurance.length === 0 ? (
              <p>No insurance recorded.</p>
            ) : (
              selectedInsurance.map((i) => (
                <div key={i.id}>
                  <strong>{i.provider}</strong>
                </div>
              ))
            )}

            <button onClick={() => setSelectedAppointment(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}