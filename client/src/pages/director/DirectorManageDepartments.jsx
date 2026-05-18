import React, { useEffect, useState } from "react";
import {
  getDirectorDepartments,
  createDirectorDepartment,
  updateDirectorDepartment,
  deleteDirectorDepartment,
} from "../../services/directorDepartmentsApi";
import "./DirectorManageDepartments.css";

export default function DirectorManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ department_name: "" });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDirectorDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error(err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDirectorDepartment(editingId, form);
      } else {
        await createDirectorDepartment(form);
      }
      setForm({ department_name: "" });
      setEditingId(null);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (dept) => {
    setEditingId(dept.id);
    setForm({ department_name: dept.department_name });
  };

  const remove = async (id) => {
    if (!window.confirm("Remove department from hospital?")) return;
    try {
      await deleteDirectorDepartment(id);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="director-departments-page">
      <div className="director-departments-header">
        <h2>Manage Departments</h2>
      </div>

      <div className="director-departments-grid">
        <div className="content-scroll">
          <table className="departments-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2}>Loading...</td></tr>
              ) : departments.length ? (
                departments.map((d) => (
                  <tr key={d.id}>
                    <td>{d.department_name}</td>
                    <td>
                      <button className="btn-secondary" onClick={() => startEdit(d)}>Edit</button>
                      <button className="btn-primary" onClick={() => remove(d.id)}>Remove</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2}>No departments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="departments-form">
          <form onSubmit={submit}>
            <div>
              <label>Department name</label>
              <input
                value={form.department_name}
                onChange={(e) => setForm({ department_name: e.target.value })}
                placeholder="e.g. Cardiology"
                required
              />
            </div>
            <div className="departments-actions">
              <button className="btn-primary" type="submit">{editingId ? 'Save' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => { setForm({ department_name: '' }); setEditingId(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

}
