import React, { useState, useEffect } from 'react';
import GenericTable from "../../../components/JSXcomponents/GenericTable.jsx";
import "../../CSSpages/superuser/Hospitals.css";
import { superuserFetch } from "../../../services/superuserApi.js";

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State për modale e detajeve dhe editimit
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State për verifikimin e profilit të drejtorit
  const [searchPersonalNo, setSearchPersonalNo] = useState('');
  const [linkedProfile, setLinkedProfile] = useState(null);
  const [profileSearchError, setProfileSearchError] = useState('');
  
  // State për formën e spitalit të ri
  const [formData, setFormData] = useState({
    hospital_name: '',
    hospital_address: '',
    email: '',
    director_personal_no: '',
    departments: [] 
  });

  // State për formën e editimit të spitalit ekzistues
  const [editFormData, setEditFormData] = useState({
    hospital_name: '',
    hospital_address: '',
    email: '',
    director_personal_no: '',
    departments: [] 
  });

  const API_URL = '/hospitals'; 
  const DEPARTMENTS_API_URL = '/departments';

  // 1. Merr spitalet nga Backend-i
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await superuserFetch(API_URL);
      const resData = await response.json();
      if (resData.success) {
        setHospitals(resData.data);
      } else {
        setError(resData.message || 'Failed to fetch hospitals.');
      }
    } catch (err) {
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  // Funksioni për të marrë departamentet nga Backend-i
  const fetchDepartments = async () => {
    try {
      const response = await superuserFetch(DEPARTMENTS_API_URL);
      const resData = await response.json();
      if (resData.success) {
        setDepartments(resData.data);
      } else {
        console.error(resData.message || 'Failed to fetch departments.');
      }
    } catch (err) {
      console.error('Cannot connect to departments backend server.', err);
    }
  };

  useEffect(() => {
    fetchHospitals();
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // Logjika e re për ndryshimin e Checkbox-eve (Krijim)
  const handleCheckboxChange = (deptId) => {
    const currentDepartments = [...formData.departments];
    if (currentDepartments.includes(deptId)) {
      // Nëse është i selektuar, e heqim
      setFormData({
        ...formData,
        departments: currentDepartments.filter(id => id !== deptId)
      });
    } else {
      // Nëse nuk është i selektuar, e shtojmë
      setFormData({
        ...formData,
        departments: [...currentDepartments, deptId]
      });
    }
  };

  // Logjika e re për ndryshimin e Checkbox-eve (Editim)
  const handleEditCheckboxChange = (deptId) => {
    const currentDepartments = [...editFormData.departments];
    if (currentDepartments.includes(deptId)) {
      setEditFormData({
        ...editFormData,
        departments: currentDepartments.filter(id => id !== deptId)
      });
    } else {
      setEditFormData({
        ...editFormData,
        departments: [...currentDepartments, deptId]
      });
    }
  };

  // Verifikimi i Profilit nga API
  const handleVerifyProfile = async (isForEdit = false) => {
    setProfileSearchError("");
    setLinkedProfile(null);

    const personalNoToSearch = searchPersonalNo.trim();

    if (!personalNoToSearch) {
      setProfileSearchError("Please enter a personal number.");
      return;
    }

    try {
      const res = await superuserFetch(`/profiles/director/${personalNoToSearch}`);
      const result = await res.json();

      if (res.ok && result.data) {
        setLinkedProfile(result.data);
        
        if (isForEdit) {
          setEditFormData(prev => ({
            ...prev,
            director_personal_no: personalNoToSearch
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            director_personal_no: personalNoToSearch
          }));
        }
      } else {
        setProfileSearchError(result.message || "This personal number does not exist or is not a Director.");
        if (isForEdit) {
          setEditFormData(prev => ({ ...prev, director_personal_no: "" }));
        } else {
          setFormData(prev => ({ ...prev, director_personal_no: "" }));
        }
      }
    } catch (error) {
      console.error("Error verifying profile:", error);
      setProfileSearchError("An error occurred while connecting to the server.");
    }
  };

  // 2. Krijimi i një Spitali të Ri
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.hospital_name || !formData.hospital_address || !formData.email || !formData.director_personal_no) {
      setError("Please populate all fields, including verifying the Director's personal number.");
      return;
    }

    try {
      const response = await superuserFetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (resData.success) {
        fetchHospitals(); 
        setIsModalOpen(false);
        setFormData({ hospital_name: '', hospital_address: '', email: '', director_personal_no: '', departments: [] }); 
        setSearchPersonalNo('');
        setLinkedProfile(null);
      } else {
        setError(resData.message || 'Failed to create hospital.');
      }
    } catch (err) {
      setError('An operational network error occurred.');
    }
  };

  // 3. Përditësimi i Spitalit
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await superuserFetch(`${API_URL}/${selectedHospital.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const resData = await response.json();

      if (resData.success) {
        fetchHospitals(); 
        setIsDetailsModalOpen(false);
        setIsEditing(false);
        setSelectedHospital(null);
        setLinkedProfile(null);
        setSearchPersonalNo('');
      } else {
        setError(resData.message || 'Failed to update hospital configuration.');
      }
    } catch (err) {
      setError('Network error occurred while updating.');
    }
  };

  const handleMoreClick = (item) => {
    setSelectedHospital(item);
    setEditFormData({
      hospital_name: item.hospital_name || '',
      hospital_address: item.hospital_address || '',
      email: item.email || '',
      director_personal_no: item.director?.personal_no || '',
      departments: item.departments ? item.departments.map(d => d.id) : []
    });
    setLinkedProfile(null);
    setSearchPersonalNo('');
    setProfileSearchError('');
    setIsEditing(false);
    setIsDetailsModalOpen(true);
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'hospital_name', header: 'Hospital Name' },
    { key: 'hospital_address', header: 'Address' },
    { key: 'email', header: 'Email Address' },
    { key: 'director_name', header: 'Director' },       
    { key: 'director_username', header: 'Directors Username' }   
  ];

  const preparedHospitals = hospitals.map(hosp => ({
    ...hosp,
    director_name: hosp.director ? `${hosp.director.first_name} ${hosp.director.last_name}` : 'No Director',
    director_username: hosp.director?.username ? `@${hosp.director.username}` : 'N/A'
  }));

  const filteredHospitals = preparedHospitals.filter(hosp =>
    String(hosp.id).includes(searchTerm.trim()) ||
    (hosp.hospital_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (hosp.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (hosp.director_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (hosp.director_username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Hospital Management</h2>
          <p className="page-subtitle">Create, monitor and filter hospital configurations</p>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={() => { setError(''); setIsModalOpen(true); }}>
            + Create New Hospital
          </button>
        </div>
      </div>

      <div className="controls-wrapper">
        <div className="search-bar-container">
          <span className="entries-counter">
            {loading ? 'Loading...' : `Showing ${filteredHospitals.length} of ${hospitals.length} hospitals`}
          </span>
          <div className="search-actions" style={{ width: '100%', maxWidth: '500px' }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="🔍 Search hospitals by ID, name, email or director..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {error && !isModalOpen && !isDetailsModalOpen && <div className="error-banner">⚠️ {error}</div>}

      <GenericTable 
        columns={columns} 
        data={filteredHospitals} 
        onMoreClick={handleMoreClick}
      />

      {/* MODALE PËR KRIJIMIN E SPITALIT */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Register New Hospital</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            {error && <div className="error-banner">⚠️ {error}</div>}

            <form className="modal-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Hospital Name</label>
                <input type="text" name="hospital_name" value={formData.hospital_name} onChange={handleInputChange} placeholder="e.g. Central Clinic"/>
              </div>
              <div className="form-group">
                <label>Hospital Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="hospital@domain.com"/>
              </div>
              <div className="form-group">
                <label>Full Address</label>
                <input type="text" name="hospital_address" value={formData.hospital_address} onChange={handleInputChange} placeholder="Street, City, Zip"/>
              </div>

              {/* INTEGRIMI I CHECKBOX-EVE PËR DEPARTAMENTET (KRIJIM) */}
              <div className="form-group">
                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Link Departments</label>
                <div style={{ 
                  maxHeight: '120px', 
                  overflowY: 'auto', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '6px', 
                  padding: '10px',
                  backgroundColor: '#fff' 
                }}>
                  {departments.map(dept => (
                    <div key={dept.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        id={`create-dept-${dept.id}`}
                        checked={formData.departments.includes(dept.id)}
                        onChange={() => handleCheckboxChange(dept.id)}
                        style={{ cursor: 'pointer', width: 'auto' }}
                      />
                      <label htmlFor={`create-dept-${dept.id}`} style={{ cursor: 'pointer', fontSize: '14px', color: '#2d3748', margin: 0 }}>
                        {dept.department_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group profile-verification-box">
                <label>Link Existing Profile (Unique Personal Number):</label>
                <div className="profile-verification-input-wrapper">
                  <input type="text" placeholder="Enter profile unique number..." value={searchPersonalNo} onChange={(e) => setSearchPersonalNo(e.target.value)} />
                  <button type="button" onClick={() => handleVerifyProfile(false)} className="profile-verify-action-btn">Verify & Link</button>
                </div>
                {profileSearchError && <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '6px' }}>❌ {profileSearchError}</p>}
                {linkedProfile && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '4px' }}>
                    <p style={{ color: '#2f855a', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 'bold' }}>✅ Profile Verified & Attached!</p>
                    <p style={{ fontSize: '13px', color: '#2d3748', margin: '2px 0' }}><strong>Director:</strong> {linkedProfile.first_name} {linkedProfile.last_name}</p>
                    <p style={{ fontSize: '12px', color: '#4a5568', margin: '2px 0' }}><strong>Directors Username:</strong> @{linkedProfile?.username || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => { setIsModalOpen(false); setLinkedProfile(null); setSearchPersonalNo(''); }}>Cancel</button>
                <button type="submit" className="save-btn" disabled={!formData.director_personal_no}>Save Hospital</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE MULTI-FUNKSIONALE: SHFAQJE DHE MODIFIKIM I SPITALIT */}
      {isDetailsModalOpen && selectedHospital && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{isEditing ? "Edit Hospital Configuration" : "Hospital Information Overview"}</h2>
              <button className="close-modal-btn" onClick={() => { setIsDetailsModalOpen(false); setSelectedHospital(null); setIsEditing(false); }}>×</button>
            </div>
            
            {error && <div className="error-banner">⚠️ {error}</div>}

            <form onSubmit={handleEditFormSubmit} className="modal-form">
              <div className="modal-body" style={{ padding: '10px 0' }}>
                
                <div className="form-group" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold', color: '#4a5568', fontSize: '12px' }}>Hospital Name</label>
                  {isEditing ? (
                    <input type="text" name="hospital_name" value={editFormData.hospital_name} onChange={handleEditInputChange} className="search-input" style={{ width: '100%', marginTop: '5px' }} />
                  ) : (
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '500', color: '#2b6cb0' }}>{selectedHospital.hospital_name}</p>
                  )}
                </div>

                <div className="form-group" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold', color: '#4a5568', fontSize: '12px' }}>Contact Email</label>
                  {isEditing ? (
                    <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} className="search-input" style={{ width: '100%', marginTop: '5px' }} />
                  ) : (
                    <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#2d3748' }}>{selectedHospital.email}</p>
                  )}
                </div>

                <div className="form-group" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold', color: '#4a5568', fontSize: '12px' }}>Physical Location / Address</label>
                  {isEditing ? (
                    <input type="text" name="hospital_address" value={editFormData.hospital_address} onChange={handleEditInputChange} className="search-input" style={{ width: '100%', marginTop: '5px' }} />
                  ) : (
                    <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#2d3748' }}>{selectedHospital.hospital_address}</p>
                  )}
                </div>

                {/* INTEGRIMI I CHECKBOX-EVE PËR DEPARTAMENTET (EDITIM / SHFAQJE) */}
                <div className="form-group" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold', color: '#4a5568', fontSize: '12px' }}>Associated Departments</label>
                  {isEditing ? (
                    <div style={{ 
                      maxHeight: '120px', 
                      overflowY: 'auto', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '6px', 
                      padding: '10px',
                      backgroundColor: '#fff',
                      marginTop: '5px'
                    }}>
                      {departments.map(dept => (
                        <div key={dept.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                          <input 
                            type="checkbox" 
                            id={`edit-dept-${dept.id}`}
                            checked={editFormData.departments.includes(dept.id)}
                            onChange={() => handleEditCheckboxChange(dept.id)}
                            style={{ cursor: 'pointer', width: 'auto' }}
                          />
                          <label htmlFor={`edit-dept-${dept.id}`} style={{ cursor: 'pointer', fontSize: '14px', color: '#2d3748', margin: 0 }}>
                            {dept.department_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {selectedHospital.departments && selectedHospital.departments.length > 0 ? (
                        selectedHospital.departments.map(dept => (
                          <span key={dept.id} style={{ backgroundColor: '#e2e8f0', color: '#4a5568', padding: '3px 8px', borderRadius: '12px', fontSize: '13px' }}>
                            {dept.department_name}
                          </span>
                        ))
                      ) : (
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#718096', fontStyle: 'italic' }}>No departments linked.</p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                  <label style={{ fontWeight: 'bold', color: '#2c5282', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                    Hospital Director Management
                  </label>
                  
                  {!isEditing && (
                    <>
                      <p style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '500', color: '#1a202c' }}>
                        {selectedHospital.director ? `${selectedHospital.director.first_name} ${selectedHospital.director.last_name}` : "No Director assigned."}
                      </p>
                      {selectedHospital.director?.username && (
                        <p style={{ margin: '0', fontSize: '13px', color: '#4a5568' }}>
                          Username: <strong>@{selectedHospital.director.username}</strong>
                        </p>
                      )}
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#718096' }}>
                        Personal Number: {selectedHospital.director?.personal_no || "N/A"}
                      </p>
                    </>
                  )}

                  {isEditing && (
                    <div style={{ marginTop: '5px' }}>
                      <div style={{ padding: '8px', backgroundColor: '#fffaf0', border: '1px solid #feebc8', borderRadius: '4px', marginBottom: '10px', color: '#dd6b20', fontSize: '12px' }}>
                        ⚠️ <strong>Caution:</strong> Changing the director will detach the current user profile from this hospital administration layer.
                      </div>
                      
                      <p style={{ fontSize: '12px', color: '#4a5568', marginBottom: '5px' }}>
                        Current Active Director Personal No: <strong>{selectedHospital.director?.personal_no || "None"}</strong>
                      </p>

                      <div className="profile-verification-input-wrapper" style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Enter new Director's Personal No..." 
                          value={searchPersonalNo} 
                          onChange={(e) => setSearchPersonalNo(e.target.value)} 
                          className="search-input"
                          style={{ flex: 1 }}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleVerifyProfile(true)} 
                          className="profile-verify-action-btn"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          Verify & Replace
                        </button>
                      </div>

                      {profileSearchError && <p style={{ color: '#e53e3e', fontSize: '12px', marginTop: '5px' }}>❌ {profileSearchError}</p>}

                      {linkedProfile && (
                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '4px' }}>
                          <p style={{ color: '#2b6cb0', fontSize: '12px', margin: '0 0 4px 0', fontWeight: 'bold' }}>🔄 New Director Ready to Link:</p>
                          <p style={{ fontSize: '13px', color: '#2d3748', margin: '2px 0' }}><strong>Name:</strong> {linkedProfile.first_name} {linkedProfile.last_name}</p>
                          <p style={{ fontSize: '12px', color: '#2d3748', margin: '2px 0' }}><strong>Username:</strong> @{linkedProfile.username || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '15px' }}>
                {!isEditing ? (
                  <>
                    <button type="button" className="cancel-btn" style={{ backgroundColor: '#edf2f7', color: '#4a5568' }} onClick={() => setIsEditing(true)}>
                      ✏️ Edit Details
                    </button>
                    <button type="button" className="save-btn" onClick={() => { setIsDetailsModalOpen(false); setSelectedHospital(null); }}>
                      Close Overview
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="cancel-btn" onClick={() => { setIsEditing(false); setLinkedProfile(null); setSearchPersonalNo(''); }}>
                      Cancel Edit
                    </button>
                    <button type="submit" className="save-btn" style={{ backgroundColor: '#3182ce' }} disabled={!editFormData.director_personal_no}>
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
