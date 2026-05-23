import React, { useEffect, useState } from "react";
import {
  createDirectorRequest,
  getDirectorRequestRecipients,
  getDirectorRequests,
} from "../../services/directorRequestsApi";
import "./DirectorMakeRequest.css";

export default function DirectorMakeRequest() {
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [history, recipientList] = await Promise.all([
        getDirectorRequests(),
        getDirectorRequestRecipients(),
      ]);
      setRequests(history || []);
      setRecipients(recipientList || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!receiverId) return setError("Please select a recipient");
    if (!message.trim()) return setError("Message cannot be empty");
    setSubmitting(true);
    try {
      await createDirectorRequest({ receiver_id: receiverId, message: message.trim() });
      setMessage("");
      setReceiverId("");
      setSuccess("Request sent successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getPersonLabel = (user) => {
    if (!user) return "Unknown user";
    const role = user.role ? ` · ${user.role}` : "";
    const email = user.email ? ` · ${user.email}` : "";
    return `${user.name || user.username}${role}${email}`;
  };

  return (
    <div className="director-page-wrapper">
      <h1>Director Make Request</h1>
      <p>Submit requests for system changes or administrative support.</p>

      <div className="request-grid">
        <div className="director-card">
          <h2>Create New Request</h2>
          <form onSubmit={submit} className="request-form">
            <label htmlFor="request-recipient">Recipient</label>
            <select
              id="request-recipient"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
            >
              <option value="">Select recipient</option>
              {recipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {getPersonLabel(recipient)}
                </option>
              ))}
            </select>

            <label htmlFor="request-message">Message</label>
            <textarea
              id="request-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <div className="request-actions">
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Submit Request"}
              </button>
            </div>
            {success && <div className="director-message success">{success}</div>}
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
                  <div className="request-recipient-line">
                    To: {r.receiver?.username || r.receiver_id}
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
