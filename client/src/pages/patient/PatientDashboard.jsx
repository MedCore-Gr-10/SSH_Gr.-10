import React from "react";
import { useNavigate } from "react-router-dom";
import "./PatientDashboard.css";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const latestRecord = {
    title: "Your latest record",
    description: "View the most recent visit and follow-up notes.",
  };

  const topHospitals = [
    "City Care",
    "Green Valley",
    "Lakeside",
    "Riverbend",
    "Northside",
  ];

  const topDoctor = {
    name: "Dr. Sarah Patel",
    specialty: "Family Medicine",
    rating: 4.9,
    reviews: 220,
  };

  const currentEmergencyContact = {
    name: "Ava Martinez",
    relationship: "Spouse",
  };

  const upcomingSummary = {
    title: "Daily wellness check",
    status: "Next review in 2 days",
    detail: "Stay hydrated and rest your eyes after screen time.",
  };

  return (
    <div className="patient-dashboard-container">
      <div className="patient-dashboard-welcome">
        <div>
          <p className="welcome-subtitle">Welcome back</p>
          <h1 className="welcome-title">Good afternoon, Patient</h1>
          <p className="welcome-copy">
            Here’s a quick overview of your most important records, contacts, and care providers.
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
          <span className="widget-arrow">›</span>
        </button>

        <div className="widget-card hospitals-widget">
          <p className="widget-label">Highest Rated Hospitals</p>
          <div className="hospital-list">
            {topHospitals.map((hospital) => (
              <div key={hospital} className="hospital-pill">
                <div className="hospital-icon">{hospital.split(" ").map((word) => word[0]).join("")}</div>
                <div>
                  <p className="hospital-name">{hospital}</p>
                  <p className="hospital-meta">4.8/5 average</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget-card doctor-widget">
          <p className="widget-label">Highest Rated Doctor</p>
          <div className="doctor-summary">
            <div className="circle-icon">SP</div>
            <div>
              <h3>{topDoctor.name}</h3>
              <p className="doctor-meta">{topDoctor.specialty}</p>
              <p className="doctor-rating">{topDoctor.rating}/5 · {topDoctor.reviews} reviews</p>
            </div>
          </div>
        </div>

        <div className="widget-card contact-widget">
          <p className="widget-label">Your current selected emergency contact</p>
          <div className="contact-details">
            <div className="circle-icon small">{currentEmergencyContact.name.split(" ").map((word) => word[0]).join("")}</div>
            <div>
              <h3>{currentEmergencyContact.name}</h3>
              <p className="contact-meta">{currentEmergencyContact.relationship}</p>
            </div>
          </div>
        </div>

        <div className="widget-card upcoming-widget">
          <p className="widget-label">Wellness summary</p>
          <div className="upcoming-summary">
            <h3>{upcomingSummary.title}</h3>
            <p className="widget-copy">{upcomingSummary.detail}</p>
            <p className="upcoming-status">{upcomingSummary.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
