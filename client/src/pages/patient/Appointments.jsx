import React, { useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  bookPatientAppointment,
  getPatientAppointmentFilters,
  searchPatientAppointments,
} from "../../services/patientAppointmentsApi";
import "./Appointments.css";

const visibleHospitalCount = 3;
const allSpecializationsLabel = "All specializations";
const allHospitalsFilter = "all";

const formatDateDisplay = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

export default function PatientAppointments() {
  const [hospitalStartIndex, setHospitalStartIndex] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(allHospitalsFilter);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(allSpecializationsLabel);
  const [appointments, setAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [bookingAppointmentId, setBookingAppointmentId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedHospital =
    selectedHospitalId === allHospitalsFilter
      ? null
      : hospitals.find((hospital) => hospital.id === Number(selectedHospitalId));
  const visibleHospitals = hospitals.slice(hospitalStartIndex, hospitalStartIndex + visibleHospitalCount);
  const canMoveHospitalsLeft = hospitalStartIndex > 0;
  const canMoveHospitalsRight = hospitalStartIndex + visibleHospitalCount < hospitals.length;

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoadingHospitals(true);
        const data = await getPatientAppointmentFilters();
        const availableHospitals = data.hospitals || [];

        setHospitals(availableHospitals);
        setSpecializations(data.specializations || []);
        setTimeSlots(data.timeSlots || []);
        setSelectedHospitalId(allHospitalsFilter);
        setHospitalStartIndex(0);
        setError("");
      } catch (err) {
        setError("Failed to load appointment filters: " + err.message);
      } finally {
        setLoadingHospitals(false);
      }
    };

    loadFilters();
  }, []);

  const loadAppointments = useCallback(async () => {
    if (!hospitals.length) {
      setAppointments([]);
      return;
    }

    try {
      setLoadingAppointments(true);
      const data = await searchPatientAppointments({
        hospitalId: selectedHospitalId === allHospitalsFilter ? "" : selectedHospitalId,
        doctorName: doctorSearch.trim(),
        specialization: selectedSpecialization === allSpecializationsLabel ? "" : selectedSpecialization,
        date: selectedDate,
        time: selectedTime,
      });

      setAppointments(data || []);
      setError("");
    } catch (err) {
      setError("Failed to load appointments: " + err.message);
    } finally {
      setLoadingAppointments(false);
    }
  }, [doctorSearch, hospitals.length, selectedDate, selectedHospitalId, selectedSpecialization, selectedTime]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handlePreviousHospitals = () => {
    setHospitalStartIndex((current) => Math.max(current - 1, 0));
  };

  const handleNextHospitals = () => {
    setHospitalStartIndex((current) =>
      Math.min(current + 1, Math.max(hospitals.length - visibleHospitalCount, 0))
    );
  };

  const handleBookAppointment = async () => {
    if (!activeAppointment) return;

    try {
      setBookingAppointmentId(activeAppointment.id);
      setSuccessMessage("");
      await bookPatientAppointment(activeAppointment.id);
      setAppointments((current) =>
        current.filter((appointment) => appointment.id !== activeAppointment.id)
      );
      setSuccessMessage("Appointment booked successfully.");
      setActiveAppointment(null);
      await loadAppointments();
    } catch (err) {
      setError("Failed to book appointment: " + err.message);
    } finally {
      setBookingAppointmentId(null);
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-card">
        <h1 className="appointments-title">Book an Appointment</h1>
        <p className="appointments-description">
          Search available appointments by doctor, specialization, date, time slot, and selected hospital.
        </p>

        {error && <div className="appointments-error">{error}</div>}
        {successMessage && <div className="appointments-success">{successMessage}</div>}

        <section className="hospital-picker">
          <div className="section-heading">
            <div>
              <h2>Filter by hospital</h2>
              <p>
                {selectedHospital
                  ? `${selectedHospital.name} appointments are shown.`
                  : hospitals.length
                    ? "Showing the list of appointments from your selection of hospitals."
                    : "Choose your preferred hospitals on your dashboard before booking appointments."}
              </p>
            </div>
            {hospitals.length > visibleHospitalCount && (
              <div className="hospital-controls">
                <button
                  type="button"
                  className="carousel-button"
                  onClick={handlePreviousHospitals}
                  disabled={!canMoveHospitalsLeft}
                  aria-label="Show previous hospitals"
                >
                  <FaChevronLeft />
                </button>
                <button
                  type="button"
                  className="carousel-button"
                  onClick={handleNextHospitals}
                  disabled={!canMoveHospitalsRight}
                  aria-label="Show next hospitals"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>

          <div className="hospital-grid">
            {loadingHospitals && <div className="appointments-empty-state">Loading hospitals...</div>}

            {!loadingHospitals && !hospitals.length && (
              <div className="appointments-empty-state">
                You have not been registered in any hospitals yet. Go to your dashboard and choose where you would like to receive care.
              </div>
            )}

            {!loadingHospitals && visibleHospitals.map((hospital) => (
              <button
                key={hospital.id}
                type="button"
                className={`hospital-card ${selectedHospitalId === String(hospital.id) ? "selected" : ""}`}
                onClick={() => setSelectedHospitalId(String(hospital.id))}
              >
                <span className="hospital-type">Hospital</span>
                <strong>{hospital.name}</strong>
                <span>{hospital.address || hospital.email}</span>
                <small>{hospital.email}</small>
              </button>
            ))}
          </div>

          {!loadingHospitals && hospitals.length > 1 && (
            <button
              type="button"
              className={`hospital-clear-filter ${selectedHospitalId === allHospitalsFilter ? "selected" : ""}`}
              onClick={() => setSelectedHospitalId(allHospitalsFilter)}
            >
              All selected hospitals
            </button>
          )}
        </section>

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
              <option value={allSpecializationsLabel}>{allSpecializationsLabel}</option>
              {specializations.map((specialty) => (
                <option key={specialty.id} value={specialty.name}>
                  {specialty.name}
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
                <option key={slot.value} value={slot.value}>
                  {slot.label}
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
                <th>Hospital</th>
                <th>Specialization</th>
                <th>Time Slot</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loadingAppointments && (
                <tr>
                  <td colSpan={6} className="no-results">
                    Loading appointments...
                  </td>
                </tr>
              )}

              {!loadingAppointments && appointments.length ? (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="appointments-row"
                    onClick={() => setActiveAppointment(appointment)}
                    tabIndex={0}
                    onKeyDown={(event) => event.key === "Enter" && setActiveAppointment(appointment)}
                  >
                    <td>{appointment.doctor}</td>
                    <td>{appointment.hospitalName}</td>
                    <td>{appointment.specialization}</td>
                    <td>{appointment.time}</td>
                    <td>{formatDateDisplay(appointment.date)}</td>
                    <td className="row-arrow">-&gt;</td>
                  </tr>
                ))
              ) : null}

              {!loadingAppointments && !appointments.length && (
                <tr>
                  <td colSpan={6} className="no-results">
                    {hospitals.length
                      ? "No available appointments match your filters."
                      : "No appointments are shown until you select hospitals on your dashboard."}
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
                  <h3>Hospital</h3>
                  <p>{activeAppointment.hospitalName}</p>
                </div>
              </div>

            </div>

            <div className="modal-actions">
              <button type="button" className="modal-secondary" onClick={() => setActiveAppointment(null)}>
                Close
              </button>
              <button
                type="button"
                className="modal-primary"
                onClick={handleBookAppointment}
                disabled={bookingAppointmentId === activeAppointment.id}
              >
                {bookingAppointmentId === activeAppointment.id ? "Booking..." : "Book appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
