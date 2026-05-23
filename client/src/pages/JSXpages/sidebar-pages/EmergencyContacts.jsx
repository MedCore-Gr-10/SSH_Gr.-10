import React, { useEffect, useState } from "react";
import "../../CSSpages/sidebar-pages/EmergencyContacts.css";

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

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [currentContactId, setCurrentContactId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patient/emergency-contacts", {
        headers: getHeaders(),
      });
      const data = await readResponse(response);

      setContacts(data.contacts || []);
      setCurrentContactId(data.currentContactId || "");
      setError("");
    } catch (err) {
      setError("Failed to load emergency contacts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const openModal = () => {
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setRelationship("");
    setPhoneNumber("");
    setIdNumber("");
    setError("");
  };

  const handleAddContact = async (event) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !relationship.trim() || !phoneNumber.trim() || !idNumber.trim()) {
      setError("Please fill in all emergency contact fields.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/patient/emergency-contacts", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          relationship: relationship.trim(),
          phoneNumber: phoneNumber.trim(),
          idNumber: idNumber.trim(),
        }),
      });

      await readResponse(response);
      await fetchContacts();
      setSuccess("Emergency contact added successfully!");
      closeModal();
    } catch (err) {
      setError("Failed to add emergency contact: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const openRemoveConfirm = (contact) => {
    setPendingRemoval(contact);
    setError("");
    setSuccess("");
  };

  const cancelRemoval = () => {
    setPendingRemoval(null);
  };

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/patient/emergency-contacts/${pendingRemoval.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      await readResponse(response);
      await fetchContacts();
      setSuccess("Emergency contact removed successfully.");
      setPendingRemoval(null);
    } catch (err) {
      setError("Failed to remove emergency contact: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectCurrentContact = async (contact) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/patient/emergency-contacts/${contact.id}/current`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      const data = await readResponse(response);
      setCurrentContactId(data.currentContactId);
      setSuccess(`${contact.firstName} ${contact.lastName} is now your current emergency contact.`);
    } catch (err) {
      setError("Failed to update current emergency contact: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="emergency-contacts-container">
      <div className="emergency-contacts-card">
        <div className="emergency-contacts-header">
          <div>
            <h1 className="emergency-contacts-title">Emergency Contacts</h1>
            <p className="emergency-contacts-description">
              Add the people who should be contacted first in case of emergency.
            </p>
          </div>
          <button type="button" className="add-contact-button" onClick={openModal}>
            + Add an Emergency Contact
          </button>
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && !showModal && <div className="error-message">{error}</div>}

        <div className="contacts-table-wrapper">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>First name</th>
                <th>Last name</th>
                <th>Email</th>
                <th>Phone number</th>
                <th>Current contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="no-results">
                    Loading emergency contacts...
                  </td>
                </tr>
              )}

              {!loading && !contacts.length && (
                <tr>
                  <td colSpan={6} className="no-results">
                    No emergency contacts yet.
                  </td>
                </tr>
              )}

              {!loading && contacts.map((contact) => {
                const isCurrentContact = contact.id === currentContactId;

                return (
                  <tr key={contact.id} className={isCurrentContact ? "current-contact-row" : ""}>
                    <td>{contact.firstName}</td>
                    <td>{contact.lastName}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phoneNumber}</td>
                    <td>
                      {isCurrentContact ? (
                        <span className="current-contact-badge">Current</span>
                      ) : (
                        <button
                          type="button"
                          className="select-current-button"
                          onClick={() => selectCurrentContact(contact)}
                          disabled={saving}
                        >
                          Select
                        </button>
                      )}
                    </td>
                    <td>
                      <button type="button" className="remove-button" onClick={() => openRemoveConfirm(contact)} disabled={saving}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Emergency Contact</h2>
              <button type="button" className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddContact} className="modal-form">
              <div className="modal-row">
                <div className="form-group">
                  <label htmlFor="contact-first-name" className="form-label">
                    First name
                  </label>
                  <input
                    id="contact-first-name"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-last-name" className="form-label">
                    Last name
                  </label>
                  <input
                    id="contact-last-name"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-connection" className="form-label">
                  Connection
                </label>
                <input
                  id="contact-connection"
                  className="form-input"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="Spouse, family relative, friend, etc."
                />
              </div>

              <div className="modal-row">
                <div className="form-group">
                  <label htmlFor="contact-phone" className="form-label">
                    Phone number
                  </label>
                  <input
                    id="contact-phone"
                    className="form-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 555 123 4567"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-id" className="form-label">
                    ID number
                  </label>
                  <input
                    id="contact-id"
                    className="form-input"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="National ID or passport number"
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="modal-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary" disabled={saving}>
                  {saving ? "Adding..." : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingRemoval && (
        <div className="modal-backdrop" onClick={cancelRemoval}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Remove emergency contact</h2>
              <button type="button" className="modal-close" onClick={cancelRemoval}>
                ×
              </button>
            </div>

            <div className="confirmation-copy">
              <p>
                Are you sure you want to remove <strong>{pendingRemoval.firstName} {pendingRemoval.lastName}</strong> from your emergency contacts?
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-secondary" onClick={cancelRemoval} disabled={saving}>
                No, keep contact
              </button>
              <button type="button" className="modal-primary" onClick={confirmRemoval} disabled={saving}>
                {saving ? "Removing..." : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
