import React, { useEffect, useState } from "react";
import { getDirectorRequests, createDirectorRequest } from "../../services/directorRequestsApi";
import "./DirectorMakeRequest.css";

export default function DirectorMakeRequest() {
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDirectorRequests();
      setRequests(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return setError("Message cannot be empty");
    try {
      await createDirectorRequest({ message });
      setMessage("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="director-page-wrapper">
      <h1>Director Make Request</h1>
      <p>Submit requests for system changes or administrative support.</p>

      <div className="request-grid">
        <div className="director-card">
          <h2>Create New Request</h2>
          <form onSubmit={submit} className="request-form">
            <label>Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
            <div className="request-actions">
              <button className="btn-primary" type="submit">Submit Request</button>
            </div>
            {error && <div className="director-message error">{error}</div>}
          </form>
        </div>

        <div className="director-card">
          <h2>Request History</h2>
          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            <ul className="request-list">
              {requests.map((r) => (
                <li key={r.id} className="request-item">
                  <div className="request-meta">
                    <strong>{r.sender?.username || r.sender_id}</strong>
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p>{r.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
