import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import { getDirectorRequests } from "../../services/directorRequestsApi.js";
import "./Notifications.css";

const READ_REQUEST_NOTIFICATIONS_KEY = "readRequestNotifications";

const markNotificationRead = (requestId) => {
  try {
    const readIds = JSON.parse(localStorage.getItem(READ_REQUEST_NOTIFICATIONS_KEY) || "[]");
    if (!readIds.includes(requestId)) {
      localStorage.setItem(READ_REQUEST_NOTIFICATIONS_KEY, JSON.stringify([...readIds, requestId]));
    }
  } catch {
    localStorage.setItem(READ_REQUEST_NOTIFICATIONS_KEY, JSON.stringify([requestId]));
  }

  window.dispatchEvent(new Event("request-notifications-updated"));
};

function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReadNotificationIds = () => {
    try {
      setReadNotificationIds(JSON.parse(localStorage.getItem(READ_REQUEST_NOTIFICATIONS_KEY) || "[]"));
    } catch {
      localStorage.removeItem(READ_REQUEST_NOTIFICATIONS_KEY);
      setReadNotificationIds([]);
    }
  };

  useEffect(() => {
    loadReadNotificationIds();

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

    load();
  }, []);

  const receivedRequests = useMemo(
    () => requests.filter((request) => request.receiver_id === user?.id),
    [requests, user?.id],
  );

  const goToReply = (request) => {
    markNotificationRead(request.id);
    loadReadNotificationIds();
    navigate("/main/make-request#received-requests", {
      state: {
        replyToUserId: request.sender_id,
        replyToUsername: request.sender?.username,
      },
    });
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <p>Requests sent to you appear here.</p>
      </div>

      <div className="notifications-card">
        {loading ? (
          <p>Loading notifications...</p>
        ) : error ? (
          <div className="notifications-message error">{error}</div>
        ) : receivedRequests.length === 0 ? (
          <p>No request notifications yet.</p>
        ) : (
          <ul className="notifications-list">
            {receivedRequests.map((request) => (
              <li
                key={request.id}
                className={
                  readNotificationIds.includes(request.id)
                    ? "notification-item"
                    : "notification-item unread"
                }
              >
                <div>
                  <div className="notification-meta">
                    <strong>{request.sender?.username || request.sender_id}</strong>
                    <span>{new Date(request.created_at).toLocaleString()}</span>
                  </div>
                  <p>{request.message}</p>
                </div>
                <button type="button" className="notification-reply" onClick={() => goToReply(request)}>
                  Reply
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Notifications;
