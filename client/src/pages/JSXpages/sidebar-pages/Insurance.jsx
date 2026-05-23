import React, { useEffect, useState } from "react";
import "../../CSSpages/sidebar-pages/Insurance.css";

const initialFormValues = {
  companyName: "",
  supportNumber: "",
  email: "",
  policyNumber: "",
  coveragePercent: "",
  startDate: "",
  endDate: "",
};

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const readResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  }

  return payload.data ?? payload;
};

const isPastDate = (value) => {
  if (!value) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  return date < today;
};

const getTodayInputValue = () => new Date().toISOString().slice(0, 10);

export default function Insurance() {
  const [insurance, setInsurance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchInsurance = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patient/insurance", {
        headers: getHeaders(),
      });
      const data = await readResponse(response);

      setInsurance(data);
      setError("");
    } catch (err) {
      setError("Failed to load insurance: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurance();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const openModalForCreate = () => {
    setFormValues(initialFormValues);
    setShowModal(true);
    setMessage("");
    setError("");
  };

  const openModalForEdit = () => {
    setFormValues({ ...insurance });
    setShowModal(true);
    setMessage("");
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    if (!insurance) {
      setFormValues(initialFormValues);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (isPastDate(formValues.endDate)) {
      setError("End date cannot be in the past. Please enter an active insurance policy.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/patient/insurance", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(formValues),
      });

      const data = await readResponse(response);
      setInsurance(data);
      setShowModal(false);
      setError("");
      setMessage("Insurance details saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to save insurance: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveInsurance = async () => {
    if (!insurance?.id) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/patient/insurance/${insurance.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      await readResponse(response);
      setInsurance(null);
      setFormValues(initialFormValues);
      setError("");
      setMessage("Insurance removed successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to remove insurance: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const endDateIsExpired = isPastDate(formValues.endDate);

  return (
    <div className="insurance-container">
      <div className="insurance-card">
        <h1 className="insurance-title">Insurance Provider Information</h1>
        <p className="insurance-description">
          Manage your insurance provider and policy details. Your identity is linked from your patient profile.
        </p>

        {message && <div className="success-message">{message}</div>}
        {error && !showModal && <div className="error-message">{error}</div>}

        {loading && (
          <div className="empty-state">
            <p className="empty-state-text">Loading insurance details...</p>
          </div>
        )}

        {!loading && !insurance && (
          <div className="empty-state">
            <p className="empty-state-text">You do not have insurance set up yet. Add your provider details to continue.</p>
            <button type="button" className="primary-button" onClick={openModalForCreate}>
              Set up insurance
            </button>
          </div>
        )}

        {!loading && insurance && (
          <div className="insurance-summary">
            {insurance.isExpired && (
              <div className="expired-state">
                This insurance policy has expired. You can update the policy details or remove it from your profile.
              </div>
            )}

            <div className="insurance-summary-row">
              <div>
                <h3>Provider details</h3>
                <p><strong>Company:</strong> {insurance.companyName || "-"}</p>
                <p><strong>Support:</strong> {insurance.supportNumber || "-"}</p>
                <p><strong>Email:</strong> {insurance.email || "-"}</p>
              </div>
              <div>
                <h3>Policy details</h3>
                <p><strong>Policy number:</strong> {insurance.policyNumber || "-"}</p>
                <p><strong>Coverage:</strong> {insurance.coveragePercent ? `${insurance.coveragePercent}%` : "-"}</p>
                <p><strong>Start date:</strong> {insurance.startDate || "-"}</p>
                <p><strong>End date:</strong> {insurance.endDate || "-"}</p>
              </div>
            </div>
            <button type="button" className="primary-button" onClick={openModalForEdit}>
              {insurance.isExpired ? "Update insurance" : "Edit insurance"}
            </button>
            <button type="button" className="danger-button" onClick={handleRemoveInsurance} disabled={saving}>
              {saving ? "Removing..." : "Remove insurance"}
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{insurance ? "Edit insurance details" : "Set up insurance"}</h2>
                <p className="section-note">
                  Enter your insurance provider and policy information.
                </p>
              </div>
              <button type="button" className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form className="insurance-form" onSubmit={handleSave}>
              <div className="section-card">
                <h3>Provider and policy details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="companyName" className="form-label">Insurance company name</label>
                    <input
                      id="companyName"
                      name="companyName"
                      className="form-input"
                      value={formValues.companyName}
                      onChange={handleChange}
                      placeholder="Blue Cross, Aetna, UnitedHealthcare"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="supportNumber" className="form-label">Customer support number</label>
                    <input
                      id="supportNumber"
                      name="supportNumber"
                      className="form-input"
                      value={formValues.supportNumber}
                      onChange={handleChange}
                      placeholder="(800) 123-4567"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      value={formValues.email}
                      onChange={handleChange}
                      placeholder="support@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="policyNumber" className="form-label">Policy number</label>
                    <input
                      id="policyNumber"
                      name="policyNumber"
                      className="form-input"
                      value={formValues.policyNumber}
                      onChange={handleChange}
                      placeholder="POL-123456789"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="coveragePercent" className="form-label">Coverage percent</label>
                    <input
                      id="coveragePercent"
                      name="coveragePercent"
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={formValues.coveragePercent}
                      onChange={handleChange}
                      placeholder="80"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="startDate" className="form-label">Start date</label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      className="form-input"
                      value={formValues.startDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate" className="form-label">End date</label>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      className="form-input"
                      value={formValues.endDate}
                      onChange={handleChange}
                      min={getTodayInputValue()}
                    />
                    {endDateIsExpired && (
                      <p className="field-error">End date cannot be in the past.</p>
                    )}
                  </div>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="modal-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary" disabled={saving || endDateIsExpired}>
                  {saving ? "Saving..." : insurance ? "Save changes" : "Save insurance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
