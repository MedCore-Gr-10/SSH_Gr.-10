import { useEffect, useState } from "react";
import "./../CSSpages/superuser/Users.css";
import Button1 from "../../components/JSXcomponents/Button1.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);


  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("http://localhost:3000/api/users");
      const data = await res.json();
      console.log("FULL RESPONSE:", data);
console.log("USERS:", data.data);

      setUsers(data.data);
    };

    fetchUsers();
  }, []);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Changed from axios.get to fetch()
        const res = await fetch("http://localhost:3000/api/profiles");
        const data = await res.json();
        
        // Use data.data to match your controller's structure
        setProfiles(data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="page-container">
      <div className="menu"> 
        <div className="menu-bubble-information-buttons">
          <div className="menu-information">
            <p>Total Users: {users.length}</p>
            <p>Active Users: {users.filter(user => user.active).length}</p>
            <p>Inactive Users: {users.filter(user => !user.active).length}</p>
          </div>
          <div className="menu-search-button">
            <input type="text" placeholder="Search users..." className="search-users" onChange={(e) => console.log("Search input:", e.target.value)} />
            <Button1 text="Create New User" onClick={() => console.log(" clicked")} />
          </div>
        </div>
        <div className="menu-bubble-information-buttons">
          <div className="menu-information">
            <p>Total Profiles: {profiles.length}</p>
          </div>
          <div className="menu-search-button">
            <input type="text" placeholder="Search profiles..." className="search-users" onChange={(e) => console.log("Search input:", e.target.value)} />
            <Button1 text="Create New Profile" onClick={() => console.log(" clicked")} />
          </div>
        </div>

      </div>
      <div className="content-area"> 
        <h1>Profiles</h1>
        
        <table className="profile-table">
          <thead>
            <tr>
              <th>ID</th> {/* Added */}
              <th>First Name</th>
              <th>Last Name</th> {/* Added */}
              <th>Gender</th>
              <th>Phone</th>
              <th>Personal No.</th>
              <th>Birth Date</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>{profile.id}</td> {/* Added */}
                  <td>{profile.first_name}</td>
                  <td>{profile.last_name}</td> {/* Added */}
                  <td>{profile.gender}</td>
                  <td>{profile.phone_number}</td>
                  <td><code>{profile.personal_no}</code></td>
                  <td>{new Date(profile.birth_date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              /* colSpan updated to 7 to match the new number of columns */
              <tr><td colSpan="7">No profiles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      </div>
  );
}