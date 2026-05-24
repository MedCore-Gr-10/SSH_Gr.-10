import { useEffect, useState } from "react";
import "../../CSSpages/superuser/Users.css";
import Button1 from "../../../components/JSXcomponents/Button1.jsx";
import GenericTable from "../../../components/JSXcomponents/GenericTable.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Infrastructure data from backend
  const [hospitals, setHospitals] = useState([]); 
  const [departments, setDepartments] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  // States for Search inputs 🔍
  const [userSearch, setUserSearch] = useState("");
  const [profileSearch, setProfileSearch] = useState("");

  // States for Dropdown Filtering 🎛️
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  
  // viewMode determines current grid view: 'none', 'users', or 'profiles'
  const [viewMode, setViewMode] = useState('none'); 

  // States for Searching and Linking a Unique Profile 🆔
  const [searchPersonalNo, setSearchPersonalNo] = useState("");
  const [linkedProfile, setLinkedProfile] = useState(null);
  const [profileSearchError, setProfileSearchError] = useState("");

  // States for Profiles Modal 📑
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [newProfile, setNewProfile] = useState({
    first_name: "",
    last_name: "",
    birth: "",
    gender: "",
    personal_no: "",
    phone_number: ""
  });

  // States for Users Modal 👤
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserEditMode, setIsUserEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // 🚀 SHTUAR: Ruajmë rolin origjinal të përdoruesit kur hapet modal-i për editim
  const [originalRole, setOriginalRole] = useState(""); 

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "", 
    role_id: "3", 
    is_active: true,
    hospital_id: "",      
    department_id: "",      
    specialization_id: ""   
  });

  // States for Password Reset Utility 🔐
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  // Function to fetch Users 🔄
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.data || data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Function to fetch Profiles
  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      setProfiles(data.data || data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setLoading(false);
    }
  };

  // Function to fetch Hospitals, Departments & Specializations
  const fetchInfrastructureData = async () => {
    try {
      const [hospRes, deptRes, specRes] = await Promise.all([
        fetch("/api/hospitals"),
        fetch("/api/departments"),
        fetch("/api/specializations")
      ]);
      const hospData = await hospRes.json();
      const deptData = await deptRes.json();
      const specData = await specRes.json();

      setHospitals(hospData.data || hospData || []);
      setDepartments(deptData.data || deptData || []);
      setSpecializations(specData.data || specData || []);
    } catch (error) {
      console.error("Error fetching infrastructure dropdowns:", error);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchUsers();
    fetchProfiles();
    fetchInfrastructureData();
  }, []);

  // Function to verify unique personal number and return First/Last Name 🔍
  const handleVerifyProfile = async () => {
    setProfileSearchError("");
    setLinkedProfile(null);

    if (!searchPersonalNo.trim()) {
      setProfileSearchError("Please enter a personal number.");
      return;
    }

    try {
      const res = await fetch(`/api/profiles/personal/${searchPersonalNo.trim()}`);
      const result = await res.json();

      if (res.ok && result.data) {
        setLinkedProfile(result.data);
      } else {
        setProfileSearchError(result.message || "This personal number does not exist in the system.");
      }
    } catch (error) {
      console.error("Error verifying profile:", error);
      setProfileSearchError("An error occurred while connecting to the server.");
    }
  };

  // Columns for Users Table
  const userColumns = [
    { header: "UUID", key: "id" },
    { header: "Username", key: "username" },
    { header: "Role", key: "role_name" },
    { header: "Email", key: "email" },
    {
      header: "Status",
      key: "is_active",
      render: (val) => {
        const active =
          val === true ||
          val === 1 ||
          String(val).toLowerCase() === "true";

        return active ? "✅ Enabled" : "❌ Disabled";
      }
    },
  ];

  // Columns for Profiles Table
  const profileColumns = [
    { header: "ID", key: "id" },
    { header: "First Name", key: "first_name" },
    { header: "Last Name", key: "last_name" },
    { header: "Gender", key: "gender" },
    { header: "Phone", key: "phone_number" },
    { header: "Personal No.", key: "personal_no" },
  ];

  // Management of Handle More Function 🛠️
  const handleMore = (item) => {
    if (viewMode === 'profiles') {
      setIsProfileEditMode(true);
      setSelectedProfileId(item.id);
      
      let formattedBirth = "";
      if (item.birth_date) {
        formattedBirth = item.birth_date.split("T")[0];
      } else if (item.birth) {
        formattedBirth = item.birth.split("T")[0];
      }

      setNewProfile({
        first_name: item.first_name || "",
        last_name: item.last_name || "",
        birth: formattedBirth,
        gender: item.gender || "",
        personal_no: item.personal_no || "",
        phone_number: item.phone_number || ""
      });
      setIsProfileModalOpen(true);
    } 
    
    else if (viewMode === 'users') {
      setIsUserEditMode(true);
      setSelectedUserId(item.id);
      setShowPasswordForm(false); 
      setNewPasswordValue(""); 
      
      const foundProfile = profiles.find(p => 
        String(p.id) === String(item.profile_id)
      );
      
      if (foundProfile) {
        setLinkedProfile(foundProfile);
      } else {
        setLinkedProfile({
          id: item.profile_id,
          first_name: item.first_name || "Undefined",
          last_name: item.last_name || "",
          personal_no: item.personal_no || "N/A",
          gender: item.gender || "N/A"
        });
      }

      const normalizedRole = item.role_name ? item.role_name.toLowerCase() : "";

      let mappedRoleId = "3"; 
      if (normalizedRole === "superuser") mappedRoleId = "1";
      else if (normalizedRole === "director") mappedRoleId = "2";
      else if (normalizedRole === "patient") mappedRoleId = "3";
      else if (normalizedRole === "doctor") mappedRoleId = "4";
      else if (normalizedRole === "nurse") mappedRoleId = "5";

      // 🚀 RREGULLIMI: Ruajmë rolin origjinal të llogarisë
      setOriginalRole(mappedRoleId);

      setNewUser({
        username: item.username || "",
        email: item.email || "",
        password: "", 
        role_id: mappedRoleId,
        is_active: item.is_active === true || item.is_active === 1 || String(item.is_active).toLowerCase() === 'true',
        hospital_id: item.hospital_id || "", 
        department_id: item.department_id || "",      
        specialization_id: item.specialization_id || "" 
      });
      setIsUserModalOpen(true);
    }
  };

  const openNewUserModal = () => {
    setIsUserEditMode(false);
    setSelectedUserId(null);
    setSearchPersonalNo(""); 
    setLinkedProfile(null);  
    setProfileSearchError("");
    setShowPasswordForm(false);
    setNewPasswordValue("");
    setOriginalRole(""); // Reset rolin origjinal
    setNewUser({
      username: "",
      email: "",
      password: "", 
      role_id: "3",
      is_active: true,
      hospital_id: "", 
      department_id: "",      
      specialization_id: ""   
    });
    setIsUserModalOpen(true);
  };

  const openNewProfileModal = () => {
    setIsProfileEditMode(false);
    setSelectedProfileId(null);
    setNewProfile({
      first_name: "",
      last_name: "",
      birth: "",
      gender: "",
      personal_no: "",
      phone_number: ""
    });
    setIsProfileModalOpen(true);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setNewProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setNewUser((prev) => {
      const updatedFields = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };

      // Reset nested values if hospital changes to prevent stale data
      if (name === "hospital_id") {
        updatedFields.department_id = "";
        updatedFields.specialization_id = "";
      }

      if (name === "role_id") {
        const isDirector = value === "2";
        const isDoc = value === "4";
        const isNurse = value === "5";
        
        if (!isDirector && !isDoc && !isNurse) updatedFields.hospital_id = "";
        if (!isDoc && !isNurse) updatedFields.department_id = "";
        if (!isDoc) updatedFields.specialization_id = "";
      }

      return updatedFields;
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const url = isProfileEditMode ? `/api/profiles/${selectedProfileId}` : "/api/profiles";
    const method = isProfileEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile)
      });
      const result = await res.json();

      if (res.ok) {
        alert(isProfileEditMode ? "Profile updated successfully!" : "Profile created successfully!");
        setIsProfileModalOpen(false);
        fetchProfiles();
      } else {
        alert("Action failed: " + (result.error || result.message || res.statusText));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    if (!isUserEditMode && !linkedProfile) {
      alert("Please verify the personal number and link an existing profile before saving the user!");
      return;
    }

    const url = isUserEditMode ? `/api/users/${selectedUserId}` : "/api/users";
    const method = isUserEditMode ? "PUT" : "POST";

    const isDirector = String(newUser.role_id) === "2";
    const isDoctor = String(newUser.role_id) === "4";
    const isNurse = String(newUser.role_id) === "5";
    const hasHospital = isDirector || isDoctor || isNurse;

    const payload = {
      username: newUser.username,
      email: newUser.email,
      is_active: Boolean(newUser.is_active), 
      role_id: parseInt(newUser.role_id, 10),
      profile_id: linkedProfile ? linkedProfile.id : undefined, 
      hospital_id: hasHospital && newUser.hospital_id ? parseInt(newUser.hospital_id, 10) : null, 
      department_id: (isDoctor || isNurse) && newUser.department_id ? parseInt(newUser.department_id, 10) : null,
      specialization_id: isDoctor && newUser.specialization_id ? parseInt(newUser.specialization_id, 10) : null,
      ...(!isUserEditMode && { password: newUser.password })
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (res.ok) {
        alert(isUserEditMode ? "User account updated successfully!" : "User account created successfully!");
        setIsUserModalOpen(false);
        fetchUsers(); 
      } else {
        alert("Action failed: " + (result.error || result.message || res.statusText));
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("An error occurred while saving the user.");
    }
  };

  const handlePasswordUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!newPasswordValue.trim()) {
      alert("Password cannot be blank.");
      return;
    }

    const confirmAction = window.confirm("CAUTION: Are you completely sure you want to alter this user's password credential?");
    if (!confirmAction) return;

    try {
      const res = await fetch(`/api/users/${selectedUserId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPasswordValue })
      });
      const result = await res.json();

      if (res.ok) {
        alert("System access password updated successfully!");
        setNewPasswordValue("");
        setShowPasswordForm(false);
      } else {
        alert("Password change failed: " + (result.message || res.statusText));
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Server connection failure updating password.");
    }
  };

  // Multi-criteria User Filter Chain
  const filteredUsers = users.filter((user) => {
    if (!user.username) return false;

    const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase().trim());
    const matchesRole = roleFilter === "ALL" || (user.role_name && user.role_name.toUpperCase() === roleFilter.toUpperCase());
    const isActiveUser = user.is_active === true || user.is_active === 1 || String(user.is_active).toLowerCase() === "true";
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" && isActiveUser) || (statusFilter === "INACTIVE" && !isActiveUser);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredProfiles = profiles.filter((profile) => {
    const firstName = profile.first_name ? profile.first_name.toLowerCase() : "";
    const lastName = profile.last_name ? profile.last_name.toLowerCase() : "";
    const fullName = `${firstName} ${lastName}`.trim();
    const personalNo = profile.personal_no ? String(profile.personal_no).toLowerCase() : "";
    const phoneNumber = profile.phone_number ? String(profile.phone_number).toLowerCase() : "";
    
    const searchLower = profileSearch.toLowerCase().trim();

    const matchesSearch = 
      firstName.includes(searchLower) || 
      lastName.includes(searchLower) || 
      fullName.includes(searchLower) ||
      personalNo.includes(searchLower) ||
      phoneNumber.includes(searchLower);

    const profileGender = profile.gender ? profile.gender.toUpperCase() : "";
    const matchesGender = genderFilter === "ALL" || profileGender === genderFilter.toUpperCase();

    return matchesSearch && matchesGender;
  });

  const selectedHospitalDepartments = (() => {
    if (!newUser.hospital_id) return [];

    const selectedHospital = hospitals.find(
      (hospital) => String(hospital.id) === String(newUser.hospital_id)
    );

    if (Array.isArray(selectedHospital?.departments) && selectedHospital.departments.length > 0) {
      return selectedHospital.departments.filter(Boolean);
    }

    return departments.filter((department) => {
      const directHospitalId = department.hospital_id ?? department.hospitals?.id;
      const hospitalLinks = Array.isArray(department.hospitals_departments)
        ? department.hospitals_departments
        : [];

      return (
        (directHospitalId && String(directHospitalId) === String(newUser.hospital_id)) ||
        hospitalLinks.some(
          (link) => String(link.hospital_id ?? link.hospitals?.id) === String(newUser.hospital_id)
        )
      );
    });
  })();

  const getDepartmentOptionId = (department) =>
    department.id ?? department.department_id ?? department.departments?.id;

  const getDepartmentOptionName = (department) =>
    department.department_name ?? department.departments?.department_name ?? "Unnamed Department";

  return (
    <div className="page-container">
      <div className="menu">
        {/* Users Section */}
        <div className="menu-bubble-information-buttons">
          <div className="menu-information">
            <p>Total Users: {users.length}</p>
            <p>Enabled: {users.filter((u) => u && (u.is_active === true || u.is_active === 1 || String(u.is_active).toLowerCase() === "true")).length}</p>
            <p>Disabled: {users.filter((u) => u && !(u.is_active === true || u.is_active === 1 || String(u.is_active).toLowerCase() === "true")).length}</p>
          </div>
          <div className="menu-search-button">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-users" 
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                if (viewMode !== 'users') setViewMode('users');
              }}
            />
            <div className="buttons-list">
              <button className="menu-buttons" onClick={openNewUserModal}>New User</button>
              <button className="menu-buttons" onClick={() => setViewMode('users')}>All Users</button>
            </div>
          </div>
        </div>

        {/* Profiles Section */}
        <div className="menu-bubble-information-buttons">
          <div className="menu-information">
            <p>Total Profiles: {profiles.length}</p>
          </div>
          <div className="menu-search-button">
            <input 
              type="text" 
              placeholder="Search profiles..." 
              className="search-users" 
              value={profileSearch}
              onChange={(e) => {
                setProfileSearch(e.target.value);
                if (viewMode !== 'profiles') setViewMode('profiles');
              }}
            />
            <div className="buttons-list">
              <button className="menu-buttons" onClick={openNewProfileModal}>New Profile</button>
              <button className="menu-buttons" onClick={() => setViewMode('profiles')}>All Profiles</button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-area">
        {viewMode === 'users' && (
          <>
            <div className="content-area-header">
              <h1>User Accounts {`(Filtered: ${filteredUsers.length})`}</h1>
              
              <div className="filter-dropdowns-container" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="filter-group">
                  <label htmlFor="role-filter-select" style={{ marginRight: "6px", fontSize: "14px", fontWeight: "600" }}>Role:</label>
                  <select 
                    id="role-filter-select"
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer" }}
                  >
                    <option value="ALL">All Roles</option>
                    <option value="SUPERUSER">Superuser</option>
                    <option value="DIRECTOR">Director</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="PATIENT">Patient</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="status-filter-select" style={{ marginRight: "6px", fontSize: "14px", fontWeight: "600" }}>Status:</label>
                  <select 
                    id="status-filter-select"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer" }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">✅ Enabled Only</option>
                    <option value="INACTIVE">❌ Disabled Only</option>
                  </select>
                </div>
              </div>

              <button className="more-button" onClick={() => setViewMode('none')}>Close X</button>
            </div>
            <GenericTable columns={userColumns} data={filteredUsers} onMoreClick={handleMore} />
          </>
        )}

        {viewMode === 'profiles' && (
          <>
            <div className="content-area-header">
              <h1>Profiles {`(Filtered: ${filteredProfiles.length})`}</h1>
              <div className="filter-dropdowns-container" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="filter-group">
                  <label htmlFor="gender-filter-select" style={{ marginRight: "6px", fontSize: "14px", fontWeight: "600" }}>Gender:</label>
                  <select 
                    id="gender-filter-select"
                    value={genderFilter} 
                    onChange={(e) => setGenderFilter(e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer" }}
                  >
                    <option value="ALL">All Genders</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>
              <button className="more-button" onClick={() => setViewMode('none')}>Close X</button>
            </div>
            <GenericTable columns={profileColumns} data={filteredProfiles} onMoreClick={handleMore} />
          </>
        )}
      </div>

      {/* Users Modal */}
      {isUserModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content custom-user-modal">
            <div className="modal-header">
              <h2>{isUserEditMode ? `Edit Account: ${newUser.username}` : "Register New System Access Account"}</h2>
              <button className="close-x-btn" onClick={() => setIsUserModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleUserSubmit} className="modal-form-layout">
              
              {!isUserEditMode && (
                <div className="profile-verification-block">
                  <h3>1. Verify & Attach Citizen Profile</h3>
                  <div className="verification-input-row">
                    <input 
                      type="text"
                      placeholder="Enter Personal ID Number (e.g. G12345678X)"
                      value={searchPersonalNo}
                      onChange={(e) => setSearchPersonalNo(e.target.value)}
                    />
                    <button type="button" className="verify-btn" onClick={handleVerifyProfile}>Link Profile</button>
                  </div>
                  {profileSearchError && <p className="verification-error">❌ {profileSearchError}</p>}
                  {linkedProfile && (
                    <div className="verification-success-card">
                      <p>✅ <strong>Linked to:</strong> {linkedProfile.first_name} {linkedProfile.last_name} ({linkedProfile.gender})</p>
                    </div>
                  )}
                </div>
              )}

              {isUserEditMode && linkedProfile && (
                <div className="profile-verification-block static-link">
                  <p>👤 <strong>Account Holder Profile:</strong> {linkedProfile.first_name} {linkedProfile.last_name}</p>
                  <p>🆔 <strong>Personal ID Reference:</strong> {linkedProfile.personal_no || "N/A"}</p>
                </div>
              )}

              <div className="form-fields-grid">
                <h3>{isUserEditMode ? "Account Configurations" : "2. Set Credentials & Security Metadata"}</h3>
                
                <div className="input-field-group">
                  <label>Username</label>
                  <input type="text" name="username" value={newUser.username} onChange={handleUserInputChange} required disabled={isUserEditMode} />
                </div>

                <div className="input-field-group">
                  <label>System Access Email Address</label>
                  <input type="email" name="email" value={newUser.email} onChange={handleUserInputChange} required />
                </div>

                {!isUserEditMode && (
                  <div className="input-field-group">
                    <label>Initial Login Password</label>
                    <input type="password" name="password" value={newUser.password} onChange={handleUserInputChange} required />
                  </div>
                )}

                <div className="input-field-group">
                  <label>Assigned Authorization Role{newUser.role_id === "2" && isUserEditMode && originalRole === "2" && <span style={{ fontSize: "11px", color: "gray" }}>(Read-Only for Active Directors)</span>}</label>
                    <select  
                      name="role_id" 
                      value={newUser.role_id} 
                      onChange={handleUserInputChange} 
                      disabled={isUserEditMode && originalRole === "2" && newUser.role_id === "2"} >
                    <option value="1">Superuser</option>
                    <option value="2">Director</option>
                    <option value="3">Patient</option>
                    <option value="4">Doctor</option>
                    <option value="5">Nurse</option>
                  </select>
                </div>

                {/* Zgjedhja e Spitalit */}
                {((newUser.role_id === "2"&& isUserEditMode) || newUser.role_id === "4" || newUser.role_id === "5") && (
                  <div className="input-field-group">
                    <label>Assigned Hospital Workplace {newUser.role_id === "2" && isUserEditMode  && originalRole === "2" && <span style={{ fontSize: "11px", color: "gray" }}>(Read-Only for Active Directors)</span>}</label>
                    <select 
                      name="hospital_id" 
                      value={newUser.hospital_id} 
                      onChange={handleUserInputChange}
                      /* 🚀 LOGJIKA E RE: Spitali bllokohet VETËM nëse llogaria ka qenë drejtor dhi vazhdon të mbetet drejtor */
                      disabled={isUserEditMode && originalRole === "2" && newUser.role_id === "2"} 
                    >
                      <option value="">-- Select Hospital --</option>
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>{h.hospital_name || h.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(newUser.role_id === "4" || newUser.role_id === "5") && (
                  <div className="input-field-group">
                    <label>Assigned Medical Department <span style={{ color: "red" }}>*</span></label>
                    <select 
                      name="department_id" 
                      value={newUser.department_id} 
                      onChange={handleUserInputChange}
                      required
                      disabled={!newUser.hospital_id} // Prevents choosing a department before selecting a hospital
                    >
                      <option value="">-- Select Department --</option>
                      {selectedHospitalDepartments.map((dept) => {
                        const departmentId = getDepartmentOptionId(dept);

                        return (
                          <option key={departmentId} value={departmentId}>
                            {getDepartmentOptionName(dept)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {newUser.role_id === "4" && (
                  <div className="input-field-group">
                    <label>Medical Specialization <span style={{ color: "red" }}>*</span></label>
                    <select 
                      name="specialization_id" 
                      value={newUser.specialization_id} 
                      onChange={handleUserInputChange}
                      required
                    >
                      <option value="">-- Select Specialization --</option>
                      {specializations.map((spec) => (
                        <option key={spec.id} value={spec.id}>{spec.specialization_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="checkbox-field-group" style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <input type="checkbox" id="is_active_chk" name="is_active" checked={newUser.is_active} onChange={handleUserInputChange} />
                  <label htmlFor="is_active_chk">Grant Application Login Privileges (Active Status)</label>
                </div>
              </div>

              <div className="form-actions-row">
                <button type="button" className="cancel-btn" onClick={() => setIsUserModalOpen(false)}>Discard</button>
                <button type="submit" className="save-btn">Commit Account State</button>
              </div>
            </form>

            {isUserEditMode && (
              <div className="danger-zone-password-reset">
                <h4>Administrative Credential Override</h4>
                {!showPasswordForm ? (
                  <button type="button" className="trigger-reset-btn" onClick={() => setShowPasswordForm(true)}>Modify User Security Password</button>
                ) : (
                  <form onSubmit={handlePasswordUpdateSubmit} className="inline-password-form">
                    <input type="password" placeholder="Enter completely new raw password string" value={newPasswordValue} onChange={(e) => setNewPasswordValue(e.target.value)} required />
                    <div className="inline-action-btns">
                      <button type="submit" className="confirm-reset-btn">Override Password</button>
                      <button type="button" className="cancel-reset-btn" onClick={() => { setShowPasswordForm(false); setNewPasswordValue(""); }}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profiles Modal */}
      {isProfileModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isProfileEditMode ? "Modify Demographics Record" : "Create Master Demographics Profile"}</h2>
              <button className="close-x-btn" onClick={() => setIsProfileModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleProfileSubmit} className="modal-form-layout">
              <div className="input-field-group">
                <label>First Name</label>
                <input type="text" name="first_name" value={newProfile.first_name} onChange={handleProfileInputChange} required />
              </div>
              <div className="input-field-group">
                <label>Last Name</label>
                <input type="text" name="last_name" value={newProfile.last_name} onChange={handleProfileInputChange} required />
              </div>
              <div className="input-field-group">
                <label>Date of Birth</label>
                <input type="date" name="birth" value={newProfile.birth} onChange={handleProfileInputChange} required />
              </div>
              <div className="input-field-group">
                <label>Gender Identification</label>
                <select name="gender" value={newProfile.gender} onChange={handleProfileInputChange} required>
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="input-field-group">
                <label>National Personal ID Number</label>
                <input type="text" name="personal_no" value={newProfile.personal_no} onChange={handleProfileInputChange} required disabled={isProfileEditMode} />
              </div>
              <div className="input-field-group">
                <label>Contact Phone Number</label>
                <input type="text" name="phone_number" value={newProfile.phone_number} onChange={handleProfileInputChange} required />
              </div>
              <div className="form-actions-row">
                <button type="button" className="cancel-btn" onClick={() => setIsProfileModalOpen(false)}>Discard</button>
                <button type="submit" className="save-btn">Save Profile Metrics</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
