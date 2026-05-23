import React, { useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getPatientEmergencyContacts } from "../../services/patientEmergencyContactsApi";
import { getPatientHospitals, updatePatientHospitals } from "../../services/patientHospitalsApi";
import "./PatientDashboard.css";

const visibleHospitalCount = 3;

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [hospitalStartIndex, setHospitalStartIndex] = useState(0);
  const [careHospitals, setCareHospitals] = useState([]);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [hospitalSaving, setHospitalSaving] = useState(false);
  const [hospitalError, setHospitalError] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [currentContactId, setCurrentContactId] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");

  const latestRecord = {
    title: "Your latest record",
    description: "View the most recent visit and follow-up notes.",
  };

  const visibleHospitals = careHospitals.slice(
    hospitalStartIndex,
    hospitalStartIndex + visibleHospitalCount
  );
  const canMoveHospitalsLeft = hospitalStartIndex > 0;
  const canMoveHospitalsRight = hospitalStartIndex + visibleHospitalCount < careHospitals.length;
  const currentEmergencyContact = useMemo(
    () => emergencyContacts.find((contact) => contact.id === currentContactId) || null,
    [currentContactId, emergencyContacts]
  );

  useEffect(() => {
    const loadEmergencyContacts = async () => {
      try {
        setContactLoading(true);
        const data = await getPatientEmergencyContacts();
        setEmergencyContacts(data.contacts || []);
        setCurrentContactId(data.currentContactId || "");
        setContactError("");
      } catch (err) {
        setContactError("Unable to load emergency contact.");
      } finally {
        setContactLoading(false);
      }
    };

    loadEmergencyContacts();
  }, []);

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setHospitalLoading(true);
        const data = await getPatientHospitals();
        setCareHospitals(data.hospitals || []);
        setSelectedHospitalIds(data.selectedHospitalIds || []);
        setHospitalStartIndex(0);
        setHospitalError("");
      } catch (err) {
        setHospitalError("Unable to load hospitals.");
      } finally {
        setHospitalLoading(false);
      }
    };

    loadHospitals();
  }, []);

  const handlePreviousHospitals = () => {
    setHospitalStartIndex((current) => Math.max(current - 1, 0));
  };

  const handleNextHospitals = () => {
    setHospitalStartIndex((current) =>
      Math.min(current + 1, Math.max(careHospitals.length - visibleHospitalCount, 0))
    );
  };

  const toggleHospitalSelection = async (hospitalId) => {
    const nextSelectedHospitalIds = selectedHospitalIds.includes(hospitalId)
      ? selectedHospitalIds.filter((id) => id !== hospitalId)
      : [...selectedHospitalIds, hospitalId];

    setSelectedHospitalIds(nextSelectedHospitalIds);
    setHospitalSaving(true);
    setHospitalError("");

    try {
      const data = await updatePatientHospitals(nextSelectedHospitalIds);
      setSelectedHospitalIds(data.selectedHospitalIds || []);
    } catch (err) {
      setHospitalError("Unable to update selected hospitals.");
      setSelectedHospitalIds(selectedHospitalIds);
    } finally {
      setHospitalSaving(false);
    }
  };

  return (
    <div className="patient-dashboard-container">
      <div className="patient-dashboard-welcome">
        <div>
          <p className="welcome-subtitle">Welcome back</p>
          <h1 className="welcome-title">Good afternoon, Patient</h1>
          <p className="welcome-copy">
            Here's a quick overview of your most important records, contacts, and care providers.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <button
          type="button"
          className="widget-card latest-record-card"
          onClick={() => navigate("/main/records")}
        >
          <div>
            <p className="widget-label">{latestRecord.title}</p>
            <h2 className="widget-heading">Tap to view your most recent visit</h2>
            <p className="widget-copy">{latestRecord.description}</p>
          </div>
          <span className="widget-arrow">&rsaquo;</span>
        </button>

        <div className="widget-card contact-widget">
          <p className="widget-label">Your current selected emergency contact</p>

          {contactLoading && <p className="contact-fallback-copy">Loading emergency contact...</p>}

          {!contactLoading && currentEmergencyContact && (
            <div className="contact-details">
              <div className="circle-icon small">
                {`${currentEmergencyContact.firstName || ""} ${currentEmergencyContact.lastName || ""}`
                  .trim()
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </div>
              <div>
                <h3>{currentEmergencyContact.firstName} {currentEmergencyContact.lastName}</h3>
                <p className="contact-meta">{currentEmergencyContact.relationship || "Emergency contact"}</p>
                <p className="contact-meta">{currentEmergencyContact.phoneNumber || currentEmergencyContact.email}</p>
              </div>
            </div>
          )}

          {!contactLoading && !currentEmergencyContact && (
            <div className="contact-fallback">
              <p className="contact-fallback-copy">
                {contactError || "You do not have an emergency contact set!"}
              </p>
              <button
                type="button"
                className="contact-action-button"
                onClick={() => navigate("/main/emergency-contacts")}
              >
                Go to Emergency Contacts
              </button>
            </div>
          )}
        </div>

        <div className="widget-card hospitals-widget">
          <div className="hospital-widget-header">
            <div>
              <p className="widget-label">Care hospitals</p>
              <h2 className="widget-subheading">Select which hospitals you would like to receive care from</h2>
            </div>
            <div className="hospital-carousel-controls">
              <button
                type="button"
                className="hospital-carousel-button"
                onClick={handlePreviousHospitals}
                disabled={!canMoveHospitalsLeft}
                aria-label="Show previous hospitals"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className="hospital-carousel-button"
                onClick={handleNextHospitals}
                disabled={!canMoveHospitalsRight}
                aria-label="Show next hospitals"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="hospital-list">
            {hospitalLoading && (
              <div className="hospital-empty-state">Loading hospitals...</div>
            )}

            {!hospitalLoading && hospitalError && (
              <div className="hospital-empty-state">{hospitalError}</div>
            )}

            {!hospitalLoading && !hospitalError && !visibleHospitals.length && (
              <div className="hospital-empty-state">No hospitals are available yet.</div>
            )}

            {!hospitalLoading && !hospitalError && visibleHospitals.map((hospital) => {
              const isSelected = selectedHospitalIds.includes(hospital.id);

              return (
                <button
                  type="button"
                  key={hospital.id}
                  className={`hospital-pill ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleHospitalSelection(hospital.id)}
                  disabled={hospitalSaving}
                >
                  <div className="hospital-icon">
                    {(hospital.name || "H").split(" ").map((word) => word[0]).join("")}
                  </div>
                  <div>
                    <p className="hospital-name">{hospital.name}</p>
                    <p className="hospital-meta">{hospital.address || hospital.email || "Hospital"}</p>
                  </div>
                  <span className="hospital-select-state">{isSelected ? "Selected" : "Select"}</span>
                </button>
              );
            })}
          </div>

          <div className="selected-hospitals-summary">
            {selectedHospitalIds.length ? (
              <p>{selectedHospitalIds.length} hospital{selectedHospitalIds.length === 1 ? "" : "s"} selected</p>
            ) : (
              <p>No hospitals selected yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
