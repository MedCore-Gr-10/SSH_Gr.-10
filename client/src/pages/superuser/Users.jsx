import { useEffect, useState } from "react";

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

  return (
    <div>
      <h1>Users</h1>
      <p>This page displays user information.</p>

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        users.map((user) => (
          <div key={user.id}>
            ID: {user.id}
          </div>
        ))
      )}
    </div>
  );
}