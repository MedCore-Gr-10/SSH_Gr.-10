import React, { useState } from "react";
import "../../CSSpages/sidebar-pages/EmergencyContacts.css";

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([
    {
      id: "contact-1",
      firstName: "Lina",
      lastName: "Garcia",
      email: "lina.garcia@example.com",
      relationship: "Spouse",
      phoneNumber: "+1 555 123 4567",
      idNumber: "A123456789",
    },
    {
      id: "contact-2",
      firstName: "Marcus",
      lastName: "Jones",
      email: "marcus.jones@example.com",
      relationship: "Friend",
      phoneNumber: "+1 555 987 6543",
      idNumber: "B987654321",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [currentContactId, setCurrentContactId] = useState("contact-1");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleAddContact = (event) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !relationship.trim() || !phoneNumber.trim() || !idNumber.trim()) {
      setError("Please fill in all emergency contact fields.");
      return;
    }

    const newContact = {
      id: `contact-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      relationship: relationship.trim(),
      phoneNumber: phoneNumber.trim(),
      idNumber: idNumber.trim(),
    };

    setContacts([newContact, ...contacts]);
    if (!currentContactId) {
      setCurrentContactId(newContact.id);
    }
    setSuccess("Emergency contact added successfully!");
    closeModal();
  };

  const openRemoveConfirm = (contact) => {
    setPendingRemoval(contact);
    setError("");
    setSuccess("");
  };

  const cancelRemoval = () => {
    setPendingRemoval(null);
  };

  const confirmRemoval = () => {
    if (!pendingRemoval) return;
    setContacts((current) => {
      const remainingContacts = current.filter((contact) => contact.id !== pendingRemoval.id);
      if (currentContactId === pendingRemoval.id) {
        setCurrentContactId(remainingContacts[0]?.id || "");
      }
      return remainingContacts;
    });
    setSuccess("Emergency contact removed successfully.");
    setPendingRemoval(null);
  };

  const selectCurrentContact = (contact) => {
    setCurrentContactId(contact.id);
    setSuccess(`${contact.firstName} ${contact.lastName} is now your current emergency contact.`);
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
              {contacts.map((contact) => {
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
                        >
                          Select
                        </button>
                      )}
                    </td>
                    <td>
                      <button type="button" className="remove-button" onClick={() => openRemoveConfirm(contact)}>
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
                <button type="button" className="modal-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary">
                  Add Contact
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
              <button type="button" className="modal-secondary" onClick={cancelRemoval}>
                No, keep contact
              </button>
              <button type="button" className="modal-primary" onClick={confirmRemoval}>
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
