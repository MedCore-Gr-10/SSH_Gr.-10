import React, { useState } from "react";
import "../../CSSpages/sidebar-pages/Appointments.css";

const timeSlots = [
  "08:00-08:30",
  "09:00-09:30",
  "10:00-10:30",
  "11:00-11:30",
  "12:00-12:30",
  "13:00-13:30",
  "14:00-14:30",
  "15:00-15:30",
  "16:00-16:30",
  "17:00-17:30",
  "18:00-18:30",
  "19:00-19:30",
  "19:30-20:00",
];

const specializations = [
  "All specializations",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
];

const placeholderAppointments = [
  {
    id: "appt-1",
    doctor: "Dr. John Smith",
    time: "08:00-08:30",
    date: "2026-02-20",
    specialization: "Cardiology",
    rating: 4.2,
    reviews: 120,
    location: "Main Street Clinic",
    notes: "Experienced with patient follow-up and treatment planning.",
  },
  {
    id: "appt-2",
    doctor: "Dr. John Smith",
    time: "10:30-11:00",
    date: "2026-02-20",
    specialization: "Cardiology",
    rating: 4.2,
    reviews: 120,
    location: "Main Street Clinic",
    notes: "Accepts new patients and has availability in the morning.",
  },
  {
    id: "appt-3",
    doctor: "Dr. John Smith",
    time: "14:00-14:30",
    date: "2026-02-24",
    specialization: "Cardiology",
    rating: 4.2,
    reviews: 120,
    location: "Main Street Clinic",
    notes: "Focus on personalized care and clear communication.",
  },
  {
    id: "appt-4",
    doctor: "Dr. Emma Johnson",
    time: "09:00-09:30",
    date: "2026-02-22",
    specialization: "Dermatology",
    rating: 3.8,
    reviews: 95,
    location: "Northside Health Center",
    notes: "Specializes in skin wellness and chronic condition management.",
  },
  {
    id: "appt-5",
    doctor: "Dr. Noah Brown",
    time: "11:00-11:30",
    date: "2026-02-25",
    specialization: "Pediatrics",
    rating: 4.5,
    reviews: 180,
    location: "Westside Pediatrics",
    notes: "Friendly pediatric specialist with strong family focus.",
  },
];

const formatDateDisplay = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

export default function Appointments() {
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(specializations[0]);
  const [activeAppointment, setActiveAppointment] = useState(null);

  const filteredAppointments = placeholderAppointments.filter((appointment) => {
    const matchesDoctor = appointment.doctor.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesTime = selectedTime ? appointment.time === selectedTime : true;
    const matchesDate = selectedDate ? appointment.date === selectedDate : true;
    const matchesSpecialty =
      selectedSpecialization === specializations[0] ? true : appointment.specialization === selectedSpecialization;
    return matchesDoctor && matchesTime && matchesDate && matchesSpecialty;
  });

  return (
    <div className="appointments-container">
      <div className="appointments-card">
        <h1 className="appointments-title">Appointments</h1>
        <p className="appointments-description">
          Search available appointments by doctor, specialization, date, or time slot. Click a row to view more details.
        </p>

        <div className="appointments-filters">
          <div className="filter-group">
            <label htmlFor="doctor-search" className="form-label">
              Search doctor
            </label>
            <input
              id="doctor-search"
              type="text"
              className="form-input"
              placeholder="Search by doctor name"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="specialization-select" className="form-label">
              Specialization
            </label>
            <select
              id="specialization-select"
              className="form-input"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              {specializations.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-picker" className="form-label">
              Appointment date
            </label>
            <input
              id="date-picker"
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="time-slot" className="form-label">
              Time slot
            </label>
            <select
              id="time-slot"
              className="form-input"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">All time slots</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="appointments-table-wrapper">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Time Slot</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length ? (
                filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="appointments-row"
                    onClick={() => setActiveAppointment(appointment)}
                    tabIndex={0}
                    onKeyDown={(event) => event.key === "Enter" && setActiveAppointment(appointment)}
                  >
                    <td>{appointment.doctor}</td>
                    <td>{appointment.specialization}</td>
                    <td>{appointment.time}</td>
                    <td>{formatDateDisplay(appointment.date)}</td>
                    <td className="row-arrow">→</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-results">
                    No results match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeAppointment && (
        <div className="modal-backdrop" onClick={() => setActiveAppointment(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{activeAppointment.doctor}</h2>
                <p className="modal-subtitle">{activeAppointment.specialization} consultation</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setActiveAppointment(null)}>
                &times;
              </button>
            </div>

            <div className="modal-details">
              <div className="modal-row">
                <div>
                  <h3>Time slot</h3>
                  <p>{activeAppointment.time}</p>
                </div>
                <div>
                  <h3>Date</h3>
                  <p>{formatDateDisplay(activeAppointment.date)}</p>
                </div>
              </div>

              <div className="modal-row">
                <div>
                  <h3>Location</h3>
                  <p>{activeAppointment.location}</p>
                </div>
                <div>
                  <h3>Rating</h3>
                  <p>{activeAppointment.rating} / 5 · {activeAppointment.reviews} reviews</p>
                </div>
              </div>

              <div className="modal-note">
                <h3>Notes</h3>
                <p>{activeAppointment.notes}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-secondary" onClick={() => setActiveAppointment(null)}>
                Close
              </button>
              <button type="button" className="modal-primary">
                Book appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
