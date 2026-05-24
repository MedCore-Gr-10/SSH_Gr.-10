import "../../CSSpages/superuser/SystemLogs.css";
import React, { useState, useEffect } from "react";
import GenericTable from "../../../components/JSXcomponents/GenericTable.jsx";
import { superuserFetch } from "../../../services/superuserApi.js";

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const columns = [
    { header: "ID", key: "id" },
    { 
      header: "Timestamp", 
      key: "timestamp",
      render: (val) => val ? new Date(val).toLocaleString() : "-" 
    },
    { header: "User / Actor", key: "username" },
    { header: "Action", key: "action" },
  ];

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await superuserFetch("/system-logs");
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
      } else {
        setError(result.message || "Failed to load system logs.");
      }
    } catch (err) {
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleMoreClick = (item) => {
    setSelectedLog(item);
    setIsModalOpen(true);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id?.toString().includes(searchTerm);

    const logDate = log.timestamp ? new Date(log.timestamp).toISOString().split('T')[0] : "";
    const matchesDate = filterDate === "" || logDate === filterDate;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="page-container">  
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">System Logs</h2>
          <p className="page-subtitle">Monitored system events, user actions, and application errors.</p>
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="controls-wrapper">
        <div className="search-bar-container">
          <span className="entries-counter">
            Showing {filteredLogs.length} of {logs.length} logs
          </span>
          
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="search-input date-input"
          />

          <input
            type="text"
            placeholder="🔍 Search by user, action, module or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input text-input"
          />
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading system logs...</p>
      ) : filteredLogs.length === 0 ? (
        <div className="no-results-card">
          <p>No logs found matching your criteria.</p>
        </div>
      ) : (
        <GenericTable 
          columns={columns} 
          data={filteredLogs} 
          onMoreClick={handleMoreClick} 
        />
      )}


    {isModalOpen && selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title-text">
            Log Entry Details (ID: {selectedLog.id})
            </h3>                
              <div><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</div>
              <div><strong>Actor / User:</strong> @{selectedLog.username}</div>
              <div><strong>Action Executed:</strong> {selectedLog.action}</div>
              <strong>Full Message:</strong>
                <pre className="log-details-pre">
                  {selectedLog.details || "No additional metadata."}
                </pre>
                <button onClick={() => setIsModalOpen(false)}>Close</button>
              </div>
            </div>
          )}
    </div>
  );
}
