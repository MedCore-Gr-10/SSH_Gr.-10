import React, { useState, useEffect } from "react";
import GenericTable from "../../components/common/GenericTable.jsx";
import "./ManageDepartments.css";
import { superuserFetch } from "../../services/superuserApi.js";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'doctors' ose 'hospitals'
  
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [hospitalsList, setHospitalsList] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  const columns = [
    { header: "ID", key: "id" },
    { header: "Department Name", key: "department_name" },
    { header: "Hospitals Active", key: "total_hospitals" }, 
    { header: "Total Doctors Assigned", key: "total_doctors" }, 
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await superuserFetch("/departments");
      const result = await response.json();
      if (result.success) setDepartments(result.data);
      else setError(result.message || "Failed to load departments.");
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const url = isEditing ? `/departments/${selectedItem.id}` : "/departments";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await superuserFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_name: inputValue }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchDepartments();
        resetForm();
      } else setError(result.message);
    } catch (err) {
      setError("Failed to save changes.");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !window.confirm(`Delete ${selectedItem.department_name}?`)) return;
    try {
      const response = await superuserFetch(`/departments/${selectedItem.id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        await fetchDepartments();
        resetForm();
      } else setError(result.message);
    } catch (err) {
      setError("Failed to delete.");
    }
  };
  
  const handleMoreClick = (item) => {
    setSelectedItem(item);
    setInputValue(item.department_name);
    setIsEditing(true);
  };

  const resetForm = () => {
    setInputValue("");
    setSelectedItem(null);
    setIsEditing(false);
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.id?.toString().includes(searchTerm)
  );

  return (
    <div className="page-container">  
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Manage Department</h2>
          <p className="page-subtitle">View, add, and modify hospital departments and tracks clinical structures.</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="controls-wrapper">
        <form onSubmit={handleSubmit} className={`form-container ${isEditing ? "editing" : ""}`}>
          <div className="input-group">
            <label className="input-label">
              {isEditing ? `Editing Department (ID: ${selectedItem?.id})` : "Create New Department"}
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency, General Surgery, ICU..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="main-input"
              required
            />
          </div>

          <div className="button-group">
            <button type="submit" className={`btn ${isEditing ? "btn-primary" : "btn-success"}`}>
              {isEditing ? "Update Name" : "+  Create Department"}
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

        <div className="search-bar-container">
          <span className="entries-counter">
            Showing {filteredDepartments.length} of {departments.length} entries
          </span>
          <input
            type="text"
            placeholder="🔍 Search department by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading departments data...</p>
      ) : filteredDepartments.length === 0 ? (
        <div className="no-results-card">
          <p className="no-results-title">No results found</p>
          <p className="no-results-desc">We couldn't find any department matching "{searchTerm}".</p>
        </div>
      ) : (
        <GenericTable columns={columns} data={filteredDepartments} onMoreClick={handleMoreClick} />
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title-text">
              {modalType === "doctors" 
                ? `Doctors in ${selectedItem?.department_name}` 
                : `Hospitals with ${selectedItem?.department_name} Department`
              }
            </h3>
            
            <div className="modal-table-container">
              {modalType === "doctors" && (
                loadingDoctors ? (
                  <p className="modal-state-text">Loading doctors...</p>
                ) : doctorsList.length === 0 ? (
                  <p className="modal-state-text">No doctors currently assigned to this department.</p>
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
                )
              )}

              {modalType === "hospitals" && (
                loadingHospitals ? (
                  <p className="modal-state-text">Loading hospitals...</p>
                ) : hospitalsList.length === 0 ? (
                  <p className="modal-state-text">This department is not active in any hospital yet.</p>
                ) : (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Hospital Name</th>
                        <th>Address</th>
                        <th>Email Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitalsList.map((hosp) => (
                        <tr key={hosp.hospital_id}>
                          <td className="hosp-name">{hosp.hospital_name}</td>
                          <td className="hosp-address">{hosp.hospital_address}</td>
                          <td className="hosp-email">{hosp.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
