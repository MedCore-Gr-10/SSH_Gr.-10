import { useEffect, useState } from "react";
import "./../CSSpages/superuser/Users.css";
import Button1 from "../../components/JSXcomponents/Button1.jsx";
import GenericTable from "../../components/JSXcomponents/GenericTable.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfiles, setShowProfiles] = useState(false);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users");
        const data = await res.json();
        setUsers(data.data || []);
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
        const res = await fetch("http://localhost:3000/api/profiles");
        const data = await res.json();
        setProfiles(data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const profileColumns = [
    { header: "ID", key: "id" },
    { header: "First Name", key: "first_name" },
    { header: "Last Name", key: "last_name" },
    { header: "Gender", key: "gender" },
    { header: "Phone", key: "phone_number" },
    { header: "Personal No.", key: "personal_no" },
    { header: "Birth Date", key: "birth_date" },
  ];

  const handleMore = (item) => {
    alert("U zgjodh ID: " + item.id);
  };

  return (
    <div className="page-container">
      <div className="menu">
        {/* Seksioni Users */}
        <div className="menu-bubble-information-buttons">
          <div className="menu-information">
            <p>Total Users: {users.length}</p>
            <p>Active Users: {users.filter((user) => user.active).length}</p>
            <p>Inactive Users: {users.filter((user) => !user.active).length}</p>
          </div>
          <div className="menu-search-button">
            <input type="text" placeholder="Search users..." className="search-users" />
            <div className="buttons-list">
              <button className="menu-buttons">New User</button>
              <button className="menu-buttons">All Users</button>
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
              <button className="menu-buttons" onClick={() => setShowProfiles(true)}>
                All Profiles
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-area">
        {showProfiles ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1>Profiles</h1>

            </div>
            <GenericTable 
              columns={profileColumns} 
              data={profiles} 
              onMoreClick={handleMore} 
            />
          </>
        ) : (
          <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%', 
              textAlign: 'center' 
          }}>
            <p>Select One of the Options</p>
          </div>
        )}
      </div>
    </div> // Kjo div mbyllese mungonte ne kodin tend!
  );
}