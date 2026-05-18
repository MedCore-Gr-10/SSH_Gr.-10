import React, { useState, useEffect } from "react";
import GenericTable from "../../components/JSXcomponents/GenericTable.jsx";

export default function ManageSpecialization() {
  // Data and structural states
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states (handles both Create and Edit)
  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // Track item being edited
  const [isEditing, setIsEditing] = useState(false);

  // 1. Table structure mapping to match your schema keys
  const columns = [
    { header: "ID", key: "id" },
    { header: "Specialization Name", key: "specialization_name" },
  ];

  // 2. Fetch all specializations on component mount
  const fetchSpecializations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/specializations"); // Map to your API gateway setup
      const result = await response.json();

      if (result.success) {
        setSpecializations(result.data);
      } else {
        setError(result.message || "Failed to load specializations.");
      }
    } catch (err) {
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  // 3. Handle Form Submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setError("");
    const url = isEditing ? `/api/specializations/${selectedItem.id}` : "/api/specializations";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialization_name: inputValue }),
      });
      const result = await response.json();

      if (result.success) {
        // Refresh data array and clear forms
        await fetchSpecializations();
        resetForm();
      } else {
        setError(result.message || "An error occurred during submission.");
      }
    } catch (err) {
      setError("Failed to save changes. Check server connection.");
    }
  };

  // 4. Hook row action button clicks via onMoreClick
  const handleMoreClick = (item) => {
    setSelectedItem(item);
    setInputValue(item.specialization_name);
    setIsEditing(true);
  };

  // Helper to drop editing context
  const resetForm = () => {
    setInputValue("");
    setSelectedItem(null);
    setIsEditing(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Manage Specializations</h2>
      <p style={{ color: "gray" }}>View, add, and modify hospital department specializations.</p>

      {/* Error Notices Banner */}
      {error && (
        <div style={{ color: "red", backgroundColor: "#ffe6e6", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Dynamic Action Form (Creation & Modifying) */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="e.g. Cardiology, Pediatrics..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ padding: "8px 12px", flexGrow: 1, borderRadius: "4px", border: "1px solid #ccc" }}
          required
        />
        <button type="submit" style={{ padding: "8px 16px", backgroundColor: isEditing ? "#007bff" : "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {isEditing ? "Update Name" : "Create Specialization"}
        </button>
        {isEditing && (
          <button type="button" onClick={resetForm} style={{ padding: "8px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Cancel
          </button>
        )}
      </form>

      {/* Data Presentation Layer */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading specializations data...</p>
      ) : (
        <GenericTable 
          columns={columns} 
          data={specializations} 
          onMoreClick={handleMoreClick} 
        />
      )}
    </div>
  );
}