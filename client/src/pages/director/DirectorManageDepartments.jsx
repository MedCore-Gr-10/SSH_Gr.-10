import React, { useEffect, useState } from "react";
import {
  activateDirectorDepartment,
  deleteDirectorDepartment,
  getDirectorDepartmentCatalog,
} from "../../services/directorDepartmentsApi";
import "./DirectorManageDepartments.css";

export default function DirectorManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDirectorDepartmentCatalog();
      setDepartments(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load departments.");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activate = async (id) => {
    setSavingId(id);
    setError("");
    try {
      await activateDirectorDepartment(id);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to activate department.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Deactivate this department for your hospital?")) return;
    setSavingId(id);
    setError("");
    try {
      await deleteDirectorDepartment(id);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to deactivate department.");
    } finally {
      setSavingId(null);
    }
  };

  const activeCount = departments.filter((department) => department.is_active).length;

  return (
    <div className="director-departments-page">
      <div className="director-departments-header">
        <div>
          <h2>Manage Departments</h2>
          <p>Select which superuser-created departments are active in your hospital.</p>
        </div>
        <span className="departments-count">{activeCount} active</span>
      </div>

      {error && <div className="departments-error">{error}</div>}

      <div className="content-scroll">
        <table className="departments-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Status</th>
              <th>Staff</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Loading...</td></tr>
            ) : departments.length ? (
              departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.department_name}</td>
                  <td>
                    <span className={department.is_active ? "status-active" : "status-inactive"}>
                      {department.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{department.staff_count}</td>
                  <td>
                    {department.is_active ? (
                      <button
                        className="btn-secondary"
                        disabled={savingId === department.id || department.staff_count > 0}
                        title={department.staff_count > 0 ? "Remove staff assignments before deactivating" : "Deactivate department"}
                        onClick={() => remove(department.id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        disabled={savingId === department.id}
                        onClick={() => activate(department.id)}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4}>No departments have been created by the superuser yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

}
