import React, { useState, useEffect } from "react";
import GenericTable from "../../components/common/GenericTable.jsx";
import "./ManageSpecializations.css"; 
import { superuserFetch } from "../../services/superuserApi.js";

export default function ManageSpecialization() {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const columns = [
    { header: "ID", key: "id" },
    { header: "Specialization Name", key: "specialization_name" },
    { header: "Total Doctors Assigned", key: "total_doctors" }, 
  ];

  const fetchSpecializations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await superuserFetch("/specializations");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setError("");
    const url = isEditing ? `/specializations/${selectedItem.id}` : "/specializations";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await superuserFetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialization_name: inputValue }),
      });
      const result = await response.json();

      if (result.success) {
        await fetchSpecializations();
        resetForm();
      } else {
        setError(result.message || "An error occurred during submission.");
      }
    } catch (err) {
      setError("Failed to save changes. Check server connection.");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the specialization "${selectedItem.specialization_name}"?`
    );
    if (!confirmDelete) return;

    setError("");
    try {
      const response = await superuserFetch(`/specializations/${selectedItem.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        await fetchSpecializations();
        resetForm();
      } else {
        setError(result.message || "Failed to delete specialization.");
      }
    } catch (err) {
      setError("Failed to delete. Check server connection.");
    }
  };


  const handleMoreClick = (item) => {
    setSelectedItem(item);
    setInputValue(item.specialization_name);
    setIsEditing(true);
  };

  const resetForm = () => {
    setInputValue("");
    setSelectedItem(null);
    setIsEditing(false);
  };

  const filteredSpecializations = specializations.filter((spec) =>
    spec.specialization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.id.toString().includes(searchTerm)
  );

  return (
    <div className="page-container">  
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Manage Specializations</h2>
          <p className="page-subtitle">View, add, and modify hospital department specializations.</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* 🚀 FORMË AKSIONI DHE SEKSIONI I FILTRIMIT */}
      <div className="controls-wrapper">
        <form onSubmit={handleSubmit} className={`form-container ${isEditing ? "editing" : ""}`}>
          <div className="input-group">
            <label className="input-label">
              {isEditing ? `Editing Specialization (ID: ${selectedItem?.id})` : "Create New Specialization"}
            </label>
            <input
              type="text"
              placeholder="e.g. Cardiology, Pediatrics..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="main-input"
              required
            />
          </div>

          <div className="button-group">
            <button type="submit" className={`btn ${isEditing ? "btn-primary" : "btn-success"}`}>
              {isEditing ? "Update Name" : "+  Create Specialization"}
            </button>
            
            {isEditing && (
              <>
                
                <button type="button" onClick={handleDelete} className="btn btn-danger">
                  Delete
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>

        {/* 🔍 INPUT-I I REZULTATEVE TË KËRKIMIT */}
        <div className="search-bar-container">
          <span className="entries-counter">
            Showing {filteredSpecializations.length} of {specializations.length} entries
          </span>
          <input
            type="text"
            placeholder="🔍 Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Tabela e të Dhënave */}
      {loading ? (
        <p className="loading-text">Loading specializations data...</p>
      ) : filteredSpecializations.length === 0 ? (
        <div className="no-results-card">
          <p className="no-results-title">No results found</p>
          <p className="no-results-desc">We couldn't find any specialization matching "{searchTerm}".</p>
        </div>
      ) : (
        <GenericTable 
          columns={columns} 
          data={filteredSpecializations} 
          onMoreClick={handleMoreClick} 
        />
      )}

      {/* MODAL JAVASCRIPT / JSX LAYER */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title-text">
              Doctors in {selectedItem?.specialization_name}
            </h3>
            
            <div className="modal-table-container">
              {loadingDoctors ? (
                <p className="modal-state-text">Loading doctors...</p>
              ) : doctorsList.length === 0 ? (
                <p className="modal-state-text">No doctors currently assigned to this specialization.</p>
              ) : (
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorsList.map((doc) => (
                      <tr key={doc.doctor_id}>
                        <td className="doc-name">{`${doc.first_name} ${doc.last_name}`}</td>
                        <td className="doc-username">@{doc.username}</td>
                        <td className="doc-phone">{doc.phone_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn btn-close-modal">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
