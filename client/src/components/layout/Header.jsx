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
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  IoHomeOutline,
  IoInformationCircleOutline,
  IoNotificationsOutline,
  IoSettingsOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { useAuth } from "../../context/authContext.jsx";

function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!showLogoutModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowLogoutModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showLogoutModal]);

  return (
    <>
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
          </NavLink>
          <NavLink to="/main/settings" className="header-button">
            <IoSettingsOutline className="nav-icon" /> Settings
          </NavLink>
          <NavLink to="/main/Profile" className="header-button">
            <IoPersonOutline className="nav-icon" /> Profile
          </NavLink>
          <button
            type="button"
            className="header-button nav-links-logout"
            onClick={() => setShowLogoutModal(true)}
          >
            <IoLogOutOutline className="nav-icon" /> Log out
          </button>
        </nav>
      </header>

      {showLogoutModal && (
        <div
          className="logout-modal-overlay"
          role="presentation"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-modal-title">Sign out?</h2>
            <p>Are you sure you want to log out of MedCore?</p>
            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-btn logout-modal-btn--primary"
                onClick={handleConfirmLogout}
              >
                Yes, log out
              </button>
              <button
                type="button"
                className="logout-modal-btn logout-modal-btn--secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
