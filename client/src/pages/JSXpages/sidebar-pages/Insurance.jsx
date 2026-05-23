import React, { useState } from "react";
import "../../CSSpages/sidebar-pages/Insurance.css";

const initialFormValues = {
  companyName: "",
  supportNumber: "",
  email: "",
  website: "",
  address: "",
  policyHolderName: "",
  policyHolderRelationship: "",
  policyHolderDob: "",
  policyHolderId: "",
};

export default function Insurance() {
  const [insurance, setInsurance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const openModalForCreate = () => {
    setFormValues(initialFormValues);
    setIsEditing(false);
    setShowModal(true);
    setMessage("");
  };

  const openModalForEdit = () => {
    setFormValues({ ...insurance });
    setIsEditing(true);
    setShowModal(true);
    setMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    if (!insurance) {
      setFormValues(initialFormValues);
    }
  };

  const handleSave = (event) => {
    event.preventDefault();
    setInsurance({ ...formValues });
    setShowModal(false);
    setMessage("Insurance details saved successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="insurance-container">
      <div className="insurance-card">
        <h1 className="insurance-title">Insurance Provider Information</h1>
        <p className="insurance-description">
          Manage your insurance provider and policy holder details. If you have not set up insurance yet, open the setup modal and save your policy information.
        </p>

        {message && <div className="success-message">{message}</div>}

        {!insurance && (
          <div className="empty-state">
            <p className="empty-state-text">You do not have insurance set up yet. Add your provider details to continue.</p>
            <button type="button" className="primary-button" onClick={openModalForCreate}>
              Set up insurance
            </button>
          </div>
        )}

        {insurance && (
          <div className="insurance-summary">
            <div className="insurance-summary-row">
              <div>
                <h3>Provider details</h3>
                <p><strong>Company:</strong> {insurance.companyName || "—"}</p>
                <p><strong>Support:</strong> {insurance.supportNumber || "—"}</p>
                <p><strong>Email:</strong> {insurance.email || "—"}</p>
                <p><strong>Website:</strong> {insurance.website || "—"}</p>
                <p><strong>Address:</strong> {insurance.address || "—"}</p>
              </div>
              <div>
                <h3>Policy holder</h3>
                <p><strong>Name:</strong> {insurance.policyHolderName || "—"}</p>
                <p><strong>Relationship:</strong> {insurance.policyHolderRelationship || "—"}</p>
                <p><strong>DOB:</strong> {insurance.policyHolderDob || "—"}</p>
                <p><strong>ID:</strong> {insurance.policyHolderId || "—"}</p>
              </div>
            </div>
            <button type="button" className="primary-button" onClick={openModalForEdit}>
              Edit insurance
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
                  Enter your insurance provider and policy holder information.
                </p>
              </div>
              <button type="button" className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form className="insurance-form" onSubmit={handleSave}>
              <div className="section-card">
                <h3>Important provider details</h3>
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
                    <label htmlFor="website" className="form-label">Website</label>
                    <input
                      id="website"
                      name="website"
                      className="form-input"
                      value={formValues.website}
                      onChange={handleChange}
                      placeholder="www.example.com"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      id="address"
                      name="address"
                      className="form-input"
                      value={formValues.address}
                      onChange={handleChange}
                      placeholder="123 Insurance Ave, City, State"
                    />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <h3>Policy Holder Information</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="policyHolderName" className="form-label">Policy holder full name</label>
                    <input
                      id="policyHolderName"
                      name="policyHolderName"
                      className="form-input"
                      value={formValues.policyHolderName}
                      onChange={handleChange}
                      placeholder="Parent / Spouse"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="policyHolderRelationship" className="form-label">Relationship to patient</label>
                    <input
                      id="policyHolderRelationship"
                      name="policyHolderRelationship"
                      className="form-input"
                      value={formValues.policyHolderRelationship}
                      onChange={handleChange}
                      placeholder="Parent, spouse, guardian"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="policyHolderDob" className="form-label">Date of birth</label>
                    <input
                      id="policyHolderDob"
                      name="policyHolderDob"
                      type="date"
                      className="form-input"
                      value={formValues.policyHolderDob}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="policyHolderId" className="form-label">Policy holder ID</label>
                    <input
                      id="policyHolderId"
                      name="policyHolderId"
                      className="form-input"
                      value={formValues.policyHolderId}
                      onChange={handleChange}
                      placeholder="Policy number or member ID"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary">
                  {insurance ? "Save changes" : "Save insurance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
