import React, { useState, useEffect } from "react";
import GenericTable from "../../components/JSXcomponents/GenericTable.jsx";
import "./../CSSpages/superuser/ManageSpecializatoins.css"; // Përdor të njëjtin skedar stili si dizajni bazë

export default function SystemLogs() {
  // Data and structural states
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // States vetëm për shikimin e detajeve të plota të një Log-u 📄
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Përcaktimi i kolonave për System Logs
  const columns = [
    { header: "ID", key: "id" },
    { 
      header: "Timestamp", 
      key: "timestamp",
      // Render i thjeshtë për të formatuar datën dhe kohën saktë
      render: (val) => val ? new Date(val).toLocaleString() : "-" 
    },
    { 
      header: "Level", 
      key: "level",
      // Shton ngjyra sipas nivelit (INFO, WARNING, ERROR) duke përdorur klasa ekzistuese ose inline styles
      render: (val) => {
        const badgeColor = val === "ERROR" ? "#e53e3e" : val === "WARNING" ? "#dd6b20" : "#3182ce";
        return <span style={{ color: badgeColor, fontWeight: "bold" }}>{val}</span>;
      }
    },
    { header: "User / Actor", key: "username" },
    { header: "Action", key: "action" },
    { header: "Module / Component", key: "module" }
  ];

  // Marrja e të dhënave nga API
  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/system-logs");
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

  // Kur klikohet butoni "..." (More), hapet modal-i me detajet e plota pa asnjë formë editimi
  const handleMoreClick = (item) => {
    setSelectedLog(item);
    setIsModalOpen(true);
  };

  // Filtrimi në kohë reale sipas përdoruesit, aksionit, modulit ose ID-së
  const filteredLogs = logs.filter((log) =>
    log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.id?.toString().includes(searchTerm)
  );

  return (
    <div className="page-container">  
      {/* HEADER-I HORIZONTAL */}
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">System Logs</h2>
          <p className="page-subtitle">Monitored system events, user actions, and application errors.</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* SEKSIONI I FILTRIMIT DHE NUMRIMIT */}
      <div className="controls-wrapper" style={{ justifyContent: "flex-end" }}>
        {/* Kemi hequr formën e krijimit plotësisht dhe kemi lënë vetëm pjesën e kërkimit */}
        <div className="search-bar-container" style={{ width: "100%", justifyContent: "space-between" }}>
          <span className="entries-counter">
            Showing {filteredLogs.length} of {logs.length} system logs
          </span>
          <input
            type="text"
            placeholder="🔍 Search by user, action, module or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ minWidth: "350px" }}
          />
        </div>
      </div>

      {/* TABELA E LOG-EVE */}
      {loading ? (
        <p className="loading-text">Loading system logs...</p>
      ) : filteredLogs.length === 0 ? (
        <div className="no-results-card">
          <p className="no-results-title">No logs found</p>
          <p className="no-results-desc">We couldn't find any log entry matching "{searchTerm}".</p>
        </div>
      ) : (
        <GenericTable 
          columns={columns} 
          data={filteredLogs} 
          onMoreClick={handleMoreClick} 
        />
      )}

      {/* MODAL JAVASCRIPT / JSX LAYER (VETËM PËR T'I LEXUAR DETAILS) */}
      {isModalOpen && selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <h3 className="modal-title-text" style={{ borderBottom: "1px solid #eef2f5", paddingBottom: "10px" }}>
              Log Entry Details (ID: {selectedLog.id})
            </h3>
            
            <div className="modal-table-container" style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
              </div>
              <div>
                <strong>Log Level:</strong> <span style={{ fontWeight: "bold" }}>{selectedLog.level}</span>
              </div>
              <div>
                <strong>Actor / User:</strong> @{selectedLog.username}
              </div>
              <div>
                <strong>Action Executed:</strong> {selectedLog.action}
              </div>
              <div>
                <strong>Target Module:</strong> {selectedLog.module}
              </div>
              
              {/* Seksioni i rëndësishëm për loget: Përshkrimi i plotë apo mesazhi i gabimit */}
              <div style={{ marginTop: "10px" }}>
                <strong>Full Message / Payload:</strong>
                <pre style={{ 
                  backgroundColor: "#f7fafc", 
                  padding: "12px", 
                  borderRadius: "6px", 
                  marginTop: "5px",
                  whiteSpace: "pre-wrap",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  border: "1px solid #e2e8f0",
                  maxHeight: "200px",
                  overflowY: "auto"
                }}>
                  {selectedLog.details || "No additional metadata attached to this log."}
                </pre>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: "20px", borderTop: "1px solid #eef2f5", paddingTop: "12px" }}>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}