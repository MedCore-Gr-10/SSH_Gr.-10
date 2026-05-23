import React, { useState } from "react";
import "../../CSSpages/sidebar-pages/Allergies.css";

export default function Allergies() {
  const [allergyName, setAllergyName] = useState("");
  const [allergies, setAllergies] = useState([
    {
      id: "allergy-1",
      name: "Penicillin",
      type: "Medication",
      reaction: "Rash, itching",
      severity: "Moderate",
    },
    {
      id: "allergy-2",
      name: "Peanuts",
      type: "Food",
      reaction: "Swelling, trouble breathing",
      severity: "Severe",
    },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddAllergy = () => {
    const name = allergyName.trim();
    if (!name) {
      setError("Please enter an allergy name.");
      setSuccess("");
      return;
    }

    const newAllergy = {
      id: `allergy-${Date.now()}`,
      name,
      type: "Unknown",
      reaction: "Not specified",
      severity: "Mild",
    };

    setAllergies([newAllergy, ...allergies]);
    setAllergyName("");
    setError("");
    setSuccess("Allergy added successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="allergies-container">
      <div className="allergies-card">
        <h1 className="allergies-title">Allergies</h1>
        <p className="allergies-description">
          Add and track your allergies. Enter the allergy name, then tap the button to add it to your list.
        </p>

        <div className="allergy-entry-row">
          <input
            type="text"
            className="allergy-input"
            value={allergyName}
            onChange={(e) => setAllergyName(e.target.value)}
            placeholder="Type an allergy name"
          />
          <button className="add-allergy-button" onClick={handleAddAllergy}>
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
              </tr>
            </thead>
            <tbody>
              {allergies.map((allergy) => (
                <tr key={allergy.id}>
                  <td>{allergy.name}</td>
                  <td>{allergy.type}</td>
                  <td>{allergy.reaction}</td>
                  <td>{allergy.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
