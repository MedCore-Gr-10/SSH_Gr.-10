import React, { useEffect, useState } from "react";
import {
  createDirectorPatient,
  deleteDirectorPatient,
  getDirectorPatients,
  updateDirectorPatient,
} from "../../services/directorApi.js";
import "./DirectorPatients.css";

const initialFormState = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  birth: "",
  gender: "",
  personal_no: "",
  phone_number: "",
};

export default function DirectorPatients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDirectorPatients();
      setPatients(data || []);
    } catch (err) {
      setError(err.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const resetForm = () => {
    setSelectedPatientId(null);
    setForm(initialFormState);
    setMessage("");
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = { ...form };
      if (selectedPatientId && !payload.password) {
        delete payload.password;
      }

      if (selectedPatientId) {
        await updateDirectorPatient(selectedPatientId, payload);
        setMessage("Patient updated successfully.");
      } else {
        await createDirectorPatient(payload);
        setMessage("Patient created successfully.");
      }

      resetForm();
      await loadPatients();
    } catch (err) {
      setError(err.message || "Unable to save patient.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    const profile = patient.users_profiles?.[0];
    setSelectedPatientId(patient.id);
    setForm({
      username: patient.username || "",
      email: profile?.email || "",
      password: "",
      first_name: profile?.profiles?.first_name || "",
      last_name: profile?.profiles?.last_name || "",
      birth: profile?.profiles?.birth?.split("T")[0] || "",
      gender: profile?.profiles?.gender || "",
      personal_no: profile?.profiles?.personal_no || "",
      phone_number: profile?.profiles?.phone_number || "",
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient record?")) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await deleteDirectorPatient(id);
      setMessage("Patient deleted successfully.");
      await loadPatients();
    } catch (err) {
      setError(err.message || "Unable to delete patient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="director-patients-page">
      <div className="director-patients-header">
        <div>
          <h1>Director Patient Management</h1>
          <p>Manage patients within your hospital and keep records in sync.</p>
        </div>
        <button type="button" onClick={resetForm}>
          New patient
        </button>
      </div>

      <div className="director-patients-grid">
        <section className="director-section">
          <h2>Patient directory</h2>
          <div className="content-scroll">
            {loading && <p>Loading patients…</p>}
            {!loading && patients.length === 0 && <p>No patients found.</p>}
            {!loading && patients.length > 0 && (
              <table className="director-patient-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Full name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const profile = patient.users_profiles?.[0];
                    const fullName = `${profile?.profiles?.first_name || ""} ${profile?.profiles?.last_name || ""}`.trim();
                    return (
                      <tr key={patient.id}>
                        <td data-label="Username">{patient.username}</td>
                        <td data-label="Email">{profile?.email || "-"}</td>
                        <td data-label="Full name">{fullName || "-"}</td>
                        <td data-label="Actions">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => handleEdit(patient)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => handleDelete(patient.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="director-section">
          <h2>{selectedPatientId ? "Edit patient" : "Create a patient"}</h2>
          <div className="content-scroll">
            <form className="director-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input name="username" value={form.username} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            {!selectedPatientId && (
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </label>
            )}
            <label>
              First name
              <input name="first_name" value={form.first_name} onChange={handleChange} />
            </label>
            <label>
              Last name
              <input name="last_name" value={form.last_name} onChange={handleChange} />
            </label>
            <label>
              Birth date
              <input name="birth" type="date" value={form.birth} onChange={handleChange} />
            </label>
            <label>
              Gender
              <input name="gender" value={form.gender} onChange={handleChange} />
            </label>
            <label>
              Personal No.
              <input name="personal_no" value={form.personal_no} onChange={handleChange} />
            </label>
            <label>
              Phone number
              <input name="phone_number" value={form.phone_number} onChange={handleChange} />
            </label>

            <div className="director-form-actions">
              <button className="primary" type="submit" disabled={loading}>
                {selectedPatientId ? "Save changes" : "Create patient"}
              </button>
              <button className="secondary" type="button" onClick={resetForm}>
                Clear
              </button>
            </div>
            </form>

            {message && <div className="director-message success">{message}</div>}
            {error && <div className="director-message error">{error}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
