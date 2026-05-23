import { useEffect, useState } from "react";
import "./../CSSpages/superuser/Users.css";
import Button1 from "../../components/JSXcomponents/Button1.jsx";
import GenericTable from "../../components/JSXcomponents/GenericTable.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Search inputs 🔍
  const [userSearch, setUserSearch] = useState("");
  const [profileSearch, setProfileSearch] = useState("");

  // ==========================================
  // NEW STATES FOR DROPDOWN FILTERING 🎛️
  // ==========================================
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  
  // Using viewMode to determine what we are looking at: 'none', 'users', or 'profiles'
  const [viewMode, setViewMode] = useState('none'); 

  // ==========================================
  // STATES FOR SEARCHING AND LINKING A UNIQUE PROFILE 🆔
  // ==========================================
  const [searchPersonalNo, setSearchPersonalNo] = useState("");
  const [linkedProfile, setLinkedProfile] = useState(null);
  const [profileSearchError, setProfileSearchError] = useState("");

  // ==========================================
  // STATES FOR PROFILES MODAL 📑
  // ==========================================
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

  // ==========================================
  // STATES FOR USERS MODAL 👤
  // ==========================================
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserEditMode, setIsUserEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "", 
    role_id: "3", 
    is_active: true
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
      loading && setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchUsers();
    fetchProfiles();
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

        return active ? "✅ Active" : "❌ Inactive";
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

  // ==========================================
  // MANAGEMENT OF HANDLE MORE FUNCTION 🛠️
  // ==========================================
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

      console.log("Clicked User Row ->", item.username, "| is_active value:", item.is_active);

      setNewUser({
        username: item.username || "",
        email: item.email || "",
        password: "", 
        role_id: mappedRoleId,
        is_active: item.is_active === true || item.is_active === 1 || String(item.is_active).toLowerCase() === 'true'
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
    setNewUser({
      username: "",
      email: "",
      password: "", 
      role_id: "3",
      is_active: true
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
    setNewUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
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

    const payload = {
      username: newUser.username,
      email: newUser.email,
      is_active: Boolean(newUser.is_active), 
      role_id: parseInt(newUser.role_id, 10),
      profile_id: linkedProfile ? linkedProfile.id : undefined, 
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

  // ==========================================
  // FIXED: MULTI-CRITERIA USER FILTER CHAIN
  // ==========================================
  const filteredUsers = users.filter((user) => {
    if (!user.username) return false;

    // 1. Text Search Filter Condition
    const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase().trim());

    // 2. Role Dropdown Filter Condition
    const matchesRole = roleFilter === "ALL" || 
      (user.role_name && user.role_name.toUpperCase() === roleFilter.toUpperCase());

    // 3. Status Dropdown Filter Condition
    const isActiveUser = user.is_active === true || user.is_active === 1 || String(user.is_active).toLowerCase() === "true";
    const matchesStatus = statusFilter === "ALL" || 
      (statusFilter === "ACTIVE" && isActiveUser) || 
      (statusFilter === "INACTIVE" && !isActiveUser);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // ==========================================
  // 🚀 FIXED: PROFILES MULTI-CRITERIA FILTER CHAIN
  // ==========================================
  const filteredProfiles = profiles.filter((profile) => {
    // 1. Text Search Filter Criteria Parsing (First/Last name, Full Name, ID, Phone)
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

    // 2. Gender Dropdown Filter Criterion
    const profileGender = profile.gender ? profile.gender.toUpperCase() : "";
    const matchesGender = genderFilter === "ALL" || profileGender === genderFilter.toUpperCase();

    return matchesSearch && matchesGender;
  });

  return (
    <div className="page-container">
      <div className="menu">
        {/* Users Section */}
        <div className="menu-bubble-information-buttons">
          <div className="menu-information">
            <p>Total Users: {users.length}</p>
            <p>Active: {users.filter((u) => u && (u.is_active === true || u.is_active === 1 || String(u.is_active).toLowerCase() === "true")).length}</p>
            <p>Inactive: {users.filter((u) => u && !(u.is_active === true || u.is_active === 1 || String(u.is_active).toLowerCase() === "true")).length}</p>
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
              <button className="menu-buttons" onClick={() => setViewMode('users')}>
                All Users
              </button>
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
              <button className="menu-buttons" onClick={openNewProfileModal}>
                New Profile
              </button>
              <button className="menu-buttons" onClick={() => setViewMode('profiles')}>
                All Profiles
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-area">
        {viewMode === 'users' && (
          <>
            <div className="content-area-header">
              <h1>User Accounts {`(Filtered: ${filteredUsers.length})`}</h1>
              
              {/* ==========================================
                  🚀 NEW DROPDOWN FILTERS SECTION FOR USERS
                  ========================================== */}
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
                    <option value="ACTIVE">✅ Active Only</option>
                    <option value="INACTIVE">❌ Inactive Only</option>
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
              
              {/* ==========================================
                  🚀 NEW DROPDOWN FILTERS SECTION FOR PROFILES
                  ========================================== */}
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

        {viewMode === 'none' && (
          <div className="empty-view-fallback">
            <p>Select One of the Options from the menu to display data.</p>
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL FOR CREATING / MODIFYING USER 👤
          ========================================== */}
      {isUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{isUserEditMode ? "Modify User Account" : "Create New User"}</h2>
              <button className="close-modal-btn" onClick={() => setIsUserModalOpen(false)}>X</button>
            </div>
            <form onSubmit={handleUserSubmit} className="modal-form">
              
              {!isUserEditMode ? (
                <div className="profile-verification-box">
                  <label>
                    Link Existing Profile (Unique Personal Number):
                  </label>
                  <div className="profile-verification-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Enter profile unique number..." 
                      value={searchPersonalNo} 
                      onChange={(e) => setSearchPersonalNo(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyProfile} 
                      className="profile-verify-action-btn"
                    >
                      Verify & Link
                    </button>
                  </div>
                  
                  {profileSearchError && (
                    <p className="profile-verification-error">
                      ⚠️ {profileSearchError}
                    </p>
                  )}
                  
                  {linkedProfile && (
                    <div className="profile-verification-success">
                      <p className="profile-verification-success-text">
                        ✅ Profile found and linked successfully!
                      </p>
                      <p className="profile-verification-success-subtext">
                        Person: <strong>{linkedProfile.first_name} {linkedProfile.last_name}</strong>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                linkedProfile && (
                  <div className="profile-readonly-box">
                    <h4>Linked Profile Information</h4>
                    <div className="profile-readonly-grid">
                      <div className="form-group-readonly">
                        <label>First Name:</label>
                        <input type="text" value={linkedProfile.first_name || ""} readOnly />
                      </div>
                      <div className="form-group-readonly">
                        <label>Last Name:</label>
                        <input type="text" value={linkedProfile.last_name || ""} readOnly />
                      </div>
                      <div className="form-group-readonly">
                        <label>Personal Number:</label>
                        <input type="text" value={linkedProfile.personal_no || ""} readOnly />
                      </div>
                      <div className="form-group-readonly">
                        <label>Gender:</label>
                        <input type="text" value={linkedProfile.gender || "Unspecified"} readOnly />
                      </div>
                    </div>
                  </div>
                )
              )}

              <div className="form-group">
                <label>Username:</label>
                <input type="text" name="username" value={newUser.username} onChange={handleUserInputChange} required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={newUser.email} onChange={handleUserInputChange} required />
              </div>

              {!isUserEditMode && (
                <div className="form-group">
                  <label>Password:</label>
                  <input type="password" name="password" value={newUser.password || ""} onChange={handleUserInputChange} required />
                </div>
              )}

              <div className="form-group">
                <label>Role:</label>
                <select name="role_id" value={newUser.role_id} onChange={handleUserInputChange}>
                  <option value="3">Patient</option>
                  <option value="2">Director</option>
                  <option value="4">Doctor</option>
                  <option value="5">Nurse</option>
                  <option value="1">Superuser</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  name="is_active" 
                  id="is_active"
                  checked={!!newUser.is_active} 
                  onChange={handleUserInputChange} 
                />
                <label htmlFor="is_active">
                  Account Active: {newUser.is_active ? "🟢 Yes" : "🔴 No"}
                </label>
              </div>
              
              <div className="modal-actions-space-between">
                <div className="modal-actions-left-cluster">
                  <button type="button" className="cancel-btn" onClick={() => setIsUserModalOpen(false)}>Cancel</button>
                  <button type="submit" className="save-btn">{isUserEditMode ? "Modify User Account" : "Create New User"}</button>
                </div>
                
                {isUserEditMode && (
                  <div>
                    <button 
                      type="button" 
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="password-trigger-btn"
                    >
                      {showPasswordForm ? "Hide Reset Form" : "Reset Password 🔑"}
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* ==========================================
                CAUTIONARY PASSWORD ALTERATION DISCLOSURE FORM
                ========================================== */}
            {isUserEditMode && showPasswordForm && (
              <div className="password-cautionary-box">
                <h4>⚠️ Security Override Protocol</h4>
                <p>
                  You are editing authentication parameters directly. Ensure the identity of the requesting user is fully verified before proceeding.
                </p>
                <form onSubmit={handlePasswordUpdateSubmit} className="password-cautionary-form">
                  <input 
                    type="password"
                    placeholder="Enter new account password..."
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    required
                  />
                  <button type="submit">Update Password</button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==========================================
          MODAL FOR CREATING / MODIFYING PROFILE 📑
          ========================================== */}
      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{isProfileEditMode ? "Modify Profile Details" : "Create New Profile"}</h2>
              <button className="close-modal-btn" onClick={() => setIsProfileModalOpen(false)}>X</button>
            </div>
            <form onSubmit={handleProfileSubmit} className="modal-form">
              <div className="form-group">
                <label>First Name:</label>
                <input type="text" name="first_name" value={newProfile.first_name} onChange={handleProfileInputChange} required />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input type="text" name="last_name" value={newProfile.last_name} onChange={handleProfileInputChange} required />
              </div>
              <div className="form-group">
                <label>Birth Date:</label>
                <input type="date" name="birth" value={newProfile.birth} onChange={handleProfileInputChange} />
              </div>
              <div className="form-group">
                <label>Gender:</label>
                <select name="gender" value={newProfile.gender} onChange={handleProfileInputChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Personal Number (ID):</label>
                <input type="text" name="personal_no" value={newProfile.personal_no} onChange={handleProfileInputChange} required disabled={isProfileEditMode} />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input type="text" name="phone_number" value={newProfile.phone_number} onChange={handleProfileInputChange} />
              </div>
              <div className="modal-actions">
                <div className="modal-actions-left-cluster">
                  <button type="button" className="cancel-btn" onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                  <button type="submit" className="save-btn">{isProfileEditMode ? "Modify Profile Details" : "Create New Profile"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}