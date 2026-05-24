import React, { useEffect, useState } from "react";
import "../../CSSpages/patient/Allergies.css";

const allergyTypes = ["Food", "Medication", "Environmental", "Insect", "Latex", "Other"];
const severityLevels = ["Mild", "Moderate", "Severe", "Life-threatening"];

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

export default function Allergies() {
  const [allergyName, setAllergyName] = useState("");
  const [allergyType, setAllergyType] = useState(allergyTypes[0]);
  const [reactionSymptoms, setReactionSymptoms] = useState("");
  const [severity, setSeverity] = useState(severityLevels[0]);
  const [allergies, setAllergies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAllergies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patient/allergies", {
        headers: getHeaders(),
      });
      const data = await readResponse(response);

      setAllergies(data);
      setError("");
    } catch (err) {
      setError("Failed to load allergies: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllergies();
  }, []);

  const openModal = () => {
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setAllergyName("");
    setAllergyType(allergyTypes[0]);
    setReactionSymptoms("");
    setSeverity(severityLevels[0]);
    setError("");
  };

  const handleAddAllergy = async (event) => {
    event.preventDefault();
    const name = allergyName.trim();
    const reaction = reactionSymptoms.trim();

    if (!name || !allergyType || !reaction || !severity) {
      setError("Please fill in all allergy fields.");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/patient/allergies", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name,
          type: allergyType,
          reaction,
          severity,
        }),
      });

      await readResponse(response);
      await fetchAllergies();
      setError("");
      setSuccess("Allergy added successfully!");
      closeModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add allergy: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAllergy = async (allergyId) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/patient/allergies/${allergyId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      await readResponse(response);
      await fetchAllergies();
      setError("");
      setSuccess("Allergy removed successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to remove allergy: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="allergies-container">
      <div className="allergies-card">
        <h1 className="allergies-title">Allergies</h1>
        <p className="allergies-description">
          Add and track your allergies, reaction symptoms, and severity.
        </p>

        <div className="allergy-entry-row">
          <button type="button" className="add-allergy-button" onClick={openModal}>
            + Add an Allergy
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="allergies-table-wrapper">
          <table className="allergies-table">
            <thead>
              <tr>
                <th>Allergy name</th>
                <th>Allergy type</th>
                <th>Reaction symptoms</th>
                <th>Severity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="no-results">
                    Loading allergies...
                  </td>
                </tr>
              )}

              {!loading && allergies.length ? (
                allergies.map((allergy) => (
                  <tr key={allergy.id}>
                    <td>{allergy.name}</td>
                    <td>{allergy.type}</td>
                    <td>{allergy.reaction}</td>
                    <td>{allergy.severity}</td>
                    <td>
                      <button
                        type="button"
                        className="remove-allergy-button"
                        onClick={() => handleRemoveAllergy(allergy.id)}
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : !loading && (
                <tr>
                  <td colSpan={5} className="no-results">
                    No allergies added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Allergy</h2>
              <button type="button" className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form className="modal-form" onSubmit={handleAddAllergy}>
              <div className="form-group">
                <label htmlFor="allergy-name" className="form-label">
                  Allergy name
                </label>
                <input
                  id="allergy-name"
                  className="form-input"
                  value={allergyName}
                  onChange={(event) => setAllergyName(event.target.value)}
                  placeholder="Penicillin, peanuts, pollen"
                />
              </div>

              <div className="modal-row">
                <div className="form-group">
                  <label htmlFor="allergy-type" className="form-label">
                    Allergy type
                  </label>
                  <select
                    id="allergy-type"
                    className="form-input"
                    value={allergyType}
                    onChange={(event) => setAllergyType(event.target.value)}
                  >
                    {allergyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="allergy-severity" className="form-label">
                    Severity
                  </label>
                  <select
                    id="allergy-severity"
                    className="form-input"
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value)}
                  >
                    {severityLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reaction-symptoms" className="form-label">
                  Reaction symptoms
                </label>
                <textarea
                  id="reaction-symptoms"
                  className="form-textarea"
                  value={reactionSymptoms}
                  onChange={(event) => setReactionSymptoms(event.target.value)}
                  placeholder="Rash, swelling, nausea, difficulty breathing"
                  rows={4}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="modal-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary" disabled={saving}>
                  {saving ? "Adding..." : "Add Allergy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
