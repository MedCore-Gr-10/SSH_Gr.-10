import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext.jsx";
import {
  createDirectorRequest,
  getDirectorRequestRecipients,
  getDirectorRequests,
} from "../../../services/directorRequestsApi.js";
import "../../CSSpages/sidebar-pages/MakeRequest.css";

export default function MakeRequest() {
  const location = useLocation();
  const { user } = useAuth();
  const role = (location.state?.role || user?.role || "").toLowerCase();

  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [recipientType, setRecipientType] = useState("staff");
  const [staffRecipients, setStaffRecipients] = useState([]);
  const [patientResults, setPatientResults] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [sentPage, setSentPage] = useState(0);
  const [receivedPage, setReceivedPage] = useState(0);
  const receivedSectionRef = useRef(null);

  const canSearchPatients = ["doctor", "director", "superuser"].includes(role);
  const receivedRequests = useMemo(
    () => requests.filter((request) => request.receiver_id === user?.id),
    [requests, user?.id],
  );
  const sentRequests = useMemo(
    () => requests.filter((request) => request.sender_id === user?.id),
    [requests, user?.id],
  );
  const sentPageCount = Math.max(1, Math.ceil(sentRequests.length / 5));
  const visibleSentRequests = sentRequests.slice(sentPage * 5, sentPage * 5 + 5);
  const receivedPageCount = Math.max(1, Math.ceil(receivedRequests.length / 6));
  const visibleReceivedRequests = receivedRequests.slice(receivedPage * 6, receivedPage * 6 + 6);

  const selectedPatient = useMemo(
    () => patientResults.find((patient) => patient.id === receiverId),
    [patientResults, receiverId],
  );

  const getPersonLabel = (person) => {
    if (!person) return "Unknown user";
    const roleLabel = person.role ? ` · ${person.role}` : "";
    const email = person.email ? ` · ${person.email}` : "";
    return `${person.name || person.username}${roleLabel}${email}`;
  };

  const load = async () => {
    setLoading(true);
    setLoadingRecipients(true);
    setError(null);

    try {
      const [history, recipientList] = await Promise.all([
        getDirectorRequests(),
        getDirectorRequestRecipients({ type: "staff" }),
      ]);
      setRequests(history || []);
      setStaffRecipients(recipientList || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (sentPage > sentPageCount - 1) {
      setSentPage(Math.max(0, sentPageCount - 1));
    }
  }, [sentPage, sentPageCount]);

  useEffect(() => {
    if (receivedPage > receivedPageCount - 1) {
      setReceivedPage(Math.max(0, receivedPageCount - 1));
    }
  }, [receivedPage, receivedPageCount]);

  useEffect(() => {
    if (!location.hash && !location.state?.replyToUserId) return;

    const timeout = setTimeout(() => {
      receivedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

    return () => clearTimeout(timeout);
  }, [location.hash, location.state?.replyToUserId, requests.length]);

  useEffect(() => {
    const replyToUserId = location.state?.replyToUserId;
    if (!replyToUserId || staffRecipients.length === 0) return;

    const recipient = staffRecipients.find((staff) => staff.id === replyToUserId);
    if (recipient) {
      setRecipientType("staff");
      setReceiverId(replyToUserId);
    }
  }, [location.state?.replyToUserId, staffRecipients]);

  useEffect(() => {
    if (!canSearchPatients || recipientType !== "patient") return;

    const trimmedSearch = patientSearch.trim();
    setReceiverId("");

    if (trimmedSearch.length < 2) {
      setPatientResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingPatients(true);
      setError(null);

      try {
        const results = await getDirectorRequestRecipients({
          type: "patient",
          search: trimmedSearch,
        });
        setPatientResults(results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setSearchingPatients(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [canSearchPatients, patientSearch, recipientType]);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!receiverId) {
      setError("Please select a recipient.");
      return;
    }

    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    setSubmitting(true);

    try {
      await createDirectorRequest({ receiver_id: receiverId, message: message.trim() });
      window.dispatchEvent(new Event("request-created"));
      setMessage("");
      setReceiverId("");
      setPatientSearch("");
      setPatientResults([]);
      setSuccess("Request sent successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecipientTypeChange = (type) => {
    setRecipientType(type);
    setReceiverId("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="make-request-container">
      <h1>Make a Request</h1>
      <p>Send a request to an available recipient based on your role.</p>

      <div className="request-grid">
        <div className="make-request-card">
          <h2>Create New Request</h2>
          <form onSubmit={submit} className="request-form">
            {canSearchPatients && (
              <div className="recipient-toggle" aria-label="Recipient type">
                <button
                  type="button"
                  className={recipientType === "staff" ? "active" : ""}
                  onClick={() => handleRecipientTypeChange("staff")}
                >
                  Staff
                </button>
                <button
                  type="button"
                  className={recipientType === "patient" ? "active" : ""}
                  onClick={() => handleRecipientTypeChange("patient")}
                >
                  Patient
                </button>
              </div>
            )}

            {recipientType === "patient" && canSearchPatients ? (
              <div>
                <label htmlFor="patient-search">Search Patient</label>
                <input
                  id="patient-search"
                  className="form-input"
                  type="search"
                  value={patientSearch}
                  onChange={(event) => setPatientSearch(event.target.value)}
                  placeholder="Search by name, username, or email"
                  disabled={submitting}
                />

                <div className="patient-results">
                  {searchingPatients ? (
                    <p>Searching patients...</p>
                  ) : patientSearch.trim().length < 2 ? (
                    <p>Type at least 2 characters to search.</p>
                  ) : patientResults.length === 0 ? (
                    <p>No matching patients found.</p>
                  ) : (
                    patientResults.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        className={receiverId === patient.id ? "patient-result selected" : "patient-result"}
                        onClick={() => setReceiverId(patient.id)}
                      >
                        {getPersonLabel(patient)}
                      </button>
                    ))
                  )}
                </div>

                {selectedPatient && (
                  <div className="selected-recipient">
                    Selected: {getPersonLabel(selectedPatient)}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="request-recipient">Recipient</label>
                <select
                  id="request-recipient"
                  value={receiverId}
                  onChange={(event) => setReceiverId(event.target.value)}
                  disabled={submitting || loadingRecipients || staffRecipients.length === 0}
                  required
                >
                  <option value="">Select recipient</option>
                  {staffRecipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {getPersonLabel(recipient)}
                    </option>
                  ))}
                </select>
                {loadingRecipients ? (
                  <p className="empty-help">Loading recipients...</p>
                ) : staffRecipients.length === 0 && (
                  <p className="empty-help">
                    No staff recipients are available for your role and hospital.
                  </p>
                )}
              </div>
            )}

            <label htmlFor="request-message">Message</label>
            <textarea
              id="request-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              disabled={submitting}
              placeholder="Type your request here."
            />

            <div className="request-actions">
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Submit Request"}
              </button>
            </div>

            {success && <div className="request-message success">{success}</div>}
            {error && <div className="request-message error">{error}</div>}
          </form>
        </div>

        <div className="make-request-card request-history-card">
          <h2>Request History</h2>
          {loading ? (
            <p>Loading requests...</p>
          ) : sentRequests.length === 0 ? (
            <p>No sent requests found.</p>
          ) : (
            <>
              <ul className="request-list request-list-paged sent">
                {visibleSentRequests.map((request) => (
                  <li key={request.id} className="request-item">
                    <div className="request-meta">
                      <strong>{request.sender?.username || request.sender_id}</strong>
                      <span>{new Date(request.created_at).toLocaleString()}</span>
                    </div>
                    <div className="request-recipient-line">
                      To: {request.receiver?.username || request.receiver_id}
                    </div>
                    <p>{request.message}</p>
                  </li>
                ))}
              </ul>

              {sentRequests.length > 5 && (
                <div className="request-pagination">
                  <button
                    type="button"
                    aria-label="Show newer sent requests"
                    onClick={() => setSentPage((page) => Math.max(0, page - 1))}
                    disabled={sentPage === 0}
                  >
                    &lt;
                  </button>
                  <span>
                    {sentPage + 1} / {sentPageCount}
                  </span>
                  <button
                    type="button"
                    aria-label="Show older sent requests"
                    onClick={() => setSentPage((page) => Math.min(sentPageCount - 1, page + 1))}
                    disabled={sentPage >= sentPageCount - 1}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div id="received-requests" ref={receivedSectionRef} className="received-requests-section">
        <div className="make-request-card received-requests-card">
          <h2>Received Requests</h2>
          {location.state?.replyToUsername && (
            <p className="reply-context">
              Replying to {location.state.replyToUsername}. Use the form above to send a request back.
            </p>
          )}
          {loading ? (
            <p>Loading received requests...</p>
          ) : receivedRequests.length === 0 ? (
            <p>No received requests found.</p>
          ) : (
            <>
              <ul className="request-list request-list-paged received">
                {visibleReceivedRequests.map((request) => (
                  <li key={request.id} className="request-item">
                    <div className="request-meta">
                      <strong>{request.sender?.username || request.sender_id}</strong>
                      <span>{new Date(request.created_at).toLocaleString()}</span>
                    </div>
                    <p>{request.message}</p>
                  </li>
                ))}
              </ul>

              {receivedRequests.length > 6 && (
                <div className="request-pagination">
                  <button
                    type="button"
                    aria-label="Show newer received requests"
                    onClick={() => setReceivedPage((page) => Math.max(0, page - 1))}
                    disabled={receivedPage === 0}
                  >
                    &lt;
                  </button>
                  <span>
                    {receivedPage + 1} / {receivedPageCount}
                  </span>
                  <button
                    type="button"
                    aria-label="Show older received requests"
                    onClick={() => setReceivedPage((page) => Math.min(receivedPageCount - 1, page + 1))}
                    disabled={receivedPage >= receivedPageCount - 1}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
