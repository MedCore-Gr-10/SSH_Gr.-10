import "./Header.css";
import React from 'react';
import { NavLink } from 'react-router-dom';
import { IoHomeOutline, IoInformationCircleOutline, IoNotificationsOutline, IoSettingsOutline, IoPersonOutline , IoLogOutOutline } from "react-icons/io5";

function Header() {
  return (
    <header className="header-bubble">
      <nav className="nav-links">
        <NavLink to="/" className="header-button">
          <IoHomeOutline className="nav-icon" /> Home
        </NavLink>
        <NavLink to="/about" className="header-button">
          <IoInformationCircleOutline className="nav-icon" /> About
        </NavLink>
        <NavLink to="/Notification" className="header-button">
          <IoNotificationsOutline className="nav-icon" /> Notification
        </NavLink>
        <NavLink to="/settings" className="header-button">
          <IoSettingsOutline className="nav-icon" /> Settings
        </NavLink>
        <NavLink to="/profile" className="header-button">
          <IoPersonOutline className="nav-icon" /> Profile
        </NavLink>
        <NavLink to="/logout" className="header-button">
  <IoLogOutOutline className="nav-icon" /> Log out
</NavLink>
      </nav>
    </header>
  );
}

export default Header;