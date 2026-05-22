import React, { useState, useEffect } from "react";
import GenericTable from "../../components/JSXcomponents/GenericTable.jsx";
import "./../CSSpages/superuser/ManageSpecializatoins.css";

export default function ManageSpecialization() {
  // Data and structural states
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states (handles Create, Edit, Delete)
  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);

  // States për Modalin e Doktorëve 🩺
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
      const response = await fetch("/api/specializations");
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
      const response = await fetch(`/api/specializations/${selectedItem.id}`, {
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

  // Funksioni që hap modalin dhe tërheq doktorët nga API 🚀
  const handleViewDoctors = async () => {
    if (!selectedItem) return;
    
    setIsModalOpen(true);
    setLoadingDoctors(true);
    setDoctorsList([]);
    
    try {
      // Ky endpoint duhet të lidhet me funksionin e ri në backend: getDoctorsBySpecialization
      const response = await fetch(`/api/specializations/${selectedItem.id}/doctors`);
      const result = await response.json();
      
      if (result.success) {
        setDoctorsList(result.data);
      } else {
        alert(result.message || "Failed to load doctors list.");
      }
    } catch (err) {
      alert("Error fetching doctors data.");
    } finally {
      setLoadingDoctors(false);
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

  return (
    <div className="page-container">  
      <h2>Manage Specializations</h2>
      <p style={{ color: "gray" }}>View, add, and modify hospital department specializations.</p>

      {error && (
        <div style={{ color: "red", backgroundColor: "#ffe6e6", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Formë Aksioni */}
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
          <>
            {/* Butoni i ri për të parë Doktorët 🩺 */}
            <button 
              type="button" 
              onClick={handleViewDoctors} 
              style={{ padding: "8px 16px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              👁️ View Doctors ({selectedItem.total_doctors})
            </button>
            
            <button 
              type="button" 
              onClick={handleDelete} 
              style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Delete Specialization
            </button>
            <button type="button" onClick={resetForm} style={{ padding: "8px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Cancel
            </button>
          </>
        )}
      </form>

      {/* Tabela e të Dhënave */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading specializations data...</p>
      ) : (
        <GenericTable 
          columns={columns} 
          data={specializations} 
          onMoreClick={handleMoreClick} 
        />
      )}

      {/* MODAL JAVASCRIPT / JSX LAYER */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white", padding: "25px", borderRadius: "8px", width: "500px", maxWidth: "90%",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)", position: "relative"
          }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              Doctors in {selectedItem?.specialization_name}
            </h3>
            
            <div style={{ margin: "20px 0", maxHeight: "300px", overflowY: "auto" }}>
              {loadingDoctors ? (
                <p style={{ textAlign: "center" }}>Loading doctors...</p>
              ) : doctorsList.length === 0 ? (
                <p style={{ textAlign: "center", color: "gray" }}>No doctors currently assigned to this specialization.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <th style={{ padding: "8px" }}>Name</th>
                      <th style={{ padding: "8px" }}>Username</th>
                      <th style={{ padding: "8px" }}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorsList.map((doc) => (
                      <tr key={doc.doctor_id} style={{ borderBottom: "1px solid #dee2e6" }}>
                        <td style={{ padding: "8px" }}>{`${doc.first_name} ${doc.last_name}`}</td>
                        <td style={{ padding: "8px", color: "#555" }}>@{doc.username}</td>
                        <td style={{ padding: "8px", color: "gray" }}>{doc.phone_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}