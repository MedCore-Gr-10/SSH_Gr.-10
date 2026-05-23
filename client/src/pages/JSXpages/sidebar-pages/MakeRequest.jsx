import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import DirectorMakeRequest from "../../director/DirectorMakeRequest.jsx";
import "../../CSSpages/sidebar-pages/MakeRequest.css";

export default function MakeRequest() {
  const location = useLocation();
  const { user } = useAuth();
  const role = location.state?.role || user?.role;

  const [subject, setSubject] = useState("");
  const [staffMember, setStaffMember] = useState("");
  const [requestText, setRequestText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const staffOptions = [
    { id: "staff-1", name: "Nurse Ava Martinez" },
    { id: "staff-2", name: "Doctor Liam Patel" },
    { id: "staff-3", name: "Admin Zoe Lee" },
    { id: "staff-4", name: "Therapist Sam Carter" },
  ];

  if (role === "director") {
    return <DirectorMakeRequest />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!subject.trim()) {
      setError("Please enter a subject for your request.");
      return;
    }

    if (!staffMember) {
      setError("Please select a staff member.");
      return;
    }

    if (!requestText.trim()) {
      setError("Please describe your request in the text box.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess("Request submitted successfully!");
      setSubject("");
      setStaffMember("");
      setRequestText("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="make-request-container">
      <div className="make-request-card">
        <h1 className="make-request-title">Make a Request</h1>
        <p className="make-request-description">
          Select a staff member, give your request a subject, and describe the details in the box below.
        </p>

        <form onSubmit={handleSubmit} className="make-request-form">
          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Request Subject
            </label>
            <input
              id="subject"
              className="form-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Example: Appointment reschedule, test result question, medication refill"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-select" className="form-label">
              Select a Staff Member
            </label>
            <select
              id="staff-select"
              className="form-input"
              value={staffMember}
              onChange={(e) => setStaffMember(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Choose a staff member --</option>
              {staffOptions.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="request-text" className="form-label">
              Request Details
            </label>
            <textarea
              id="request-text"
              className="request-textarea"
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Type your request here, including any relevant dates, names, or details."
              rows={6}
              disabled={loading}
            />
            <p className="char-count">{requestText.length} / 600 characters</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
