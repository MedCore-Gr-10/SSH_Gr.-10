import React, { useEffect, useState } from "react";
import {
  getDirectorStaff,
  createDirectorStaff,
  updateDirectorStaff,
  deleteDirectorStaff,
} from "../../services/directorStaffApi";
import "./DirectorStaff.css";

const initialFormState = {
  username: "",
  email: "",
  password: "",
  role: "doctor",
  department_id: "",
  first_name: "",
  last_name: "",
  phone_number: "",
};

export default function DirectorStaff() {
  const [staffList, setStaffList] = useState([]);
  const [formValues, setFormValues] = useState(initialFormState);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStaff = async () => {
    try {
      const staff = await getDirectorStaff();
      setStaffList(staff);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (staff) => {
    const profile = staff.users_profiles?.[0] || {};
    setSelectedStaffId(staff.id);
    setFormValues({
      username: staff.username || "",
      email: profile.email || "",
      password: "",
      role: staff.roles?.role_name?.toLowerCase() || "doctor",
      department_id: staff.staff_hospitals_departments?.[0]?.department_id || "",
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone_number: profile.phone_number || "",
    });
    setMessage(null);
    setError(null);
  };

  const handleReset = () => {
    setSelectedStaffId(null);
    setFormValues(initialFormState);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (selectedStaffId) {
        await updateDirectorStaff(selectedStaffId, formValues);
        setMessage("Staff member updated successfully.");
      } else {
        await createDirectorStaff(formValues);
        setMessage("Staff member created successfully.");
      }
      handleReset();
      await loadStaff();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) {
      return;
    }

    try {
      await deleteDirectorStaff(id);
      setMessage("Staff member removed.");
      setError(null);
      await loadStaff();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="director-staff-page">
      <div className="director-staff-header">
        <div>
          <h1>Staff Management</h1>
          <p>View, register, and assign doctors and nurses for your hospital.</p>
        </div>
      </div>

      <div className="director-staff-grid">
        <section className="director-staff-section content-scroll">
          <h2>Staff roster</h2>
          <table className="director-staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan="5">No staff members found.</td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const profile = staff.users_profiles?.[0] || {};
                  const assignment = staff.staff_hospitals_departments?.[0] || {};

                  return (
                    <tr key={staff.id}>
                      <td data-label="Name">{`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || staff.username}</td>
                      <td data-label="Email">{profile.email || "—"}</td>
                      <td data-label="Role">{staff.roles?.role_name || "—"}</td>
                      <td data-label="Department">{assignment.department_id || "—"}</td>
                      <td data-label="Actions">
                        <button className="edit-button" onClick={() => handleEdit(staff)}>
                          Edit
                        </button>
                        <button className="delete-button" onClick={() => handleDelete(staff.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        <section className="director-staff-section content-scroll">
          <h2>{selectedStaffId ? "Edit staff member" : "Register new staff"}</h2>
          <form className="director-staff-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                name="username"
                value={formValues.username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </label>

            <label>
              Email
              <input
                name="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="Enter email"
                type="email"
              />
            </label>

            <label>
              Password
              <input
                name="password"
                value={formValues.password}
                onChange={handleChange}
                placeholder={selectedStaffId ? "Leave blank to keep current password" : "Enter password"}
                type="password"
              />
            </label>

            <label>
              Role
              <select name="role" value={formValues.role} onChange={handleChange}>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
              </select>
            </label>

            <label>
              Department ID
              <input
                name="department_id"
                value={formValues.department_id}
                onChange={handleChange}
                placeholder="Department ID"
                type="number"
              />
            </label>

            <label>
              First name
              <input
                name="first_name"
                value={formValues.first_name}
                onChange={handleChange}
                placeholder="First name"
              />
            </label>

            <label>
              Last name
              <input
                name="last_name"
                value={formValues.last_name}
                onChange={handleChange}
                placeholder="Last name"
              />
            </label>

            <label>
              Phone number
              <input
                name="phone_number"
                value={formValues.phone_number}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </label>

            <div className="director-staff-actions">
              <button className="primary" type="submit" disabled={isSubmitting}>
                {selectedStaffId ? "Update staff" : "Create staff"}
              </button>
              <button className="secondary" type="button" onClick={handleReset}>
                Reset form
              </button>
            </div>
          </form>

          {message && <div className="director-message success">{message}</div>}
          {error && <div className="director-message error">{error}</div>}
        </section>
      </div>
    </div>
  );
}
