import { useEffect, useState } from "react";
import "./../CSSpages/superuser/Users.css";
import Button1 from "../../components/JSXcomponents/Button1.jsx";
import GenericTable from "../../components/JSXcomponents/GenericTable.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Përdorim viewMode për të dritur çfarë po shohim: 'none', 'users', ose 'profiles'
  const [viewMode, setViewMode] = useState('none'); 

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        // Kontrollo strukturen e data.data ose data nese vjen direkt
        setUsers(data.data || data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch Profiles
  useEffect(() => {
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
    fetchProfiles();
  }, []);

  // Kolonat për Modelin e User-it (bazuar në skemën tënde)
  const userColumns = [
    { header: "UUID", key: "id" },
    { header: "Username", key: "username" },
    { header: "Role ID", key: "role_id" },
    { header: "Status", key: "is_active", render: (val) => (val ? "✅ Active" : "❌ Inactive") },
  ];

  const profileColumns = [
    { header: "ID", key: "id" },
    { header: "First Name", key: "first_name" },
    { header: "Last Name", key: "last_name" },
    { header: "Gender", key: "gender" },
    { header: "Phone", key: "phone_number" },
    { header: "Personal No.", key: "personal_no" },
  ];

  const handleMore = (item) => {
    alert("Zgjodhët elementin me ID: " + item.id);
  };

  return (
    <div className="page-container">
      <div className="menu">
        {/* Seksioni Users */}
        <div className="menu-bubble-information-buttons">
          <div className="menu-information">
            <p>Total Users: {users.length}</p>
            {/* Kujdes: modeli yt perdor is_active, jo active */}
            <p>Active: {users.filter((u) => u.is_active).length}</p>
            <p>Inactive: {users.filter((u) => !u.is_active).length}</p>
          </div>
          <div className="menu-search-button">
            <input type="text" placeholder="Search users..." className="search-users" />
            <div className="buttons-list">
              <button className="menu-buttons">New User</button>
              <button className="menu-buttons" onClick={() => setViewMode('users')}>
                All Users
              </button>
            </div>
          </div>
        </div>

        {/* Seksioni Profiles */}
        <div className="menu-bubble-information-buttons">
          <div className="menu-information">
            <p>Total Profiles: {profiles.length}</p>
          </div>
          <div className="menu-search-button">
            <input type="text" placeholder="Search profiles..." className="search-users" />
            <div className="buttons-list">
              <button className="menu-buttons">New Profile</button>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1>User Accounts</h1>
              <button className="more-button" onClick={() => setViewMode('none')}>Close X</button>
            </div>
            <GenericTable columns={userColumns} data={users} onMoreClick={handleMore} />
          </>
        )}

        {viewMode === 'profiles' && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1>Profiles</h1>
              <button className="more-button" onClick={() => setViewMode('none')}>Close X</button>
            </div>
            <GenericTable columns={profileColumns} data={profiles} onMoreClick={handleMore} />
          </>
        )}

        {viewMode === 'none' && (
          <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%', 
              textAlign: 'center' 
          }}>
            <p>Select One of the Options from the menu to display data.</p>
          </div>
        )}
      </div>
    </div>
  );
}