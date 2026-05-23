import "./Header.css";
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoInformationCircleOutline, IoNotificationsOutline, IoPersonOutline , IoLogOutOutline } from "react-icons/io5";
import { useAuth } from "../../context/authContext.jsx";
import { getDirectorRequests } from "../../services/directorRequestsApi.js";

const READ_REQUEST_NOTIFICATIONS_KEY = "readRequestNotifications";

const getReadNotificationIds = () => {
  try {
    return JSON.parse(localStorage.getItem(READ_REQUEST_NOTIFICATIONS_KEY) || "[]");
  } catch {
    localStorage.removeItem(READ_REQUEST_NOTIFICATIONS_KEY);
    return [];
  }
};

function Header() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [receivedCount, setReceivedCount] = useState(0);

  const loadNotificationCount = async () => {
    if (!isAuthenticated || !user?.id) {
      setReceivedCount(0);
      return;
    }

    try {
      const requests = await getDirectorRequests();
      const readIds = getReadNotificationIds();
      const count = (requests || []).filter(
        (request) => request.receiver_id === user.id && !readIds.includes(request.id),
      ).length;
      setReceivedCount(count);
    } catch {
      setReceivedCount(0);
    }
  };

  useEffect(() => {
    loadNotificationCount();
  }, [isAuthenticated, user?.id, location.pathname]);

  useEffect(() => {
    window.addEventListener("request-created", loadNotificationCount);
    window.addEventListener("request-notifications-updated", loadNotificationCount);
    return () => {
      window.removeEventListener("request-created", loadNotificationCount);
      window.removeEventListener("request-notifications-updated", loadNotificationCount);
    };
  }, [isAuthenticated, user?.id]);

  return (
    <header className="header-bubble">
      <nav className="nav-links">
        <NavLink to="/main/Home" className="header-button">
          <IoHomeOutline className="nav-icon" /> Home
        </NavLink>
        <NavLink to="/main/about" className="header-button">
          <IoInformationCircleOutline className="nav-icon" /> About
        </NavLink>
        <NavLink to="/main/notifications" className="header-button">
          <IoNotificationsOutline className="nav-icon" /> Notifications
          {receivedCount > 0 && <span className="notification-badge">{receivedCount}</span>}
        </NavLink>
        <NavLink to="/main/Profile" className="header-button">
          <IoPersonOutline className="nav-icon" /> Profile
        </NavLink>
        <NavLink to="/main/logout" className="header-button">
  <IoLogOutOutline className="nav-icon" /> Log out
</NavLink>
      </nav>
    </header>
  );
}

export default Header;
